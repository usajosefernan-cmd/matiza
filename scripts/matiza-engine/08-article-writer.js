import { runAgentPanel, synthesizeAgentPanel } from './lib/multi-agent.js';

function compactSources(sources = []) {
  return sources.map((source, index) => ({
    id: `S${index + 1}`,
    title: source.title,
    url: source.url,
    authority_level: source.authority_level,
    relation_to_claim: source.relation_to_claim,
    quote: source.evidence_quote || source.quote_or_summary || ''
  }));
}

export async function writeArticle(claimText, verificationData, sources = [], signal = null) {
  console.log('[Article Writer] Redacción multiagente y trazable...');
  const sourceList = compactSources(sources);
  const context = {
    claim: claimText,
    verification: verificationData,
    sources: sourceList
  };

  const panel = await runAgentPanel({
    phaseId: '08-panel',
    task: 'Proponer la estructura de un artículo analítico que desglose los matices del debate sensible (contexto, puntos grises, qué es opinión y qué son hechos contrastados), sin inventar datos y referenciando fielmente las fuentes oficiales por su ID.',
    context,
    agents: [
      { id: 'context-writer', role: 'Redacta con precisión aportando el contexto legal, histórico o social del debate, usando las fuentes oficiales de referencia.' },
      { id: 'matices-editor', role: 'Identifica y redacta los puntos grises y matices: separa con claridad la opinión o debate ideológico legítimo de los datos y cifras reales tergiversados.' },
      { id: 'debate-editor', role: 'Asegura un tono estrictamente neutral, evitando sesgos partidistas o juicios morales, permitiendo al lector entender ambas posturas del debate social.' }
    ],
    signal
  });

  const result = await synthesizeAgentPanel({
    phaseId: '08',
    objective: 'Crear un artículo claro, visual, neutral y estrictamente coherente con el veredicto y las fuentes.',
    context,
    panel,
    schema: {
      title: '...',
      subtitle: '...',
      summary: '...',
      explanation: '> **En sencillo:** ...',
      what_we_know: ['...'],
      what_we_do_not_know: ['...'],
      source_refs: ['S1'],
      trick_used: 'cherry-picking|falso dilema|culpa colectiva|dato sin base|video recortado|autoridad falsa|miedo/urgencia|promocion encubierta|ninguno',
      matiza_score: 0,
      emoji_tag: '...',
      tags: ['...']
    },
    signal
  });

  if (!result?.title || !result?.explanation) throw new Error('La síntesis editorial no devolvió un artículo válido.');
  result.source_refs = Array.isArray(result.source_refs) ? result.source_refs.filter(ref => sourceList.some(source => source.id === ref)) : [];
  if (result.source_refs.length === 0) {
    result.editorial_warning = 'El artículo no enlaza explícitamente ninguna fuente; debe bloquearse en quality gate.';
  }
  result.agent_panel = panel;
  result.matiza_score = Math.max(0, Math.min(100, Number(result.matiza_score || 50)));

  try {
    const { buildInfographic } = await import('../infographic-system.js');
    const { svg } = buildInfographic({
      claim: claimText,
      trick_used: result.trick_used,
      why: result.summary,
      sources: sourceList.slice(0, 3).map(source => `${source.id}: ${source.title}`),
      what_is_true: verificationData.what_is_true,
      matiza_score: result.matiza_score,
      emoji_tag: result.emoji_tag
    });
    result.infographic_svg = svg;
  } catch (error) {
    console.warn('[Article Writer] No se pudo generar infografía:', error.message);
    result.infographic_svg = null;
  }

  return result;
}
