import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

// Redirigir consola a un archivo de log unificado para el panel de administración
const logFile = path.resolve('data/logs/pipeline.log');
try {
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
} catch (e) {}

const originalLog = console.log;
const originalError = console.error;

function appendToLogFile(type, args) {
  const timestamp = new Date().toISOString();
  const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
  const logLine = `[${timestamp}] [${type}] ${message}\n`;
  try {
    fs.appendFileSync(logFile, logLine, 'utf8');
  } catch (e) {}
}

console.log = function(...args) {
  originalLog.apply(console, args);
  appendToLogFile('INFO', args);
};

console.error = function(...args) {
  originalError.apply(console, args);
  appendToLogFile('ERROR', args);
};

import { dbPath } from './matiza-engine/config.js';

// Función de similitud Jaccard para deduplicación léxica de claims
function getJaccardSimilarity(str1, str2) {
  const clean = (s) => new Set((s || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3));
  const s1 = clean(str1);
  const s2 = clean(str2);
  if (s1.size === 0 || s2.size === 0) return 0;
  const intersection = new Set([...s1].filter(x => s2.has(x)));
  const union = new Set([...s1, ...s2]);
  return intersection.size / union.size;
}

console.log('[Radar Motor] Iniciando escaneo real de fuentes de debates y tendencias (Reddit, Menéame y Google Trends)...');

// Palabras clave de interés institucional, legal, fiscal o social de España
const interestingKeywords = [
  'ley', 'impuesto', 'gobierno', 'bulo', 'okupa', 'okupación', 'desahucio', 'migrante', 'frontera', 'subsidio',
  'ayuda', 'pensión', 'pensiones', 'boe', 'hacienda', 'fiscal', 'IRPF', 'IVA', 'autónomos', 'cuota',
  'empleo', 'paro', 'fijos discontinuos', 'reforma laboral', 'jornada laboral', 'sucesiones', 'herencia',
  'aceite de oliva', 'cesta compra', 'luz factura', 'peinado', 'corrupción', 'fraude', 'amnistía', 'deuda cataluña'
];

// Palabras clave para descartar contenido deportivo o de entretenimiento ordinario
const forbiddenKeywords = [
  'fútbol', 'futbol', 'eurocopa', 'copa américa', 'copa america', 'real madrid', 'barcelona',
  'fc barcelona', 'mbappé', 'mbappe', 'messi', 'ronaldo', 'partido', 'vs', 'contra', 'juego',
  'canción', 'película', 'cine', 'concierto', 'música', 'tenis', 'alcaraz', 'nadal', 'fórmula 1', 'f1',
  'liga', 'champions', 'fichaje', 'entrenamiento'
];

// Headers de navegador reales y refinados para evitar bloqueos
const userAgentHeader = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/html, application/xhtml+xml, application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
};

async function fetchRssFeed(feed) {
  const items = [];
  try {
    console.log(`[Radar Motor] Descargando RSS: ${feed.name}...`);
    const response = await fetch(feed.url, { headers: userAgentHeader });

    if (!response.ok) {
      console.log(`[Radar Motor] Advertencia: ${feed.name} respondió con estado ${response.status}`);
      return items;
    }

    const xml = await response.text();
    
    // Parsea los bloques <item> de forma tolerante a fallos
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const matches = xml.matchAll(itemRegex);

    for (const match of matches) {
      const itemContent = match[1];
      
      const titleMatch = itemContent.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || itemContent.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
      const descMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || itemContent.match(/<description>([\s\S]*?)<\/description>/);
      const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      
      if (titleMatch && linkMatch) {
        if (pubDateMatch) {
          const pubDate = new Date(pubDateMatch[1].trim());
          const diffHours = (new Date().getTime() - pubDate.getTime()) / (1000 * 60 * 60);
          if (diffHours > 24) continue; // Solo 24 horas
        }

        const title = titleMatch[1].trim().replace(/&lt;!\[CDATA\[|\]\]&gt;/g, '');
        const link = linkMatch[1].trim();
        const description = descMatch ? descMatch[1].trim().replace(/<\/?[^>]+(>|$)/g, "").substring(0, 300) : '';
        
        let imageUrl = null;
        const enclosureMatch = itemContent.match(/<enclosure[^>]*url="([^"]+)"/i);
        if (enclosureMatch) {
          imageUrl = enclosureMatch[1];
        } else {
          const mediaMatch = itemContent.match(/<media:content[^>]*url="([^"]+)"/i) || itemContent.match(/<media:thumbnail[^>]*url="([^"]+)"/i);
          if (mediaMatch) {
            imageUrl = mediaMatch[1];
          } else if (descMatch) {
            const imgHtmlMatch = descMatch[1].match(/<img[^>]*src="([^"]+)"/i);
            if (imgHtmlMatch) imageUrl = imgHtmlMatch[1];
          }
        }

        items.push({
          title,
          link,
          description,
          platform: feed.platform,
          author: feed.platform + ' RSS',
          score: feed.platform === 'Menéame' ? 150 : 50, // Ponderación de partida
          comments: feed.platform === 'Menéame' ? 40 : 10,
          origin_date: pubDateMatch ? new Date(pubDateMatch[1].trim()).toISOString() : new Date().toISOString(),
          imageUrl: imageUrl || null
        });
      }
    }
    console.log(`[Radar Motor] -> ${feed.name}: Detectados ${items.length} elementos de las últimas 24h.`);
  } catch (err) {
    console.log(`[Radar Motor] ❌ Error descargando RSS ${feed.name}:`, err.message);
  }
  return items;
}

