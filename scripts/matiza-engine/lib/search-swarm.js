import { runAgentPanel, synthesizeAgentPanel } from './multi-agent.js';
import { searchMany, fetchPages } from './search-providers.js';
import { dedupeAndRankSources } from './source-ranker.js';
import { normalizeText, textFingerprint, unique } from './text-utils.js';

const QUERY_AGENTS = [
  { id: 'origin', role: 'Origin Agent: Localiza la fuente original exacta del claim, declaración, documento, vídeo o dato original en internet.' },
  { id: 'primary', role: 'Primary Source Agent: Diseña búsquedas orientadas a documentos oficiales, boletines del estado (BOE), estadísticas oficiales y normativa de la UE.' },
  { id: 'confirmation', role: 'Confirmation Agent: Busca evidencia confiable que apoye la afirmación del claim para verificar su veracidad.' },
  { id: 'refutation', role: 'Refutation Agent: Busca evidencia sólida y hechos que contradigan, desmientan o limiten el claim.' },
  { id: 'context', role: 'Context Agent: Busca el contexto regulatorio, histórico, metodológico o legislativo de fondo para interpretar el claim sin sesgos.' },
  { id: 'data', role: 'Data Agent: Diseña búsquedas para contrastar y contrastar las cifras, porcentajes, fechas y datos económicos o demográficos del claim.' }
];

function validateQuote(quote, sourceText) {
  if (!quote || !sourceText) return null;
  const q = normalizeText(quote);
  const t = normalizeText(sourceText);
  // Reducir la restricción de 24 a 12 caracteres para permitir verificar citas cortas
  if (q.length < 12 || !t.includes(q)) return null;
  return quote;
}

export async function runSearchSwarm({ claimText, topicTitle = '', strategy = {}, seedSources = [], signal = null }) {
  const context = {
    claim: claimText,
    topic: topicTitle,
    strategy,
    seed_sources: seedSources.map(source => ({ title: source.title, url: source.url }))
  };

  const queryPanel = await runAgentPanel({
    phaseId: '06-query-agents',
    task: 'Generar consultas de búsqueda diversas y complementarias para verificar el claim con fuentes directas y contrastes.',
    context,
    agents: QUERY_AGENTS,
    signal
  });

  const queryCandidates = unique([
    ...(strategy.search_queries || []),
    ...queryPanel.flatMap(agent => agent.queries || []),
    `${claimText} fuente original`,
    `${claimText} datos oficiales España`
  ]).slice(0, Number.parseInt(process.env.MAX_SEARCH_QUERIES || '12', 10));

  const rawResults = await searchMany(queryCandidates, {
    limit: Number.parseInt(process.env.SEARCH_RESULTS_PER_QUERY || '8', 10),
    signal
  });

  const combined = [
    ...seedSources.map(source => ({ ...source, provider: 'seed-cache', query: 'cache' })),
    ...rawResults
  ];
  const rankedBeforeFetch = dedupeAndRankSources(combined, claimText)
    .slice(0, Number.parseInt(process.env.MAX_PAGES_TO_FETCH || '18', 10));
  const fetched = await fetchPages(rankedBeforeFetch, { signal });
  const ranked = dedupeAndRankSources(fetched, claimText)
    .filter(source => source.relevance_score >= Number.parseFloat(process.env.MIN_SOURCE_RELEVANCE || '0.2'))
    .slice(0, Number.parseInt(process.env.MAX_SOURCE_CANDIDATES || '12', 10));

  const compactSources = ranked.map((source, index) => ({
    source_id: `S${index + 1}`,
    title: source.title,
    url: source.url,
    snippet: source.snippet,
    authority_level: source.authority_level,
    relevance_score: source.relevance_score,
    fetched: !!source.fetched,
    text_excerpt: (source.text || '').slice(0, 5000)
  }));

  const auditAgents = [
    { id: 'support-auditor', role: 'Confirmation Auditor: Determina qué fuentes apoyan el claim, identificando las frases textuales de apoyo.' },
    { id: 'refutation-auditor', role: 'Refutation Auditor: Determina qué fuentes contradicen, desmienten o matizan negativamente el claim.' },
    { id: 'data-auditor', role: 'Data Auditor: Contrasta si los datos, porcentajes y fechas coinciden exactamente en las fuentes analizadas.' },
    { id: 'evidence-auditor', role: 'Evidence Auditor: Evalúa de forma estricta que no haya alucinaciones y que toda afirmación tenga base en text_excerpt.' }
  ];

  const auditPanel = compactSources.length ? await runAgentPanel({
    phaseId: '06-audit-agents',
    task: 'Auditar el conjunto de fuentes respecto del claim. Cita únicamente fragmentos presentes literalmente en text_excerpt e identifica source_id.',
    context: { claim: claimText, sources: compactSources },
    agents: auditAgents,
    signal
  }) : [];

  let synthesis = {
    selected_sources: compactSources.slice(0, 5).map(source => ({
      source_id: source.source_id,
      relation: 'context',
      evidence_quote: null,
      reason: 'Selección determinista por autoridad y relevancia.'
    })),
    missing_evidence: ['No se pudo completar auditoría multiagente.'],
    evidence_sufficiency: 'baja'
  };

  if (auditPanel.some(agent => !agent.failed)) {
    try {
      synthesis = await synthesizeAgentPanel({
        phaseId: '06-synthesis',
        objective: 'Seleccionar fuentes realmente útiles y clasificar su relación con el claim sin inventar citas.',
        context: { claim: claimText, sources: compactSources },
        panel: auditPanel,
        schema: {
          selected_sources: [{ source_id: 'S1', relation: 'supports|contradicts|context|unclear', evidence_quote: 'cita literal o null', reason: '...' }],
          missing_evidence: ['...'],
          evidence_sufficiency: 'alta|media|baja'
        },
        signal
      });
    } catch (error) {
      synthesis.synthesis_error = error.message;
    }
  }

  const byId = new Map(compactSources.map(source => [source.source_id, source]));
  const selected = [];
  for (const selection of synthesis.selected_sources || []) {
    const source = byId.get(selection.source_id);
    if (!source) continue;
    
    const verifiedQuote = validateQuote(selection.evidence_quote, source.text_excerpt);
    selected.push({
      ...source,
      source_type: source.authority_level === 'Máxima' ? 'oficial' : 'secundaria',
      relation_to_claim: selection.relation || 'unclear',
      evidence_quote: verifiedQuote,
      audit_reason: selection.reason || '',
      quote_verified: !!verifiedQuote
    });
  }

  const minimum = Number(strategy?.source_strategy?.minimum_sources || process.env.MIN_EVIDENCE_SOURCES || 2);
  const contentBacked = selected.filter(source => source.fetched && (source.evidence_quote || source.text_excerpt.length > 500));
  const primaryCount = selected.filter(source => source.authority_level === 'Máxima').length;

  return {
    sources: selected,
    query_panel: queryPanel,
    audit_panel: auditPanel,
    queries: queryCandidates,
    raw_result_count: rawResults.length,
    evidence_sufficiency: synthesis.evidence_sufficiency || 'baja',
    missing_evidence: synthesis.missing_evidence || [],
    minimum_sources: minimum,
    content_backed_sources: contentBacked.length,
    primary_sources: primaryCount,
    needs_manual_source_check: contentBacked.length < minimum,
    search_fingerprint: textFingerprint(`${claimText}|${queryCandidates.join('|')}`)
  };
}

