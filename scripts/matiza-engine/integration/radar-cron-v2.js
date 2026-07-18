#!/usr/bin/env node
/**
 * Radar dinámico de descubrimiento para NewNews/MATIZA.
 *
 * Este collector NO inventa viralidad: si la fuente no entrega métricas reales,
 * usa recurrencia entre consultas/dominos como señal de descubrimiento y lo
 * deja indicado en metrics_json.
 *
 * Para redes sociales reales conecte un gateway en ANTIGRAVITY_SEARCH_URL /
 * SEARCH_API_URL, SearXNG, o adapte collectExternalConnectors().
 */
import { getDb } from '../config.js';
import { buildDynamicRadarQueries, triageRadarItems } from './radar-intelligence.js';
import { searchMany } from '../lib/search-providers.js';
import { ensureImprovedSchema } from '../lib/schema-guard.js';
import { insertFlexible, uid } from '../lib/db-utils.js';
import { getDomain, normalizeText, normalizeUrl, textFingerprint, unique } from '../lib/text-utils.js';
import { isMainModule } from '../lib/is-main.js';
import { scrapeRedditTrends, scrapeSocialMediaSearch } from '../lib/social-scrapers.js';

function arg(name, fallback = null) {
  const prefix = `--${name}=`;
  const found = process.argv.find(value => value.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function safeAll(db, sql, fallback = []) {
  try { return db.prepare(sql).all(); } catch { return fallback; }
}

function platformFromUrl(url = '') {
  const domain = getDomain(url);
  if (/youtube\.com|youtu\.be/.test(domain)) return 'YouTube';
  if (/twitter\.com|x\.com|nitter/.test(domain)) return 'X';
  if (/tiktok\.com/.test(domain)) return 'TikTok';
  if (/instagram\.com/.test(domain)) return 'Instagram';
  if (/reddit\.com/.test(domain)) return 'Reddit';
  if (/t\.me|telegram/.test(domain)) return 'Telegram';
  return domain ? `Web:${domain}` : 'Web';
}

function buildDiscoverySignals(results) {
  const byUrl = new Map();
  for (const result of results || []) {
    const url = normalizeUrl(result.url);
    if (!url) continue;
    const key = url || textFingerprint(`${result.title} ${result.snippet}`);
    const existing = byUrl.get(key) || {
      url,
      title: result.title || '',
      description: result.snippet || '',
      platform: platformFromUrl(url),
      queries: new Set(),
      providers: new Set(),
      domains: new Set(),
      occurrences: 0
    };
    existing.occurrences += 1;
    if (result.query) existing.queries.add(result.query);
    if (result.provider) existing.providers.add(result.provider);
    if (getDomain(url)) existing.domains.add(getDomain(url));
    if ((result.snippet || '').length > existing.description.length) existing.description = result.snippet;
    byUrl.set(key, existing);
  }

  return [...byUrl.values()].map(item => {
    // Señal de descubrimiento, NO visitas reales.
    const recurrence = Math.min(10, item.occurrences + item.queries.size + item.providers.size);
    return {
      title: item.title,
      description: item.description,
      url: item.url,
      platform: item.platform,
      virality_score: recurrence,
      metrics: {
        discovery_recurrence: item.occurrences,
        matching_queries: [...item.queries],
        search_providers: [...item.providers],
        actual_engagement_known: false,
        metric_source: 'search_recurrence_not_social_views'
      }
    };
  }).sort((a, b) => b.virality_score - a.virality_score);
}

async function collectExternalConnectors(queries) {
  console.log(`[Radar Collector] Buscando señales virales reales en redes (Reddit, X, TikTok, YouTube)...`);
  try {
    const [redditItems, socialSearchItems] = await Promise.all([
      scrapeRedditTrends(),
      scrapeSocialMediaSearch(queries.slice(0, 3)) // Limitar para velocidad
    ]);
    const total = [...redditItems, ...socialSearchItems];
    console.log(`[Radar Collector] Recopiladas ${redditItems.length} señales de Reddit y ${socialSearchItems.length} señales de X/TikTok/YouTube.`);
    return total;
  } catch (err) {
    console.warn('[Radar Collector] Error en collectExternalConnectors:', err.message);
    return [];
  }
}

function findTopicTitle(route, existingTopics) {
  const match = route?.topic_matches?.[0] || route?.topic_match || null;
  const id = match?.existing_topic_id;
  return existingTopics.find(topic => String(topic.id) === String(id))?.title || null;
}

function storeResult(db, triaged, existingTopics) {
  const { item, relevance, claim, route, selected, action } = triaged;
  const status = selected ? 'pendiente' : (action === 'monitor_only' ? 'monitorizando' : 'descartado');
  const topicTitle = route ? findTopicTitle(route, existingTopics) : null;
  const now = new Date().toISOString();
  const id = `radar-${textFingerprint(item.url || `${item.title}-${item.description}`).slice(0, 24)}`;

  insertFlexible(db, 'scraped_items', {
    id,
    platform: item.platform,
    url: item.url,
    text: `${item.title || ''}\n${item.description || ''}`.trim(),
    author_public_name: null,
    metrics_json: JSON.stringify({
      ...(item.metrics || {}),
      relevance,
      selection_action: action
    }),
    detected_claim: claim?.detected_claim || null,
    suggested_topic: topicTitle,
    virality_score: Number(item.virality_score || relevance?.virality_score || 0),
    risk_score: Number(relevance?.harm_score || 0),
    status,
    created_at: now
  });

  return { id, status, topic: topicTitle, claim: claim?.detected_claim || null };
}

export async function runRadarV2({ dryRun = false, queryLimit = null } = {}) {
  const db = getDb();
  ensureImprovedSchema(db);
  const recentSignals = safeAll(db, `
    SELECT text, platform, detected_claim, suggested_topic, virality_score, risk_score, created_at
    FROM scraped_items ORDER BY created_at DESC LIMIT 120
  `);
  const existingTopics = safeAll(db, `
    SELECT id, title, slug, description, category
    FROM topics WHERE status = 'activo' ORDER BY updated_at DESC LIMIT 120
  `);
  db.close();

  const seedTrends = unique(
    recentSignals
      .filter(signal => Number(signal.virality_score || 0) >= 4)
      .map(signal => signal.detected_claim || signal.suggested_topic || normalizeText(signal.text).split(' ').slice(0, 8).join(' '))
      .filter(Boolean)
  ).slice(0, 20);

  const queryPlan = await buildDynamicRadarQueries({
    trends: seedTrends,
    recentSignals,
    existingTopics
  });
  const limit = Number(queryLimit || process.env.RADAR_QUERY_LIMIT || 24);
  const queries = queryPlan.queries.slice(0, limit);
  if (!queries.length) {
    return { ok: true, queries: [], discovered: 0, selected: 0, message: 'No hay consultas dinámicas suficientes.' };
  }

  const [webResults, connectorItems] = await Promise.all([
    searchMany(queries, {
      limit: Number(process.env.RADAR_RESULTS_PER_QUERY || 8),
      recencyDays: Number(process.env.RADAR_RECENCY_DAYS || 3)
    }),
    collectExternalConnectors(queries)
  ]);
  const discovered = [...buildDiscoverySignals(webResults), ...connectorItems]
    .slice(0, Number(process.env.RADAR_MAX_CANDIDATES || 100));
  const triaged = await triageRadarItems(discovered, {
    concurrency: Number(process.env.RADAR_TRIAGE_CONCURRENCY || 4)
  });

  let stored = [];
  if (!dryRun) {
    const writeDb = getDb();
    ensureImprovedSchema(writeDb);
    stored = triaged
      .filter(result => result.selected || result.action === 'monitor_only')
      .map(result => storeResult(writeDb, result, existingTopics));
    writeDb.close();
  }

  return {
    ok: true,
    dry_run: dryRun,
    query_count: queries.length,
    queries,
    query_plan: queryPlan.query_plan,
    raw_search_results: webResults.length,
    discovered: discovered.length,
    selected: triaged.filter(result => result.selected).length,
    monitoring: triaged.filter(result => result.action === 'monitor_only').length,
    ignored: triaged.filter(result => !result.selected && result.action !== 'monitor_only').length,
    stored
  };
}

if (isMainModule(import.meta.url)) {
  runRadarV2({
    dryRun: process.argv.includes('--dry-run'),
    queryLimit: arg('query-limit')
  }).then(result => {
    console.log(JSON.stringify(result, null, 2));
  }).catch(error => {
    console.error('[Radar V2]', error);
    process.exit(1);
  });
}
