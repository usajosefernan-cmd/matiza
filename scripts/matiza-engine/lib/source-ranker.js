import { getDomain, jaccardSimilarity, normalizeUrl, tokenize } from './text-utils.js';

const PRIMARY_DOMAINS = [
  'boe.es','ine.es','poderjudicial.es','fiscal.es','congreso.es','senado.es','tribunalconstitucional.es',
  'bde.es','airef.es','cnmc.es','aepd.es','aemps.gob.es','aesan.gob.es','consumo.gob.es','seg-social.es',
  'sepe.es','sepe.gob.es','hacienda.gob.es','agenciatributaria.es','interior.gob.es','sanidad.gob.es',
  'europa.eu','ec.europa.eu','eurostat.ec.europa.eu','eur-lex.europa.eu'
];

export function classifyAuthority(url) {
  const domain = getDomain(url);
  if (!domain) return { level: 'Desconocida', score: 0 };
  if (PRIMARY_DOMAINS.some(d => domain === d || domain.endsWith(`.${d}`))) {
    return { level: 'Máxima', score: 1 };
  }
  if (domain.endsWith('.gob.es') || domain.endsWith('.gov') || domain.endsWith('.edu') || domain.endsWith('.org')) {
    return { level: 'Alta', score: 0.8 };
  }
  return { level: 'Media', score: 0.45 };
}

export function rankSource(candidate, claimText, query = '') {
  const authority = classifyAuthority(candidate.url);
  const haystack = `${candidate.title || ''} ${candidate.snippet || ''} ${candidate.text || ''}`;
  const claimSimilarity = jaccardSimilarity(claimText, haystack);
  const querySimilarity = jaccardSimilarity(query, haystack);
  const directDocumentBonus = /\.(pdf|csv|xlsx?|json)(\?|$)/i.test(candidate.url || '') ? 0.12 : 0;
  const contentBonus = candidate.text && candidate.text.length > 600 ? 0.15 : 0;
  const genericHomepagePenalty = (() => {
    try {
      const parsed = new URL(candidate.url);
      return parsed.pathname === '/' || parsed.pathname === '' ? 0.25 : 0;
    } catch {
      return 0.1;
    }
  })();

  const score = Math.max(0, Math.min(1,
    authority.score * 0.42 +
    claimSimilarity * 0.3 +
    querySimilarity * 0.12 +
    directDocumentBonus +
    contentBonus -
    genericHomepagePenalty
  ));

  return {
    ...candidate,
    url: normalizeUrl(candidate.url),
    authority_level: authority.level,
    authority_score: authority.score,
    relevance_score: Number(score.toFixed(4)),
    matching_tokens: tokenize(claimText).filter(token => tokenize(haystack).includes(token)).slice(0, 12)
  };
}

export function dedupeAndRankSources(candidates, claimText) {
  const byUrl = new Map();
  for (const candidate of candidates || []) {
    const url = normalizeUrl(candidate.url);
    if (!url || !/^https?:/i.test(url)) continue;

    // Excluir competidores de verificación de la competencia
    try {
      const urlLower = url.toLowerCase();
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      
      const isCompetitor = [
        'maldita.es', 'newtral.es', 'efeverifica.com', 'verificat.cat'
      ].some(comp => host === comp || host.endsWith(`.${comp}`)) ||
      urlLower.includes('rtve.es/noticias/verifica') ||
      urlLower.includes('rtve.es/noticias/verificacion') ||
      urlLower.includes('efe.com/verifica') ||
      urlLower.includes('verifica.rtve.es');

      if (isCompetitor) {
        continue;
      }
    } catch (e) {
      // Omitir URL inválida
    }

    const ranked = rankSource({ ...candidate, url }, claimText, candidate.query || '');
    const existing = byUrl.get(url);
    if (!existing || ranked.relevance_score > existing.relevance_score) byUrl.set(url, ranked);
  }
  return [...byUrl.values()].sort((a, b) => b.relevance_score - a.relevance_score);
}
