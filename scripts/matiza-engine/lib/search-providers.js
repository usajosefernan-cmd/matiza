import { mapLimit } from './async-pool.js';
import { getDomain, normalizeUrl, stripHtml, unique } from './text-utils.js';

function normalizeResult(item, provider, query) {
  if (!item || typeof item !== 'object') return null;
  const url = item.url || item.link || item.href;
  if (!url || !/^https?:/i.test(url)) return null;
  return {
    title: item.title || item.name || url,
    url: normalizeUrl(url),
    snippet: item.snippet || item.description || item.content || item.text || '',
    published_at: item.published_at || item.publishedDate || item.date || null,
    provider,
    query
  };
}

async function searchCustomGateway(query, options = {}) {
  const baseUrl = process.env.ANTIGRAVITY_SEARCH_URL || process.env.SEARCH_API_URL;
  if (!baseUrl) return [];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number.parseInt(process.env.SEARCH_TIMEOUT_MS || '15000', 10));
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(process.env.SEARCH_API_KEY ? { authorization: `Bearer ${process.env.SEARCH_API_KEY}` } : {})
      },
      body: JSON.stringify({
        query,
        limit: options.limit || 10,
        domains: options.domains || [],
        locale: 'es-ES',
        recency_days: options.recencyDays ?? null
      }),
      signal: options.signal || controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const items = data.results || data.items || data.data || data.web?.results || [];
    return (Array.isArray(items) ? items : []).map(item => normalizeResult(item, 'custom-search', query)).filter(Boolean);
  } finally {
    clearTimeout(timer);
  }
}

async function searchSearxng(query, options = {}) {
  const baseUrl = process.env.SEARXNG_URL;
  if (!baseUrl) return [];
  const url = new URL('/search', baseUrl);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('language', 'es-ES');
  url.searchParams.set('safesearch', '1');
  const response = await fetch(url, { signal: options.signal });
  if (!response.ok) throw new Error(`SearXNG HTTP ${response.status}`);
  const data = await response.json();
  return (data.results || []).slice(0, options.limit || 10)
    .map(item => normalizeResult(item, 'searxng', query)).filter(Boolean);
}

function decodeDuckDuckGoUrl(url) {
  try {
    if (url.startsWith('//')) url = `https:${url}`;
    const parsed = new URL(url);
    const uddg = parsed.searchParams.get('uddg');
    return uddg ? decodeURIComponent(uddg) : url;
  } catch {
    return url;
  }
}