async function fetchRedditFeed(feed) {
  const items = [];
  try {
    console.log(`[Radar Motor] Descargando Reddit JSON: ${feed.name}...`);
    const response = await fetch(feed.url, { headers: userAgentHeader });

    if (!response.ok) {
      console.log(`[Radar Motor] Advertencia: ${feed.name} respondió con estado ${response.status}`);
      return items;
    }

    const data = await response.json();
    const children = data?.data?.children || [];
    
    for (const child of children) {
      const post = child.data;
      if (post && !post.pinned && !post.stickied) {
        if (post.created_utc) {
          const createdMs = post.created_utc * 1000;
          const diffHours = (new Date().getTime() - createdMs) / (1000 * 60 * 60);
          if (diffHours > 24) continue; // Solo 24 horas
        }

        let imageUrl = null;
        if (post.thumbnail && post.thumbnail.startsWith('http')) {
          imageUrl = post.thumbnail;
        } else if (post.url && (post.url.endsWith('.jpg') || post.url.endsWith('.png') || post.url.endsWith('.jpeg') || post.url.endsWith('.gif'))) {
          imageUrl = post.url;
        }

        items.push({
          title: post.title || '',
          link: `https://www.reddit.com${post.permalink}`,
          description: post.selftext || '',
          platform: 'Reddit',
          author: `u/${post.author || 'desconocido'}`,
          score: post.score || 0,
          comments: post.num_comments || 0,
          origin_date: post.created_utc ? new Date(post.created_utc * 1000).toISOString() : new Date().toISOString(),
          imageUrl: imageUrl || null
        });
      }
    }
    console.log(`[Radar Motor] -> ${feed.name}: Detectados ${items.length} posts de las últimas 24h.`);
  } catch (err) {
    console.log(`[Radar Motor] ❌ Error descargando Reddit ${feed.name}:`, err.message);
  }
  return items;
}

async function fetchTelegramChannel(channel) {
  const items = [];
  try {
    console.log(`[Radar Motor] Descargando canal de Telegram: ${channel.name}...`);
    const url = `https://telegram.me/s/${channel.id}`;
    const response = await fetch(url, { headers: userAgentHeader });

    if (!response.ok) {
      console.log(`[Radar Motor] Advertencia: Telegram ${channel.name} respondió con estado ${response.status}`);
      return items;
    }

    const html = await response.text();
    
    // Dividir el HTML por bloques de mensaje
    const messageBlocks = html.split('<div class="tgme_widget_message ');
    
    for (let i = 1; i < messageBlocks.length; i++) {
      const block = messageBlocks[i];
      
      const textMatch = block.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
      const linkMatch = block.match(/<a class="tgme_widget_message_date" href="([^"]+)"/);
      const dateMatch = block.match(/<time datetime="([^"]+)"/);
      const viewsMatch = block.match(/<span class="tgme_widget_message_views">([^<]+)<\/span>/);
      
      if (textMatch && linkMatch) {
        if (dateMatch) {
          const messageDate = new Date(dateMatch[1]);
          const diffHours = (new Date().getTime() - messageDate.getTime()) / (1000 * 60 * 60);
          if (diffHours > 24) continue; // Solo 24 horas
        }

        let textContent = textMatch[1]
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/?[^>]+(>|$)/g, "")
          .trim();
        
        textContent = textContent
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        const link = linkMatch[1].trim();
        
        let views = 0;
        if (viewsMatch) {
          const viewsRaw = viewsMatch[1].trim().toUpperCase().replace(',', '.');
          if (viewsRaw.includes('K')) {
            views = parseFloat(viewsRaw.replace('K', '')) * 1000;
          } else if (viewsRaw.includes('M')) {
            views = parseFloat(viewsRaw.replace('M', '')) * 1000000;
          } else {
            views = parseFloat(viewsRaw) || 0;
          }
        }

        const firstLine = textContent.split('\n')[0] || '';
        const title = firstLine.substring(0, 100) || 'Post de Telegram';

        const photoMatch = block.match(/tgme_widget_message_photo_wrap[^>]*style="[^"]*background-image:url\('([^']+)'\)/i) || block.match(/background-image:url\('([^']+)'\)/i);
        const imageUrl = photoMatch ? photoMatch[1] : null;

        items.push({
          title,
          link,
          description: textContent,
          platform: 'Telegram',
          author: channel.name,
          score: views,
          comments: 0,
          views: views,
          origin_date: dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString(),
          imageUrl: imageUrl || null
        });
      }
    }
    console.log(`[Radar Motor] -> ${channel.name}: Detectados ${items.length} posts.`);
  } catch (err) {
    console.log(`[Radar Motor] ❌ Error descargando Telegram ${channel.name}:`, err.message);
  }
  return items;
}

