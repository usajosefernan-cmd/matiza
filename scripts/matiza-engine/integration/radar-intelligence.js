import { runAgentPanel, synthesizeAgentPanel } from '../lib/multi-agent.js';
import { mapLimit } from '../lib/async-pool.js';
import { unique } from '../lib/text-utils.js';
import { evaluateRelevance } from '../01-relevance-gate.js';
import { filterNoise } from '../04-noise-filter.js';
import { extractClaim } from '../05-claim-extractor.js';
import { routeSemanticContent } from '../02-semantic-router.js';

export async function buildDynamicRadarQueries({ trends = [], recentSignals = [], existingTopics = [], signal = null }) {
  const context = {
    trends: trends.slice(0, 30),
    recent_signals: recentSignals.slice(0, 80),
    existing_topics: existingTopics.slice(0, 80)
  };
  const panel = await runAgentPanel({
    phaseId: 'radar-query-panel',
    task: 'Diseñar consultas de búsqueda avanzadas para descubrir debates y afirmaciones en redes españolas sobre temas sensibles (vivienda, inmigración, subsidios, impuestos, leyes) que utilicen palabras clave de alerta o conflicto (ej. "cuidado", "alarma", "urgente", "atención", "peligro", "polémica", "indignante", "advertencia", "se viraliza"). Queda estrictamente PROHIBIDO usar las palabras "bulo" o "falso" en las consultas.',
    context,
    agents: [
      { id: 'social-scout', role: 'Busca conversaciones virales en X/Reddit con picos de visitas y palabras de alarma ("cuidado", "alerta", "urgente") sobre temas de actualidad española.' },
      { id: 'claim-scout', role: 'Busca debates y polémicas sobre leyes, impuestos y reformas institucionales sensibles donde se afirmen cosas contradictorias.' },
      { id: 'harm-scout', role: 'Busca reclamos que causen sorpresa o alarma social sobre derechos civiles, libertades públicas o convivencia.' },
      { id: 'consumer-scout', role: 'Busca discusiones masivas que alerten sobre alquileres, desahucios, subsidios o inflación en España.' }
    ],
    signal
  });

  try {
    const result = await synthesizeAgentPanel({
      phaseId: 'radar-query-synthesis',
      objective: 'Sintetizar consultas de búsqueda dinámicas basadas estrictamente en términos de alarma, urgencia, cuidado o polémica, sin usar jamás los términos "bulo" o "falso".',
      context,
      panel,
      schema: {
        queries: [{ query: '...', platforms: ['YouTube','X','Reddit'], reason: '...', priority: 0 }],
        exclusions: ['...'],
        watch_terms: ['...']
      },
      signal
    });
    const queries = (result.queries || []).map(entry => typeof entry === 'string' ? entry : entry.query);
    return {
      queries: unique([...trends, ...queries]).slice(0, Number.parseInt(process.env.RADAR_QUERY_LIMIT || '24', 10)),
      query_plan: result,
      agent_panel: panel
    };
  } catch (error) {
    return {
      queries: unique(trends).slice(0, 12),
      query_plan: { error: error.message },
      agent_panel: panel,
      fallback: true
    };
  }
}

export async function triageRadarItems(items, { signal = null, concurrency = Number.parseInt(process.env.RADAR_TRIAGE_CONCURRENCY || '4', 10) } = {}) {
  return mapLimit(items, concurrency, async item => {
    const metrics = {
      ...(item.metrics || {}),
      views: item.views,
      score: item.score,
      comments: item.comments,
      shares: item.shares,
      followers: item.followers
    };
    const text = `${item.title || ''}\n${item.description || ''}`.trim();
    const relevance = await evaluateRelevance(text, item.platform || 'Desconocida', metrics, signal);
    if (!relevance.should_process) return { item, relevance, selected: false, action: relevance.recommended_action };
    const noise = await filterNoise(text, item.platform || 'Desconocida', relevance, signal);
    if (noise.is_noise && !noise.requires_processing) return { item, relevance, noise, selected: false, action: noise.keep_monitoring ? 'monitor_only' : 'ignore' };
    const claim = await extractClaim(text, signal);
    const route = await routeSemanticContent(claim.detected_claim, item.suggested_topic || 'General', signal);
    return {
      item,
      relevance,
      noise,
      claim,
      route,
      selected: true,
      action: relevance.recommended_action || 'queue'
    };
  });
}
