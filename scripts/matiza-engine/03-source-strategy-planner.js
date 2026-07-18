import { runAgentPanel, synthesizeAgentPanel } from './lib/multi-agent.js';
import { getSourceStrategyCache, setSourceStrategyCache } from './cache.js';
import { normalizeText, unique } from './lib/text-utils.js';

function semanticArea(topicTitle, claimType) {
  return normalizeText(`${claimType || 'general'} ${topicTitle || 'general'}`).split(' ').slice(0, 8).join('-') || 'general';
}

export async function planSourceStrategy(claimText, topicTitle, claimType = 'General', signal = null) {
  const area = semanticArea(topicTitle, claimType);
  const cached = getSourceStrategyCache(area);
  if (cached?.validation_rules?.search_queries?.length) {
    return {
      source_strategy: {
        required_source_types: cached.source_types,
        preferred_authority_level: 'Alta',
        minimum_sources: cached.validation_rules.minimum_sources || 2,
        needs_original_source: cached.validation_rules.needs_original_source !== false,
        needs_context_source: cached.validation_rules.needs_context_source !== false,
        needs_counter_source: cached.validation_rules.needs_counter_source !== false,
        manual_check_required: false
      },
      search_queries: cached.validation_rules.search_queries,
      preferred_sources: cached.preferred_sources,
      reuse_from_cache: true,
      semantic_area: area,
      reason: 'Estrategia reutilizada del último uso exitoso para un área semántica equivalente.'
    };
  }

  const context = { claim: claimText, topic: topicTitle, claim_type: claimType, semantic_area: area };
  const panel = await runAgentPanel({
    phaseId: '03-panel',
    task: 'Diseñar una estrategia de fuentes adaptada al claim. No usar una lista cerrada; decidir dinámicamente qué documentos, datos, testimonios, contexto y contraevidencia se necesitan.',
    context,
    agents: [
      { id: 'original-source', role: 'Identifica la fuente original exacta que originó la afirmación o el dato.' },
      { id: 'institutional-source', role: 'Define qué organismos, registros o documentos primarios pueden verificar el claim.' },
      { id: 'method-source', role: 'Define fuentes metodológicas, comparativas o temporales necesarias para interpretar correctamente.' },
      { id: 'counter-source', role: 'Diseña búsquedas adversariales que puedan refutar o limitar la interpretación inicial.' }
    ],
    signal
  });

  try {
    const result = await synthesizeAgentPanel({
      phaseId: '03',
      objective: 'Crear un plan de búsqueda diverso, eficiente y auditable.',
      context,
      panel,
      schema: {
        source_strategy: {
          required_source_types: ['...'],
          preferred_authority_level: 'Máxima|Alta|Media',
          minimum_sources: 2,
          needs_original_source: true,
          needs_context_source: true,
          needs_counter_source: true,
          manual_check_required: false
        },
        search_queries: ['...'],
        preferred_sources: ['dominio u organismo, no URL inventada'],
        reason: '...'
      },
      signal
    });

    result.search_queries = unique(result.search_queries || []).slice(0, 12);
    result.source_strategy = result.source_strategy || {};
    result.source_strategy.minimum_sources = Math.max(2, Number(result.source_strategy.minimum_sources || 2));
    result.reuse_from_cache = false;
    result.semantic_area = area;
    result.agent_panel = panel;

    setSourceStrategyCache(area, {
      source_types: result.source_strategy.required_source_types || [],
      preferred_sources: result.preferred_sources || [],
      validation_rules: {
        search_queries: result.search_queries,
        minimum_sources: result.source_strategy.minimum_sources,
        needs_original_source: result.source_strategy.needs_original_source,
        needs_context_source: result.source_strategy.needs_context_source,
        needs_counter_source: result.source_strategy.needs_counter_source
      }
    });
    return result;
  } catch (error) {
    return {
      source_strategy: {
        required_source_types: ['fuente original', 'fuente primaria independiente', 'fuente de contexto'],
        preferred_authority_level: 'Alta',
        minimum_sources: 2,
        needs_original_source: true,
        needs_context_source: true,
        needs_counter_source: true,
        manual_check_required: true
      },
      search_queries: unique([
        `"${claimText}"`,
        `${claimText} fuente original`,
        `${claimText} datos oficiales España`,
        `${claimText} metodología contexto`
      ]),
      preferred_sources: [],
      reuse_from_cache: false,
      semantic_area: area,
      reason: `Fallback dinámico mínimo: ${error.message}`,
      fallback: true
    };
  }
}