// ═══ NITTER / X RSS FEEDS ═══
// ═══ X (TWITTER) PLAYWRIGHT SCRAPER ═══
async function scrapeXPlaywright(xAccounts, queries) {
  const items = [];
  const sessionPath = '/home/ubuntu/db/matiza/x_session';
  try {
    fs.mkdirSync(sessionPath, { recursive: true });
  } catch (e) {}

  console.log(`[Radar Motor] Iniciando navegador Playwright para X...`);
  let browserContext;
  try {
    browserContext = await chromium.launchPersistentContext(sessionPath, {
      headless: true,
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browserContext.newPage();
    
    // 1. Scrape Accounts
    for (const account of xAccounts) {
      try {
        const url = `https://x.com/${account.username}`;
        console.log(`[Radar Motor] Scrapeando cuenta de X: @${account.username}...`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(3000);
        
        // Scroll slightly to trigger load
        await page.evaluate(() => window.scrollBy(0, 800));
        await page.waitForTimeout(2000);
        
        const tweets = await page.evaluate((authorName) => {
          const results = [];
          const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');
          for (const el of tweetElements) {
            const textEl = el.querySelector('[data-testid="tweetText"]');
            const linkEl = el.querySelector('a[href*="/status/"]');
            if (!textEl || !linkEl) continue;
            
            const link = linkEl.href;
            const text = textEl.innerText || '';
            const title = text.split('\n')[0] || 'Tweet';
            
            const imgEl = el.querySelector('[data-testid="tweetPhoto"] img');
            const imageUrl = imgEl ? imgEl.src : null;
            
            const likeEl = el.querySelector('[data-testid="like"]');
            const likeText = likeEl ? likeEl.innerText || '' : '0';
            
            let likes = 0;
            const cleanLike = likeText.trim().toUpperCase();
            if (cleanLike.includes('K')) likes = parseFloat(cleanLike.replace('K', '')) * 1000;
            else if (cleanLike.includes('M')) likes = parseFloat(cleanLike.replace('M', '')) * 1000000;
            else likes = parseInt(cleanLike.replace(/\D/g, '')) || 0;
            
            results.push({
              title: title.substring(0, 180),
              link,
              description: text,
              platform: 'X',
              author: authorName,
              score: likes,
              comments: 0,
              views: 0,
              origin_date: new Date().toISOString(),
              imageUrl
            });
          }
          return results;
        }, `@${account.username}`);
        
        items.push(...tweets);
        console.log(`[Radar Motor] -> @${account.username}: Encontrados ${tweets.length} tweets.`);
      } catch (err) {
        console.log(`[Radar Motor] Error scrapeando cuenta de X @${account.username}:`, err.message);
      }
    }
    
    // 2. Scrape Search Queries on X
    for (const query of queries) {
      try {
        const searchUrl = `https://x.com/search?q=${encodeURIComponent(query)}&f=live`;
        console.log(`[Radar Motor] Buscando en X (Playwright): "${query}"...`);
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(3000);
        
        await page.evaluate(() => window.scrollBy(0, 800));
        await page.waitForTimeout(2000);
        
        const searchTweets = await page.evaluate(() => {
          const results = [];
          const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');
          for (const el of tweetElements) {
            const textEl = el.querySelector('[data-testid="tweetText"]');
            const linkEl = el.querySelector('a[href*="/status/"]');
            const userEl = el.querySelector('[data-testid="User-Name"] a');
            if (!textEl || !linkEl) continue;
            
            const link = linkEl.href;
            const text = textEl.innerText || '';
            const title = text.split('\n')[0] || 'Tweet';
            
            let author = 'X User';
            if (userEl) {
              const href = userEl.getAttribute('href') || '';
              author = '@' + href.replace('/', '');
            }
            
            const imgEl = el.querySelector('[data-testid="tweetPhoto"] img');
            const imageUrl = imgEl ? imgEl.src : null;
            
            const likeEl = el.querySelector('[data-testid="like"]');
            const likeText = likeEl ? likeEl.innerText || '' : '0';
            
            let likes = 0;
            const cleanLike = likeText.trim().toUpperCase();
            if (cleanLike.includes('K')) likes = parseFloat(cleanLike.replace('K', '')) * 1000;
            else if (cleanLike.includes('M')) likes = parseFloat(cleanLike.replace('M', '')) * 1000000;
            else likes = parseInt(cleanLike.replace(/\D/g, '')) || 0;
            
            results.push({
              title: title.substring(0, 180),
              link,
              description: text,
              platform: 'X',
              author,
              score: likes,
              comments: 0,
              views: 0,
              origin_date: new Date().toISOString(),
              imageUrl
            });
          }
          return results;
        });
        
        items.push(...searchTweets);
        console.log(`[Radar Motor] -> X búsqueda "${query}": Encontrados ${searchTweets.length} tweets.`);
      } catch (err) {
        console.log(`[Radar Motor] Error buscando en X para "${query}":`, err.message);
      }
    }
  } catch (err) {
    console.log(`[Radar Motor] Error general en navegador X:`, err.message);
  } finally {
    if (browserContext) {
      try {
        await browserContext.close();
      } catch (e) {}
    }
  }
  return items;
}

// ═══ TIKTOK PLAYWRIGHT SCRAPER ═══
async function scrapeTikTokPlaywright(queries) {
  const items = [];
  const sessionPath = '/home/ubuntu/db/matiza/tiktok_session';
  try {
    fs.mkdirSync(sessionPath, { recursive: true });
  } catch (e) {}

  console.log(`[Radar Motor] Iniciando navegador Playwright para TikTok...`);
  let browserContext;
  try {
    browserContext = await chromium.launchPersistentContext(sessionPath, {
      headless: true,
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browserContext.newPage();
    
    for (const query of queries) {
      try {
        const searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(query)}&sort_type=1&publish_time=7`;
        console.log(`[Radar Motor] Buscando en TikTok (Playwright): "${query}"...`);
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(4000);
        
        // Scroll down to load videos
        await page.evaluate(() => window.scrollBy(0, 800));
        await page.waitForTimeout(2000);
        
        const videos = await page.evaluate((q) => {
          const results = [];
          const cards = document.querySelectorAll('[data-e2e="search_video-item"], div[class*="-DivVideoCardContainer"], div[class*="search-item"]');
          
          for (const card of cards) {
            const linkEl = card.querySelector('a[href*="/video/"]');
            if (!linkEl) continue;
            
            const link = linkEl.href;
            const descEl = card.querySelector('[data-e2e="search_video-desc"], div[class*="-DivVideoCardDesc"], [class*="desc"]');
            const authorEl = card.querySelector('[data-e2e="search_video-author"], [class*="UniqueId"], [class*="author"]');
            const imgEl = card.querySelector('img');
            const viewsEl = card.querySelector('[data-e2e="search_video-views"], [class*="PlayNum"], [class*="views"]');
            
            const description = descEl ? descEl.innerText || '' : '';
            const title = (description && description.trim().length > 15) ? description.split('\n')[0] : `Video de TikTok sobre ${q}`;
            const author = authorEl ? authorEl.innerText || 'TikTok Creator' : 'TikTok Creator';
            const imageUrl = imgEl ? imgEl.src : null;
            const viewsText = viewsEl ? viewsEl.innerText || '0' : '0';
            
            let views = 0;
            const cleanViews = viewsText.trim().toUpperCase();
            if (cleanViews.includes('K')) views = parseFloat(cleanViews.replace('K', '')) * 1000;
            else if (cleanViews.includes('M')) views = parseFloat(cleanViews.replace('M', '')) * 1000000;
            else views = parseInt(cleanViews.replace(/\D/g, '')) || 0;
            
            let cleanLink = link;
            let cleanAuthor = author;
            const linkMatch = link.match(/\/video\/(\d+)/);
            if (linkMatch) {
              const videoId = linkMatch[1];
              const saneAuthor = author.replace(/\s+/g, '').replace(/Seguir/g, '').replace(/[^a-zA-Z0-9_@]/g, '');
              cleanAuthor = saneAuthor.startsWith('@') ? saneAuthor : '@' + saneAuthor;
              cleanLink = `https://www.tiktok.com/${cleanAuthor}/video/${videoId}`;
            }
            
            results.push({
              title: title.substring(0, 180),
              link: cleanLink,
              description: description || `Post de TikTok sobre "${q}"`,
              platform: 'TikTok',
              author: cleanAuthor,
              score: 0,
              comments: 0,
              views: views,
              origin_date: new Date().toISOString(),
              imageUrl
            });
          }
          
          // Fallback if cards selector fails, try getting any video links
          if (results.length === 0) {
            const links = document.querySelectorAll('a[href*="/video/"]');
            links.forEach(l => {
              const href = l.href;
              if (results.some(r => r.link === href)) return;
              
              const parent = l.closest('div');
              let title = `Video de TikTok sobre ${q}`;
              let author = 'TikTok Creator';
              let imageUrl = null;
              if (parent) {
                const text = parent.innerText || '';
                title = text.split('\n')[0] || title;
                const img = parent.querySelector('img');
                if (img) imageUrl = img.src;
              }
              
              let cleanLink = href;
              const saneAuthor = author.replace(/\s+/g, '').replace(/Seguir/g, '').replace(/[^a-zA-Z0-9_@]/g, '');
              const cleanAuthor = saneAuthor.startsWith('@') ? saneAuthor : '@' + saneAuthor;
              const linkMatch = href.match(/\/video\/(\d+)/);
              if (linkMatch) {
                const videoId = linkMatch[1];
                cleanLink = `https://www.tiktok.com/${cleanAuthor}/video/${videoId}`;
              }
              
              results.push({
                title: title.substring(0, 180),
                link: cleanLink,
                description: `Post de TikTok detectado.`,
                platform: 'TikTok',
                author: cleanAuthor,
                score: 0,
                comments: 0,
                views: 0,
                origin_date: new Date().toISOString(),
                imageUrl
              });
            });
          }
          
          return results;
        }, query);
        
        items.push(...videos);
        console.log(`[Radar Motor] -> TikTok "${query}": Encontrados ${videos.length} videos.`);
      } catch (err) {
        console.log(`[Radar Motor] Error buscando en TikTok para "${query}":`, err.message);
      }
    }
  } catch (err) {
    console.log(`[Radar Motor] Error general en navegador TikTok:`, err.message);
  } finally {
    if (browserContext) {
      try {
        await browserContext.close();
      } catch (e) {}
    }
  }
  return items;
}