export function decodeYahooUrl(urlStr) {
  try {
    const match = urlStr.match(/RU=([^/&]+)/i);
    if (match) {
      return decodeURIComponent(match[1]);
    }
    const parsed = new URL(urlStr);
    const ru = parsed.searchParams.get('RU');
    return ru ? decodeURIComponent(ru) : urlStr;
  } catch {
    return urlStr;
  }
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function searchYahoo(query, options = {}) {
  const endpoint = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(endpoint, {
      signal: options.signal,
      headers: {
        'user-agent': getRandomUserAgent(),
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'upgrade-insecure-requests': '1',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'cache-control': 'max-age=0'
      }
    });
    if (!response.ok) throw new Error(`Yahoo Search HTTP ${response.status}`);
    const html = await response.text();
    const results = [];
    
    // Parseo más flexible que cubre clases alternativas como "algo", "dd", "lh-16" y "reg"
    const divs = html.split(/<div[^>]+class="[^"]*(?:algo|dd|compText|lh-16)[^"]*"[^>]*>/i).slice(1);
    for (const div of divs) {
      const linkMatch = div.match(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
      if (!linkMatch) continue;
      
      const descMatch = div.match(/<div[^>]+class="[^"]*(?:compText|lh-16|fc-26g)[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
        || div.match(/<p[^>]+class="[^"]*(?:lh-16|fc-26g)[^"]*"[^>]*>([\s\S]*?)<\/p>/i)
        || div.match(/<span[^>]+class="[^"]*(?:fc-26g|fc-57g)[^"]*"[^>]*>([\s\S]*?)<\/span>/i);

      const rawUrl = linkMatch[1];
      let url = rawUrl;
      if (url.includes('r.search.yahoo.com')) {
        url = decodeYahooUrl(url);
      }
      
      const item = normalizeResult({
        title: stripHtml(linkMatch[2]),
        url: url,
        snippet: stripHtml(descMatch?.[1] || '')
      }, 'yahoo-search', query);
      
      if (item && !getDomain(item.url).includes('yahoo.com')) {
        results.push(item);
      }
      if (results.length >= (options.limit || 10)) break;
    }
    return results;
  } catch (error) {
    console.warn(`[Search Yahoo] Falló la consulta a Yahoo para "${query}": ${error.message}`);
    return [];
  }
}

async function searchDuckDuckGoFetch(query, options = {}) {
  const endpoint = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(endpoint, {
      signal: options.signal,
      headers: {
        'user-agent': getRandomUserAgent(),
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3'
      }
    });
    if (!response.ok) throw new Error(`DuckDuckGo HTTP ${response.status}`);
    const html = await response.text();
    const results = [];
    const blocks = html.split(/class="result(?:\s|_|\")/i).slice(1);
    for (const block of blocks) {
      const linkMatch = block.match(/<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i)
        || block.match(/<a[^>]+href="([^"]+)"[^>]+class="[^"]*result__a[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
      if (!linkMatch) continue;
      const snippetMatch = block.match(/class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/(?:a|div|td)>/i);
      const item = normalizeResult({
        title: stripHtml(linkMatch[2]),
        url: decodeDuckDuckGoUrl(linkMatch[1]),
        snippet: stripHtml(snippetMatch?.[1] || '')
      }, 'duckduckgo-html', query);
      if (item && !getDomain(item.url).includes('duckduckgo.com')) results.push(item);
      if (results.length >= (options.limit || 10)) break;
    }
    return results;
  } catch (error) {
    console.warn(`[Search DuckDuckGo Fetch] Falló la consulta para "${query}": ${error.message}`);
    return [];
  }
}

async function searchDuckDuckGo(query, options = {}) {
  // Redirigir directamente a la versión fetch para evitar cuelgues e ineficiencias de Playwright
  return await searchDuckDuckGoFetch(query, options);
}

export async function searchWeb(query, options = {}) {
  const providers = [searchCustomGateway, searchSearxng, searchYahoo, searchDuckDuckGo];
  const errors = [];
  for (const provider of providers) {
    try {
      const results = await provider(query, options);
      if (results.length) return results;
    } catch (error) {
      errors.push(error.message);
    }
  }
  if (errors.length) console.warn(`[Search] Sin resultados para "${query}". ${errors.join(' | ')}`);
  return [];
}

export async function searchMany(queries, options = {}) {
  const cleanQueries = unique((queries || []).map(q => String(q).trim()).filter(Boolean));
  const concurrency = Number.parseInt(process.env.SEARCH_CONCURRENCY || '4', 10);
  const groups = await mapLimit(cleanQueries, concurrency, async query => searchWeb(query, options));
  return groups.flat();
}

export async function fetchPage(url, options = {}) {
  const maxBytes = Number.parseInt(process.env.SEARCH_MAX_PAGE_BYTES || '1500000', 10);
  const timeoutMs = Number.parseInt(process.env.SEARCH_FETCH_TIMEOUT_MS || '12000', 10);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const signal = options.signal || controller.signal;
  try {
    const response = await fetch(url, {
      signal,
      redirect: 'follow',
      headers: {
        'user-agent': getRandomUserAgent(),
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'es-ES,es;q=0.9,en;q=0.8',
        'connection': 'keep-alive',
        'upgrade-insecure-requests': '1'
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentType = response.headers.get('content-type') || '';
    const length = Number.parseInt(response.headers.get('content-length') || '0', 10);
    if (length > maxBytes) throw new Error(`Documento demasiado grande: ${length}`);
    const raw = await response.text();
    const clipped = raw.slice(0, maxBytes);
    const titleMatch = clipped.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const text = contentType.includes('html') ? stripHtml(clipped) : clipped.replace(/\s+/g, ' ').trim();
    return {
      url: normalizeUrl(response.url || url),
      title: stripHtml(titleMatch?.[1] || ''),
      content_type: contentType,
      text: text.slice(0, Number.parseInt(process.env.SEARCH_MAX_EXTRACT_CHARS || '24000', 10)),
      fetched: true
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchPages(results, options = {}) {
  const concurrency = Number.parseInt(process.env.PAGE_FETCH_CONCURRENCY || '4', 10);
  return mapLimit(results, concurrency, async result => {
    try {
      const page = await fetchPage(result.url, options);
      return { ...result, ...page, title: page.title || result.title };
    } catch (error) {
      return { ...result, fetched: false, fetch_error: error.message, text: '' };
    }
  });
}
