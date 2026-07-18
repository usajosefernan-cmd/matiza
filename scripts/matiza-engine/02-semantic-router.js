import { getDb } from './config.js';
import { runAgentPanel, synthesizeAgentPanel } from './lib/multi-agent.js';
import { jaccardSimilarity, normalizeText } from './lib/text-utils.js';

function rankTopics(claimText, topics) {
  return topics
    .map(topic => ({
      ...topic,
      lexical_similarity: jaccardSimilarity(claimText, `${topic.title} ${topic.description || ''} ${topic.category || ''}`)
    }))
    .sort((a, b) => b.lexical_similarity - a.lexical_similarity);
}

export async function routeSemanticContent(claimText, suggestedTopic = 'General', signal = null) {
  const db = getDb();
  let existingTopics = [];
  try {
    existingTopics = db.prepare("SELECT id, title, slug, description, category FROM topics WHERE status = 'activo'").all();
  } finally {
    db.close();
  }

  const ranked = rankTopics(claimText, existingTopics);
  const top = ranked.slice(0, 8);


  const context = {
    claim: claimText,
    scraper_suggestion: suggestedTopic,
    candidate_topics: top.map(topic => ({
      id: topic.id,
      title: topic.title,
      description: topic.description,
      category: topic.category,
      lexical_similarity: topic.lexical_similarity
    }))
  };

  const panel = await runAgentPanel({
    phaseId: '02-panel',
    task: 'Enrutar el claim a uno o varios verticales existentes o justificar la creación de un nuevo vertical. Evita listas cerradas y no fuerces coincidencias.',
    context,
    agents: [
      { id: 'semantic-editor', role: 'Evalúa significado, intención y tema central del claim.' },
      { id: 'taxonomy-editor', role: 'Evalúa consistencia de taxonomía y evita duplicar verticales.' },
      { id: 'public-concern-editor', role: 'Evalúa si el asunto merece vertical propio estable o solo una pieza dentro de otro tema.' }
    ],
    signal
  });

  try {
    const result = await synthesizeAgentPanel({
      phaseId: '02',
      objective: 'Obtener un enrutamiento dinámico, compatible con múltiples temas y sin hardcodear personas o asuntos.',
      context,
      panel,
      schema: {
        content_type: 'Explicativo|Declaración|Datos|Rumor|Bulo|Video|Captura|Comercial',
        claim_type: 'Legal|Social|Económico|Sanitario|Judicial|Político|Comercial|Otro',
        topic_matches: [{ existing_topic_id: 'id', confidence: 0.0 }],
        category_tags: ['...'],
        needs_new_topic: false,
        proposed_topic: { title: '...', slug: '...', rationale: '...' },
        routing_reason: '...'
      },
      signal
    });

    result.topic_matches = Array.isArray(result.topic_matches) ? result.topic_matches
      .filter(match => existingTopics.some(topic => topic.id === match.existing_topic_id))
      .sort((a, b) => Number(b.confidence) - Number(a.confidence)) : [];
    result.topic_match = result.topic_matches[0] ? { ...result.topic_matches[0], should_merge: true } : null;
    result.needs_new_topic = Boolean(result.needs_new_topic && result.topic_matches.length === 0);
    result.agent_panel = panel;
    return result;
  } catch (error) {
    const fallback = top[0];
    const confidence = fallback?.lexical_similarity || 0;
    return {
      content_type: 'Pieza verificable',
      claim_type: 'Otro',
      topic_matches: confidence >= 0.25 ? [{ existing_topic_id: fallback.id, confidence }] : [],
      topic_match: confidence >= 0.25 ? { existing_topic_id: fallback.id, confidence, should_merge: true } : null,
      category_tags: fallback?.category ? [fallback.category] : [],
      needs_new_topic: confidence < 0.25,
      proposed_topic: confidence < 0.25 ? { title: normalizeText(suggestedTopic || claimText).slice(0, 80), slug: null, rationale: 'Sin coincidencia suficiente.' } : null,
      routing_reason: `Fallback semántico local: ${error.message}`,
      fallback: true
    };
  }
}
