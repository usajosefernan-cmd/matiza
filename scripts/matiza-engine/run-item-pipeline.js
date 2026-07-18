import { getDb, asyncLocalStorage } from './config.js';
import { evaluateRelevance } from './01-relevance-gate.js';
import { filterNoise } from './04-noise-filter.js';
import { extractClaim } from './05-claim-extractor.js';
import { routeSemanticContent } from './02-semantic-router.js';
import { planSourceStrategy } from './03-source-strategy-planner.js';
import { findEvidence } from './06-evidence-finder.js';
import { verifyClaim } from './07-verifier.js';
import { writeArticle } from './08-article-writer.js';
import { checkQuality } from './09-quality-gate.js';
import { queueForReview } from './10-review-queue.js';
import { writeSocialPosts } from './11-social-writer.js';
import { ensureImprovedSchema } from './lib/schema-guard.js';
import { insertFlexible, slugify, uid, updateFlexible } from './lib/db-utils.js';
import { safeJsonParse } from './lib/text-utils.js';

function recordArtifact(db, itemId, phase, payload, status = 'ok') {
  try {
    insertFlexible(db, 'phase_artifacts', {
      id: uid('artifact'),
      item_id: itemId,
      phase,
      payload_json: JSON.stringify(payload),
      status,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.warn(`[Pipeline] No se pudo guardar artifact ${phase}: ${error.message}`);
  }
}

function chooseTopic(route) {
  return route?.topic_matches?.[0]?.existing_topic_id || route?.topic_match?.existing_topic_id || null;
}

export async function processItem(item, { dryRun = false, signal = null } = {}) {
  if (!item?.id || !item?.text) throw new Error('Item inválido: requiere id y text.');
  return asyncLocalStorage.run({ itemId: item.id }, async () => {
    const metrics = safeJsonParse(item.metrics_json, {}) || {};
    const artifacts = {};

    artifacts.relevance = await evaluateRelevance(item.text, item.platform || 'Desconocida', { ...metrics, virality_score: item.virality_score }, signal);
    if (!artifacts.relevance.should_process) {
      if (!dryRun) {
        const db = getDb();
        updateFlexible(db, 'scraped_items', { status: artifacts.relevance.recommended_action === 'monitor_only' ? 'monitorizando' : 'descartado' }, 'id = ?', [item.id]);
        db.close();
      }
      return { ok: true, stopped_at: 'relevance', item_id: item.id, artifacts };
    }

    artifacts.noise = await filterNoise(item.text, item.platform || 'Desconocida', artifacts.relevance, signal);
    if (artifacts.noise.is_noise && !artifacts.noise.requires_processing) {
      if (!dryRun) {
        const db = getDb();
        updateFlexible(db, 'scraped_items', { status: artifacts.noise.keep_monitoring ? 'monitorizando' : 'descartado' }, 'id = ?', [item.id]);
        db.close();
      }
      return { ok: true, stopped_at: 'noise', item_id: item.id, artifacts };
    }

    artifacts.claim = await extractClaim(item.text, signal);
    const claimText = artifacts.claim.detected_claim;
    artifacts.route = await routeSemanticContent(claimText, item.suggested_topic || 'General', signal);
    const topicId = chooseTopic(artifacts.route);
    let topicTitle = item.suggested_topic || 'General';
    if (topicId) {
      const db = getDb();
      topicTitle = db.prepare('SELECT title FROM topics WHERE id = ?').get(topicId)?.title || topicTitle;
      db.close();
    }

    artifacts.strategy = await planSourceStrategy(claimText, topicTitle, artifacts.route.claim_type || 'General', signal);
    artifacts.evidence = await findEvidence(claimText, topicId, artifacts.strategy, signal);
    artifacts.verification = await verifyClaim(claimText, artifacts.evidence.sources, signal);
    artifacts.article = await writeArticle(claimText, artifacts.verification, artifacts.evidence.sources, signal);
    artifacts.quality = await checkQuality(artifacts.article, artifacts.verification.verdict, artifacts.evidence.sources, signal);

    if (dryRun) return { ok: artifacts.quality.passed, dry_run: true, item_id: item.id, topic_id: topicId, artifacts };

    const db = getDb();
    ensureImprovedSchema(db);
    for (const [phase, payload] of Object.entries(artifacts)) recordArtifact(db, item.id, phase, payload, payload?.ok === false ? 'error' : 'ok');

    const articleId = uid('art');
    const status = artifacts.quality.passed ? 'borrador' : 'necesita_revision_ia';
    const now = new Date().toISOString();
    insertFlexible(db, 'articles', {
      id: articleId,
      topic_id: topicId,
      slug: `${slugify(artifacts.article.title)}-${articleId.slice(-6)}`,
      title: artifacts.article.title,
      subtitle: artifacts.article.subtitle,
      claim: claimText,
      origin_platform: item.platform,
      origin_url: item.url,
      origin_summary: String(item.text).slice(0, 1000),
      origin_date: item.origin_date,
      category: artifacts.route.claim_type || 'General',
      verdict: artifacts.verification.verdict,
      confidence: artifacts.verification.confidence,
      summary: artifacts.article.summary,
      explanation: artifacts.article.explanation,
      what_is_true: artifacts.verification.what_is_true,
      what_is_false: artifacts.verification.what_is_false,
      what_lacks_context: artifacts.verification.what_lacks_context,
      what_is_not_proven: artifacts.verification.what_is_not_proven,
      status,
      human_review_required: 1,
      created_at: now,
      updated_at: now,
      trick_used: artifacts.article.trick_used,
      matiza_score: artifacts.article.matiza_score,
      emoji_tag: artifacts.article.emoji_tag,
      infographic_svg: artifacts.article.infographic_svg
    });

    for (const source of artifacts.evidence.sources) {
      insertFlexible(db, 'sources', {
        id: uid('src'),
        article_id: articleId,
        title: source.title,
        url: source.url,
        source_type: source.source_type,
        authority_level: source.authority_level,
        quote_or_summary: source.evidence_quote || source.quote_or_summary || '',
        date_accessed: now
      });
    }
    updateFlexible(db, 'scraped_items', { status: status === 'borrador' ? 'revision_humana' : status, detected_claim: claimText, suggested_topic: topicTitle }, 'id = ?', [item.id]);
    db.close();

    queueForReview(articleId, artifacts.quality.passed
      ? 'Borrador aprobado por quality gate; requiere aprobación humana rápida.'
      : `Quality gate bloqueado: ${(artifacts.quality.corrections_required || []).join(' | ')}`);

    if (artifacts.quality.passed) {
      try {
        const social = await writeSocialPosts(artifacts.article.title, artifacts.article.subtitle, artifacts.verification.verdict, claimText, signal);
        artifacts.social = Array.isArray(social) ? social : (social.posts || []);
        const socialDb = getDb();
        for (const post of artifacts.social) {
          insertFlexible(socialDb, 'social_posts', {
            id: uid('social'),
            article_id: articleId,
            platform: post.platform,
            format: post.format || 'copy',
            content: post.content,
            status: 'borrador'
          });
        }
        socialDb.close();
      } catch (error) {
        artifacts.social_error = error.message;
      }
    }

    return { ok: artifacts.quality.passed, item_id: item.id, article_id: articleId, topic_id: topicId, status, artifacts };
  });
}
