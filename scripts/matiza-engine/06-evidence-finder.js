import { getDb } from './config.js';
import { getTopicCache, getClaimCache } from './cache.js';
import { runSearchSwarm } from './lib/search-swarm.js';
import { ensureImprovedSchema } from './lib/schema-guard.js';
import { textFingerprint } from './lib/text-utils.js';

function claimSeedSources(claimText, topicId) {
  const seeds = [];
  const cachedClaim = getClaimCache(claimText);
  if (cachedClaim?.previous_sources?.length) seeds.push(...cachedClaim.previous_sources);
  if (topicId) {
    const topicCache = getTopicCache(topicId);
    if (topicCache?.trusted_sources?.length) seeds.push(...topicCache.trusted_sources);
  }
  return seeds;
}

export async function findEvidence(claimText, topicId, strategy = {}, signal = null) {
  console.log(`[Evidence Finder] Iniciando búsqueda multiagente para: "${claimText.substring(0, 70)}..."`);
  const db = getDb();
  ensureImprovedSchema(db);
  let topicTitle = '';
  try {
    topicTitle = topicId ? (db.prepare('SELECT title FROM topics WHERE id = ?').get(topicId)?.title || '') : '';
  } catch {}

  const seedSources = claimSeedSources(claimText, topicId);
  const bundle = await runSearchSwarm({
    claimText,
    topicTitle,
    strategy,
    seedSources,
    signal
  });

  try {
    const auditId = `search-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    db.prepare(`
      INSERT INTO search_audit (id, claim_hash, query, provider, result_count, selected_count, payload_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      auditId,
      textFingerprint(claimText),
      bundle.queries.join(' || '),
      process.env.ANTIGRAVITY_SEARCH_URL ? 'antigravity-gateway' : (process.env.SEARXNG_URL ? 'searxng' : 'fallback-chain'),
      bundle.raw_result_count,
      bundle.sources.length,
      JSON.stringify({
        evidence_sufficiency: bundle.evidence_sufficiency,
        missing_evidence: bundle.missing_evidence,
        primary_sources: bundle.primary_sources,
        content_backed_sources: bundle.content_backed_sources
      })
    );
  } catch (error) {
    console.warn('[Evidence Finder] No se pudo guardar auditoría:', error.message);
  } finally {
    db.close();
  }

  return {
    sources: bundle.sources.map(source => ({
      title: source.title,
      url: source.url,
      source_type: source.source_type,
      authority_level: source.authority_level,
      quote_or_summary: source.evidence_quote || source.snippet || '',
      evidence_quote: source.evidence_quote,
      quote_verified: source.quote_verified,
      relation_to_claim: source.relation_to_claim,
      relevance_score: source.relevance_score,
      fetched: source.fetched,
      audit_reason: source.audit_reason
    })),
    cached: seedSources.length > 0,
    search_queries: bundle.queries,
    evidence_sufficiency: bundle.evidence_sufficiency,
    missing_evidence: bundle.missing_evidence,
    needs_manual_source_check: bundle.needs_manual_source_check,
    primary_sources: bundle.primary_sources,
    content_backed_sources: bundle.content_backed_sources,
    agent_audit: {
      query_panel: bundle.query_panel,
      audit_panel: bundle.audit_panel
    }
  };
}
