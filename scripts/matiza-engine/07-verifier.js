import { runAgentPanel, synthesizeAgentPanel } from './lib/multi-agent.js';
import { getClaimCache } from './cache.js';

function evidenceIsSufficient(sources, minimum = 2) {
  const usable = (sources || []).filter(source => source.fetched !== false && (source.evidence_quote || source.quote_or_summary || '').length > 40);
  const primary = usable.filter(source => source.authority_level === 'Máxima' || source.source_type === 'oficial');
  return { usable, primary, sufficient: usable.length >= minimum && primary.length >= 1 };
}

function detectSensitiveMode(claimText) {
  const text = String(claimText || '').toLowerCase();
  if (/juez|juzgado|sentencia|investigad|imputad|condenad|fiscal|querella|delito|tribunal/.test(text)) return 'judicial';
  if (/salud|medic|cura|tratamiento|suplemento|enfermedad/.test(text)) return 'salud';
  if (/banco|hipoteca|seguro|inversion|prestamo|comision/.test(text)) return 'finanzas';
  return 'general';
}

export async function verifyClaim(claimText, sources = [], signal = null) {
  console.log(`[Verifier] Verificación multiagente: "${claimText.substring(0, 70)}..."`);
  const cached = getClaimCache(claimText);
  if (cached?.reuse_allowed && cached.previous_verdict && cached.previous_sources?.length) {
    return {
      verdict: cached.previous_verdict,
      confidence: 'Media',
      verdict_reasoning: 'Resultado reutilizado de caché exacta. Debe actualizarse si cambió el contexto o la fecha.',
      what_is_true: '',
      what_is_false: '',
      what_lacks_context: '',
      what_is_not_proven: '',
      cached: true,
      previous_sources: cached.previous_sources
    };
  }

  const minimum = Number.parseInt(process.env.MIN_EVIDENCE_SOURCES || '2', 10);
  const evidence = evidenceIsSufficient(sources, minimum);
  const mode = detectSensitiveMode(claimText);
  const compactSources = sources.map((source, index) => ({
    id: `S${index + 1}`,
    title: source.title,
    url: source.url,
    authority_level: source.authority_level,
    relation_to_claim: source.relation_to_claim,
    quote: source.evidence_quote || source.quote_or_summary || '',
    quote_verified: source.quote_verified !== false
  }));

  const agents = [
    { id: 'support', role: 'Construye el mejor caso posible a favor del claim usando solo las fuentes entregadas.' },
    { id: 'refute', role: 'Construye el mejor caso posible en contra del claim usando solo las fuentes entregadas.' },
    { id: 'context', role: 'Detecta omisiones temporales, metodológicas, estadísticas o semánticas que cambien la interpretación.' },
    { id: 'method', role: 'Audita suficiencia, calidad, independencia y relación directa de las evidencias.' }
  ];
  if (mode === 'judicial') agents.push({ id: 'judicial', role: 'Distingue hechos probados, alegaciones, indicios, fase procesal, firmeza y recursos. No asumas que una resolución equivale a verdad absoluta.' });
  if (mode === 'salud') agents.push({ id: 'health', role: 'Audita evidencia sanitaria, autorización, riesgos y nivel de consenso científico.' });
  if (mode === 'finanzas') agents.push({ id: 'financial', role: 'Audita costes, incentivos, letra pequeña, regulación y riesgo económico.' });

  const context = { claim: claimText, mode, evidence_sufficient: evidence.sufficient, sources: compactSources };
  const panel = await runAgentPanel({
    phaseId: '07-panel',
    task: 'Evaluar el claim desde posiciones adversariales y metodológicas sin añadir datos externos.',
    context,
    agents,
    signal
  });

  if (!evidence.sufficient) {
    return {
      verdict: 'Sin pruebas suficientes',
      confidence: 'Baja',
      verdict_reasoning: `No hay evidencia suficiente y verificable para emitir un veredicto fuerte. Fuentes utilizables: ${evidence.usable.length}; primarias: ${evidence.primary.length}.`,
      what_is_true: 'No puede determinarse con seguridad con las fuentes actuales.',
      what_is_false: 'No puede determinarse con seguridad con las fuentes actuales.',
      what_lacks_context: 'Faltan documentos o datos primarios suficientes.',
      what_is_not_proven: claimText,
      sensitive_mode: mode,
      agent_panel: panel,
      needs_more_sources: true
    };
  }

  try {
    const result = await synthesizeAgentPanel({
      phaseId: '07',
      objective: 'Emitir un veredicto prudente, explicable y trazable a fuentes concretas.',
      context,
      panel,
      schema: {
        verdict: 'Verdadero|Falso|Engañoso|Falta contexto|Sin pruebas suficientes|No verificable',
        confidence: 'Alta|Media|Baja',
        verdict_reasoning: '...',
        what_is_true: '...',
        what_is_false: '...',
        what_lacks_context: '...',
        what_is_not_proven: '...',
        source_refs: ['S1'],
        disagreements: ['...']
      },
      signal
    });
    const allowed = ['Verdadero','Falso','Engañoso','Falta contexto','Sin pruebas suficientes','No verificable'];
    if (!allowed.includes(result.verdict)) result.verdict = 'Sin pruebas suficientes';
    result.agent_panel = panel;
    result.sensitive_mode = mode;
    result.source_refs = Array.isArray(result.source_refs) ? result.source_refs.filter(ref => compactSources.some(source => source.id === ref)) : [];
    if (result.source_refs.length === 0) {
      result.confidence = 'Baja';
      result.verdict = result.verdict === 'Verdadero' || result.verdict === 'Falso' ? 'Sin pruebas suficientes' : result.verdict;
    }
    return result;
  } catch (error) {
    return {
      verdict: 'Sin pruebas suficientes',
      confidence: 'Baja',
      verdict_reasoning: `No se pudo sintetizar el panel: ${error.message}`,
      what_is_true: '',
      what_is_false: '',
      what_lacks_context: 'La síntesis automática falló.',
      what_is_not_proven: claimText,
      sensitive_mode: mode,
      agent_panel: panel,
      fallback: true
    };
  }
}