// ═══ INSTAGRAM SCRAPER (PLAYWRIGHT CHROMIUM) ═══
async function scrapeInstagramPlaywright(queries = []) {
  const items = [];
  const sessionPath = '/home/ubuntu/db/matiza/instagram_session';
  try {
    fs.mkdirSync(sessionPath, { recursive: true });
  } catch (e) {}

  console.log('[Radar Motor] Iniciando navegador Playwright para Instagram...');
  let browserContext;
  try {
    browserContext = await chromium.launchPersistentContext(sessionPath, {
      headless: true,
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browserContext.newPage();
    const activeQueries = queries.length > 0 ? queries : ['bulo España', 'actualidad España'];

    for (const q of activeQueries) {
      try {
        const url = `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(q)}`;
        console.log(`[Radar Motor] Buscando semánticamente en Instagram: "${q}"...`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(4000);

        // Scroll leve para forzar carga
        await page.evaluate(() => window.scrollBy(0, 600));
        await page.waitForTimeout(2000);

        const posts = await page.evaluate((q_name) => {
          const results = [];
          const links = document.querySelectorAll('a[href*="/p/"]');
          for (const a of links) {
            const href = a.href;
            const match = href.match(/\/p\/([a-zA-Z0-9_-]+)/);
            if (!match) continue;
            
            const shortcode = match[1];
            const cleanLink = `https://www.instagram.com/p/${shortcode}/`;
            if (results.some(r => r.link === cleanLink)) continue;

            const img = a.querySelector('img');
            const imageUrl = img ? img.src : null;
            const alt = img ? img.alt || '' : '';
            const title = alt.split('\n')[0] || `Publicación sobre ${q_name}`;

            results.push({
              title: title.substring(0, 180),
              link: cleanLink,
              description: alt || `Post de Instagram sobre "${q_name}"`,
              platform: 'Instagram',
              author: 'Instagram Creator',
              score: 0,
              comments: 0,
              views: 0,
              origin_date: new Date().toISOString(),
              imageUrl
            });
          }
          return results;
        }, q);

        items.push(...posts);
        console.log(`[Radar Motor] -> Instagram "${q}": Encontrados ${posts.length} posts.`);
      } catch (err) {
        console.log(`[Radar Motor] Error buscando en Instagram "${q}":`, err.message);
      }
    }
  } catch (err) {
    console.log(`[Radar Motor] Error general en navegador Instagram:`, err.message);
  } finally {
    if (browserContext) {
      try {
        await browserContext.close();
      } catch (e) {}
    }
  }
  return items;
}

async function fetchRedditSearch(query) {
  const items = [];
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query + ' (site:reddit.com/r/es OR site:reddit.com/r/spainpolitics OR site:reddit.com/r/spain)')}&sort=new&limit=8`;
    console.log(`[Radar Motor] Buscando en Reddit: "${query}"...`);
    const response = await fetch(url, { headers: userAgentHeader });
    if (response.ok) {
      const data = await response.json();
      const children = data?.data?.children || [];
      for (const child of children) {
        const post = child.data;
        if (post && !post.pinned && !post.stickied) {
          if (post.created_utc) {
            const createdMs = post.created_utc * 1000;
            const diffHours = (new Date().getTime() - createdMs) / (1000 * 60 * 60);
            if (diffHours > 24) continue;
          }
          let imageUrl = null;
          if (post.thumbnail && post.thumbnail.startsWith('http')) {
            imageUrl = post.thumbnail;
          } else if (post.url && (post.url.endsWith('.jpg') || post.url.endsWith('.png') || post.url.endsWith('.jpeg'))) {
            imageUrl = post.url;
          }
          items.push({
            title: post.title || '',
            link: `https://www.reddit.com${post.permalink}`,
            description: post.selftext || '',
            platform: 'Reddit',
            author: `u/${post.author || 'desconocido'}`,
            score: post.score || 0,
            comments: post.num_comments || 0,
            origin_date: post.created_utc ? new Date(post.created_utc * 1000).toISOString() : new Date().toISOString(),
            imageUrl: imageUrl || null
          });
        }
      }
    }
  } catch (err) {
    console.log(`[Radar Motor] Error buscando en Reddit para "${query}":`, err.message);
  }
  return items;
}

