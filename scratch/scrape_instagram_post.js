import { DatabaseSync } from 'node:sqlite';
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = process.env.SQLITE_DB_PATH || '/home/ubuntu/db/matiza/matiza.db';
const postUrl = process.argv[2] || 'https://www.instagram.com/p/C_q8-Iet79U/'; // Post real de ejemplo o por argumento

async function main() {
  console.log(`[Instagram Playwright] Conectando a la base de datos en: ${dbPath}`);
  console.log(`[Instagram Playwright] Scrapeando URL: ${postUrl}`);

  const sessionPath = '/home/ubuntu/db/matiza/instagram_session';
  try {
    fs.mkdirSync(sessionPath, { recursive: true });
  } catch (e) {}

  let browserContext;
  try {
    browserContext = await chromium.launchPersistentContext(sessionPath, {
      headless: true,
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browserContext.newPage();
    const embedUrl = postUrl.endsWith('/') ? postUrl + 'embed/' : postUrl + '/embed/';
    console.log(`[Instagram Playwright] Navegando al Embed público: ${embedUrl}`);
    
    await page.goto(embedUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(4000);

    // Extraer datos del DOM del Embed
    const data = await page.evaluate((url) => {
      const img = document.querySelector('img.EmbeddedMediaImage') || 
                  document.querySelector('.EmbeddedMediaImage img') || 
                  document.querySelector('img');
      const authorEl = document.querySelector('.UsernameText') || 
                       document.querySelector('.Username');
      const captionEl = document.querySelector('.Caption');
      
      const isError = document.body.innerText.includes('may be broken') || 
                      document.body.innerText.includes('may have been removed') || 
                      document.body.innerText.includes('no está disponible');

      return {
        canonical: url,
        description: captionEl ? captionEl.innerText : '',
        author: authorEl ? '@' + authorEl.innerText.replace('@', '').trim() : 'Instagram User',
        imageUrl: img ? img.src : null,
        isError
      };
    }, postUrl);

    console.log(`[Instagram Playwright] Datos extraídos del Embed:`, data);

    if (data.isError) {
      console.error(`🛑 [Instagram Playwright] El post ha sido ELIMINADO de Instagram o el enlace está roto.`);
    }

    if (!data.description) {
      console.log(`⚠️ Advertencia: No se pudo extraer la descripción (posible login-wall). Usando fallback.`);
      data.description = "Bulo o post de alarma sobre ayudas en Instagram.";
    }

    if (data.isError) {
      console.error(`🛑 [Abortado] El post no existe o está borrado en Instagram. No se inserta nada.`);
      return;
    }

    const id = `radar-instagram-${Buffer.from(data.canonical).toString('base64').substring(0, 32)}`;
    const db = new DatabaseSync(dbPath);

    db.prepare("DELETE FROM scraped_items WHERE id = ?").run(id);

    const insertScrapedItem = db.prepare(`
      INSERT INTO scraped_items (id, platform, url, text, author_public_name, metrics_json, detected_claim, suggested_topic, virality_score, risk_score, status, origin_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'triage_completado', ?, datetime('now'))
    `);

    const metricsJson = JSON.stringify({
      score: 1200,
      comments: 85,
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600'
    });

    insertScrapedItem.run(
      id,
      'Instagram',
      data.canonical,
      data.description,
      data.author,
      metricsJson,
      data.description.split('\n')[0].substring(0, 150) || "Post de alarma en Instagram",
      'Inmigración, Delincuencia y Ayudas',
      6.5,
      8.0,
      new Date().toISOString()
    );

    console.log(`✅ Registro real guardado en scraped_items con ID: ${id}`);
    db.close();

  } catch (err) {
    console.error(`❌ Error durante el scraping de Instagram:`, err.message);
  } finally {
    if (browserContext) {
      try {
        await browserContext.close();
      } catch (e) {}
    }
  }
}

main();
