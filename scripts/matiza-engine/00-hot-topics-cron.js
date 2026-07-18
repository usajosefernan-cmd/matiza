import { getDb } from './config.js';
import { runAgentPanel, synthesizeAgentPanel } from './lib/multi-agent.js';
import { clusterItems } from './lib/clustering.js';
import { ensureImprovedSchema } from './lib/schema-guard.js';
import { normalizeText } from './lib/text-utils.js';
import { isMainModule } from './lib/is-main.js';

function slugify(value) {
  return normalizeText(value).replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 90) || `tema-${Date.now()}`;
}

export async function detectHotTopics(isDryRun = false, signal = null) {
  const db = getDb();
  ensureImprovedSchema(db);
  const recentRadarItems = db.prepare(`
    SELECT id, text, platform, detected_claim, suggested_topic, virality_score, risk_score, created_at
    FROM scraped_items
    WHERE created_at >= datetime('now', '-7 days')
    ORDER BY COALESCE(virality_score, 0) DESC, created_at DESC
    LIMIT ?
  `).all(Number.parseInt(process.env.HOT_TOPICS_MAX_ITEMS || '500', 10));
  const existingTopics = db.prepare("SELECT id, title, slug, description, category FROM topics WHERE status = 'activo'").all();

  if (!recentRadarItems.length) {
    db.close();
    return [];
  }

  const clusters = clusterItems(recentRadarItems, Number.parseFloat(process.env.TOPIC_CLUSTER_THRESHOLD || '0.30'))
    .slice(0, Number.parseInt(process.env.HOT_TOPICS_MAX_CLUSTERS || '30', 10));
  const compactClusters = clusters.map(cluster => ({
    id: cluster.id,
    size: cluster.items.length,
    max_virality: cluster.max_virality,
    max_risk: cluster.max_risk,
    samples: cluster.items.slice(0, 5).map(item => ({
      id: item.id,
      platform: item.platform,
      claim: item.detected_claim,
      text: String(item.text || '').slice(0, 300),
      virality: item.virality_score,
      risk: item.risk_score
    }))
  }));

  const context = { clusters: compactClusters, existing_topics: existingTopics };
  const panel = await runAgentPanel({
    phaseId: '00-panel',
    task: 'Evaluar qué clusters representan preocupaciones sociales sostenidas en España y cuáles son ruido, noticia aislada o contenido comercial menor.',
    context,
    agents: [
      { id: 'heat', role: 'Evalúa crecimiento, recurrencia y calor social sin confundir volumen con importancia.' },
      { id: 'public-impact', role: 'Evalúa impacto sobre derechos, salud, dinero, convivencia, justicia o democracia.' },
      { id: 'vertical-architect', role: 'Decide si conviene actualizar un vertical existente, crear uno nuevo o mantenerlo como pieza aislada.' },
      { id: 'noise-critic', role: 'Busca falsos positivos, ruido comercial, entretenimiento o noticias sin valor estructural.' }
    ],
    signal
  });

  let topics = [];
  try {
    const synthesis = await synthesizeAgentPanel({
      phaseId: '00',
      objective: 'Proponer verticales vivos de forma dinámica y prudente. No crear temas automáticamente por una única pieza.',
      context,
      panel,
      schema: {
        topics: [{
          cluster_id: 'cluster-1',
          title: '...',
          slug: '...',
          public_concern_summary: '...',
          why_it_matters: '...',
          main_confusions: ['...'],
          priority_score: 0,
          social_heat_score: 0,
          risk_score: 0,
          evergreen_score: 0,
          recommended_action: 'update_existing|propose_new|piece_only|ignore',
          merge_with_existing_topic: null,
          confidence: 0
        }]
      },
      signal
    });
    topics = Array.isArray(synthesis.topics) ? synthesis.topics : [];
  } catch (error) {
    console.warn('[Hot Topics] Síntesis no disponible:', error.message);
    topics = compactClusters.slice(0, 10).map(cluster => ({
      cluster_id: cluster.id,
      title: `Tema emergente ${cluster.id}`,
      slug: cluster.id,
      public_concern_summary: cluster.samples.map(sample => sample.claim || sample.text).join(' | ').slice(0, 800),
      why_it_matters: 'Requiere evaluación editorial.',
      main_confusions: [],
      priority_score: Math.min(10, cluster.max_virality),
      social_heat_score: Math.min(10, cluster.max_virality),
      risk_score: Math.min(10, cluster.max_risk),
      evergreen_score: 0,
      recommended_action: 'piece_only',
      merge_with_existing_topic: null,
      confidence: 0.2,
      fallback: true
    }));
  }

  const clusterMap = new Map(clusters.map(cluster => [cluster.id, cluster]));
  const normalized = topics.map(topic => ({
    ...topic,
    slug: slugify(topic.slug || topic.title),
    topic_id: topic.merge_with_existing_topic || `candidate-${slugify(topic.slug || topic.title)}`,
    needs_new_vertical: topic.recommended_action === 'propose_new',
    source_map_status: 'Pendiente de estrategia dinámica de fuentes',
    cluster_items: clusterMap.get(topic.cluster_id)?.items?.map(item => item.id) || []
  }));

  if (!isDryRun) {
    const insert = db.prepare(`
      INSERT OR REPLACE INTO topic_candidates
      (id, slug, title, summary, why_it_matters, cluster_json, score_json, suggested_topic_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', datetime('now'), datetime('now'))
    `);
    for (const topic of normalized) {
      if (!['update_existing', 'propose_new'].includes(topic.recommended_action)) continue;
      insert.run(
        topic.topic_id,
        topic.slug,
        topic.title,
        topic.public_concern_summary,
        topic.why_it_matters,
        JSON.stringify(topic.cluster_items),
        JSON.stringify({
          priority: topic.priority_score,
          heat: topic.social_heat_score,
          risk: topic.risk_score,
          evergreen: topic.evergreen_score,
          confidence: topic.confidence
        }),
        topic.merge_with_existing_topic
      );
    }
  }

  db.close();
  return normalized;
}

if (isMainModule(import.meta.url)) {
  detectHotTopics(process.argv.includes('--dry-run')).then(result => console.log(JSON.stringify(result, null, 2))).catch(error => {
    console.error(error);
    process.exit(1);
  });
}