function parseYouTubeRelativeTime(timeText) {
  const now = new Date();
  if (!timeText) return now.toISOString();
  
  const cleanText = timeText.toLowerCase();
  const match = cleanText.match(/(\d+)/);
  if (!match) return now.toISOString();
  
  const value = parseInt(match[1]);
  if (cleanText.includes('segundo')) {
    now.setSeconds(now.getSeconds() - value);
  } else if (cleanText.includes('minuto')) {
    now.setMinutes(now.getMinutes() - value);
  } else if (cleanText.includes('hora')) {
    now.setHours(now.getHours() - value);
  } else if (cleanText.includes('día') || cleanText.includes('dia')) {
    now.setDate(now.getDate() - value);
  }
  return now.toISOString();
}

async function fetchYouTubeSearch(query) {
  const items = [];
  try {
    console.log(`[Radar Motor] Buscando en YouTube: "${query}"...`);
    // sp=CAI%253D es el parametro de ordenamiento por fecha de subida en YouTube
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=CAI%253D`;
    const response = await fetch(url, { headers: userAgentHeader });

    if (!response.ok) {
      console.log(`[Radar Motor] Advertencia: YouTube respondió con estado ${response.status}`);
      return items;
    }

    const html = await response.text();
    const jsonMatch = html.match(/var ytInitialData = (\{[\s\S]*?\});/);
    if (!jsonMatch) {
      console.log(`[Radar Motor] No se encontró ytInitialData en la respuesta de YouTube.`);
      return items;
    }

    const data = JSON.parse(jsonMatch[1]);
    
    // Navegar de forma segura el arbol de componentes de YouTube para extraer videos
    const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    
    let videoResults = [];
    for (const section of contents) {
      const itemSection = section?.itemSectionRenderer?.contents || [];
      for (const item of itemSection) {
        if (item.videoRenderer) {
          videoResults.push(item.videoRenderer);
        }
      }
    }

    for (const video of videoResults.slice(0, 8)) { // 8 primeros videos mas recientes
      const title = video?.title?.runs?.[0]?.text || '';
      const videoId = video?.videoId || '';
      const description = video?.detailedMetadataSnippets?.[0]?.snippetText?.runs?.[0]?.text 
        || video?.descriptionSnippet?.runs?.[0]?.text || '';
      const author = video?.ownerText?.runs?.[0]?.text || 'YouTube Creator';
      const viewCountText = video?.viewCountText?.simpleText || video?.viewCountText?.runs?.[0]?.text || '0';
      
      let views = 0;
      const cleanViews = viewCountText.replace(/\D/g, '');
      if (cleanViews) views = parseInt(cleanViews);

      // Descartar videos antiguos
      const timeText = video?.publishedTimeText?.simpleText || '';
      if (timeText && !timeText.includes('segundo') && !timeText.includes('minuto') && !timeText.includes('hora') && !timeText.includes('día') && !timeText.includes('dia')) {
        continue; // Descartar si es de hace semanas, meses o años
      }

      const thumbnails = video?.thumbnail?.thumbnails || [];
      const imageUrl = thumbnails.length > 0 ? thumbnails[thumbnails.length - 1]?.url : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      items.push({
        title,
        link: `https://www.youtube.com/watch?v=${videoId}`,
        description,
        platform: 'YouTube',
        author,
        score: views,
        comments: 0,
        views: views,
        origin_date: parseYouTubeRelativeTime(timeText),
        imageUrl: imageUrl || null
      });
    }
    console.log(`[Radar Motor] -> YouTube "${query}": Detectados ${items.length} videos de las últimas 24h.`);
  } catch (err) {
    console.log(`[Radar Motor] ❌ Error buscando en YouTube para "${query}":`, err.message);
  }
  return items;
}

// fetchDdgSocialSearch eliminada (DDG e inyección views:15000 removidos para datos 100% reales)

async function getGoogleTrendsQueries() {
  const queries = [];
  try {
    const url = 'https://trends.google.es/trends/trendingsearches/daily/rss?geo=ES';
    const response = await fetch(url, { headers: userAgentHeader });
    if (response.ok) {
      const xml = await response.text();
      const matches = xml.matchAll(/<title>([\s\S]*?)<\/title>/g);
      for (const match of matches) {
        const term = match[1].trim()
          .replace(/&lt;!\[CDATA\[|\]\]&gt;/g, '')
          .replace(/<!\[CDATA\[|\]\]>/g, '');
        if (term && !term.toLowerCase().includes('trends') && term.length < 60) {
          queries.push(term);
        }
      }
    }
  } catch (err) {
    console.log('[Radar Motor] ❌ No se pudieron cargar tendencias dinámicas:', err.message);
  }
  return queries;
}

async function runRadar() {
  if (!fs.existsSync(dbPath)) {
    console.error(`❌ La base de datos no existe en ${dbPath}.`);
    process.exit(1);
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');

  console.log('[Radar Motor] Cargando claims existentes en base de datos para deduplicación semántica...');
  const existingClaims = [
    ...db.prepare("SELECT claim as text FROM articles").all().map(a => a.text),
    ...db.prepare("SELECT detected_claim as text FROM scraped_items").all().map(s => s.text)
  ].filter(Boolean);

  console.log('[Radar Motor] Extrayendo palabras clave dinámicas de tus expedientes temáticos...');
  const dbTopics = db.prepare("SELECT title, category FROM topics").all();
  const dynamicKeywords = [];
  dbTopics.forEach(t => {
    const text = `${t.title} ${t.category}`;
    const clean = text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 4);
    dynamicKeywords.push(...clean);
  });

  const allKeywords = [...new Set([...interestingKeywords, ...dynamicKeywords])];
  globalThis.allKeywords = allKeywords; // Guardar en ámbito global para usar en las funciones de filtro

  console.log('[Radar Motor] Cargando fuentes de monitorización desde la base de datos...');
  const activeSources = db.prepare("SELECT * FROM radar_sources WHERE status = 'activo'").all();

  const rssFeeds = activeSources
    .filter(s => s.platform === 'RSS')
    .map(s => ({ name: s.name, url: s.url_or_id, platform: 'Prensa' }));

  const redditFeeds = activeSources
    .filter(s => s.platform === 'Reddit')
    .map(s => ({ name: s.name, url: s.url_or_id, platform: 'Reddit' }));

  const telegramChannels = activeSources
    .filter(s => s.platform === 'Telegram')
    .map(s => ({ id: s.url_or_id, name: s.name, platform: 'Telegram' }));

  const xAccounts = activeSources
    .filter(s => s.platform === 'X')
    .map(s => ({ username: s.url_or_id, name: s.name, platform: 'X' }));

  console.log(`[Radar Motor] Fuentes cargadas: ${rssFeeds.length} RSS, ${redditFeeds.length} Reddit, ${telegramChannels.length} Telegram, ${xAccounts.length} X.`);

  const insertScrapedItem = db.prepare(`
    INSERT OR IGNORE INTO scraped_items (id, platform, url, text, author_public_name, metrics_json, detected_claim, suggested_topic, virality_score, risk_score, status, origin_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'triage_completado', ?, datetime('now'))
  `);

  let insertedCount = 0;
  const allItems = [];

  // 1. Cargar RSS feeds, Reddit feeds y Telegram channels en paralelo
  console.log('[Radar Motor] Descargando fuentes estáticas (RSS, Reddit y Telegram) en paralelo...');
  const staticFeedPromises = [
    ...rssFeeds.map(feed => fetchRssFeed(feed)),
    ...redditFeeds.map(feed => fetchRedditFeed(feed)),
    ...telegramChannels.map(channel => fetchTelegramChannel(channel))
  ];
  const staticFeedResults = await Promise.all(staticFeedPromises);
  staticFeedResults.forEach(items => allItems.push(...items));

  // 3.5 Búsquedas dinámicas y virales en YouTube, X, Reddit, Instagram y TikTok basadas en alarmas y viralidades del manual
  const alarmSignals = [
    'alarma', 'cuidado', 'ojo con', 'estafa', 'bulo', 'mentira', 
    'secreto', 'ocultan', 'urgente', 'censurado', 'brutal', 'difunde', 'robo'
  ];

  const socialConcerns = [
    'okupa', 'allanamiento', 'desahucio', 'ayudas extranjeros', 'inmigrantes', 'menas', 
    'autónomos cuota', 'cotización', 'impuestos', 'sucesiones', 'pensiones', 'cesta compra', 'factura luz'
  ];

  const generatedQueries = [];
  
  // Generar combinaciones cruzadas de temas de interés social con señales de alarma para detectar bulos
  socialConcerns.forEach(concern => {
    // Tomar 2 señales de alarma aleatorias para cada tema para mantener consultas diversas
    const shuffle = [...alarmSignals].sort(() => 0.5 - Math.random());
    generatedQueries.push(`${concern} ${shuffle[0]}`);
    generatedQueries.push(`${concern} ${shuffle[1]}`);
  });

  // Añadir consultas genéricas del manual de pánico moral
  generatedQueries.push('bulo España', 'estafa España', 'cuidado ley España', 'alerta España');

  const uniqueQueries = [...new Set(generatedQueries)].slice(0, 20);
  console.log(`[Radar Motor] Consultas de búsqueda semántica de viralidades generadas: [${uniqueQueries.join(', ')}]`);

  // 3. Cargar X, TikTok e Instagram en paralelo
  console.log('[Radar Motor] Lanzando agentes de redes sociales (X, TikTok e Instagram) en paralelo...');
  const [xItems, tiktokItems, instagramItems] = await Promise.all([
    scrapeXPlaywright(xAccounts, uniqueQueries),
    scrapeTikTokPlaywright(uniqueQueries),
    scrapeInstagramPlaywright(uniqueQueries)
  ]);
  allItems.push(...xItems, ...tiktokItems, ...instagramItems);

  // 3.3 Cargar búsquedas en otras plataformas en lotes paralelos con concurrencia controlada
  console.log('[Radar Motor] Lanzando búsquedas en paralelo en YouTube y Reddit...');
  const concurrencyLimit = 5;
  const searchTasks = uniqueQueries.map(query => async () => {
    const [ytItems, redditSearchItems] = await Promise.all([
      fetchYouTubeSearch(query),
      fetchRedditSearch(query)
    ]);
    return [...ytItems, ...redditSearchItems];
  });

  const searchResults = [];
  const executing = [];
  for (const task of searchTasks) {
    const p = task();
    searchResults.push(p);
    const e = p.then(() => executing.splice(executing.indexOf(e), 1));
    executing.push(e);
    if (executing.length >= concurrencyLimit) {
      await Promise.race(executing);
    }
  }
  const searchItemsGroups = await Promise.all(searchResults);
  searchItemsGroups.forEach(group => allItems.push(...group));

  // 4. Procesar y filtrar items
  for (const item of allItems) {
    const titleLower = item.title.toLowerCase();
    const descLower = item.description.toLowerCase();
    
    // Filtrar deportes y entretenimiento ordinario
    const hasForbidden = forbiddenKeywords.some(kw => titleLower.includes(kw) || descLower.includes(kw));
    if (hasForbidden) continue;

    // Filtro de viralidad ajustado para capturar alertas tempranas en búsquedas recientes de alarma
    let isViral = false;
    const plat = (item.platform || '').toLowerCase();
    
    if (plat === 'youtube') {
      if ((item.views || 0) >= 5000) isViral = true;
    } else if (plat === 'telegram') {
      if ((item.views || 0) >= 1000) isViral = true;
    } else if (plat === 'x' || plat === 'twitter') {
      if ((item.score || 0) >= 100) isViral = true;
    } else if (plat === 'reddit') {
      if ((item.score || 0) >= 50 || (item.comments || 0) >= 10) isViral = true;
    } else if (plat === 'tiktok' || plat === 'instagram') {
      isViral = true;
    } else if (plat === 'facebook') {
      if ((item.views || 0) >= 5000 || (item.score || 0) >= 200) isViral = true;
    } else if (plat === 'prensa' || plat === 'menéame' || plat === 'google trends') {
      isViral = true;
    } else {
      isViral = false;
    }

    if (!isViral) {
      // Omitir posts no virales
      continue;
    }

    // Buscar relevancia sociopolítica usando las keywords dinámicas cargadas en memoria
    const hasInteresting = (globalThis.allKeywords || interestingKeywords).some(kw => titleLower.includes(kw) || descLower.includes(kw));
    
    if (hasInteresting) {
      // Generar ID único basado en URL para evitar duplicados
      const id = `radar-${item.platform.toLowerCase()}-${Buffer.from(item.link).toString('base64').substring(0, 32)}`;
      
      // Clasificación mejorada del tema
      let suggestedTopic = 'Economía y Sociedad';
      const combined = titleLower + ' ' + descLower;
      if (/\bfranco\w*\b/i.test(combined) || combined.includes('memoria histórica') || combined.includes('exhumación')) suggestedTopic = 'Mitos y Leyendas del Franquismo';
      else if (/\bmena\w*\b/i.test(combined) || combined.includes('inmigr') || combined.includes('extranj') || combined.includes('frontera')) suggestedTopic = 'Inmigración, Delincuencia y Ayudas';
      else if (combined.includes('begoña') || combined.includes('peinado')) suggestedTopic = 'Investigación Judicial a Begoña Gómez';
      else if (combined.includes('koldo') || combined.includes('ábalos') || combined.includes('mascarilla')) suggestedTopic = 'Caso Koldo y Sentencia del Tribunal Supremo';
      else if (combined.includes('okupa') || combined.includes('vivienda') || combined.includes('alquiler') || combined.includes('hipoteca')) suggestedTopic = 'Vivienda y Okupación';
      else if (combined.includes('amnistía') || combined.includes('procés') || combined.includes('puigdemont')) suggestedTopic = 'Ley de Amnistía y Procés';
      else if (/\bparo\b/i.test(combined) || combined.includes('empleo') || combined.includes('sepe') || combined.includes('fijo discontinuo')) suggestedTopic = 'Empleo y Cifras de Paro';
      else if (combined.includes('autónomo') || combined.includes('irpf') || combined.includes('hacienda') || combined.includes('cuota')) suggestedTopic = 'Autónomos y Fiscalidad';
      else if (combined.includes('inflación') || combined.includes('iva') || combined.includes('precio') || combined.includes('cesta')) suggestedTopic = 'Inflación y Coste de Vida';

      // Calcular virality_score real basado en los datos
      let viralityScore = 5.0;
      if (item.platform === 'Reddit') {
        viralityScore = Math.min(10.0, 3.0 + (item.score / 50) + (item.comments / 20));
      } else if (item.platform === 'Menéame' || item.platform === 'Prensa') {
        viralityScore = Math.min(10.0, 4.0 + (item.comments / 30));
      } else if (item.platform === 'Google Trends') {
        viralityScore = 8.5;
      } else if (item.platform === 'Telegram') {
        const views = item.views || 0;
        viralityScore = Math.min(10.0, 3.0 + (views / 25000));
      } else if (item.platform === 'X') {
        viralityScore = Math.min(10.0, 5.0 + (item.score / 100));
      } else if (item.platform === 'YouTube') {
        const views = item.views || 0;
        viralityScore = Math.min(10.0, 4.0 + (views / 15000));
      } else if (item.platform === 'TikTok' || item.platform === 'Instagram') {
        const views = item.views || 0;
        viralityScore = Math.min(10.0, 4.0 + (views / 20000));
      }

      // Calcular risk_score por el tipo de tema sensible
      let riskScore = 6.0;
      if (suggestedTopic.includes('Inmigración') || suggestedTopic.includes('Judicial') || suggestedTopic.includes('Caso Koldo')) {
        riskScore = 8.5; // Temas de alta crispación social o riesgo legal
      }

      // Deduplicador Jaccard semántico en caliente
      let isDuplicate = false;
      for (const claim of existingClaims) {
        if (getJaccardSimilarity(item.title, claim) > 0.45) {
          isDuplicate = true;
          break;
        }
      }
      if (isDuplicate) {
        continue; // Omitir duplicado semántico
      }

      try {
        insertScrapedItem.run(
          id,
          item.platform,
          item.link,
          `${item.title}\n\n${item.description}`,
          item.author,
          JSON.stringify({ score: item.score, comments: item.comments, imageUrl: item.imageUrl || null }),
          item.title,
          suggestedTopic,
          viralityScore,
          riskScore,
          item.origin_date || new Date().toISOString()
        );
        insertedCount++;
        existingClaims.push(item.title);
      } catch (dbErr) {
        console.error(`[Radar Motor] ❌ Error insertando debate en SQLite (${item.title}):`, dbErr.message);
      }
    }
  }

  console.log(`\n[Radar Motor] Escaneo completado. Se han añadido ${insertedCount} nuevos debates y tendencias relevantes a scraped_items.`);
  db.close();
}

runRadar().catch(err => {
  console.error('[Radar Motor] Error ejecutando el escaneo:', err);
});
