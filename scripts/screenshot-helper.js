import fs from 'node:fs';
import path from 'node:path';

/**
 * Captura una imagen de una URL dada y la guarda en la carpeta pública.
 * @param {string} url La URL a capturar.
 * @param {string} id Identificador único para el archivo de salida.
 * @returns {Promise<string|null>} Ruta relativa del archivo guardado o null si falla.
 */
export async function getOrCapturePostImage(url, id) {
  if (!url) return null;
  console.log(`[Screenshot Helper] Iniciando captura de pantalla para URL: ${url}`);
  
  const uploadDir = path.resolve('public/uploads');
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (e) {
    console.error(`[Screenshot Helper] Error creando directorio de subidas:`, e.message);
  }

  // Sanitizar el ID para usarlo como nombre de archivo
  const safeId = String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `screenshot_${safeId}_${Date.now()}.png`;
  const outPath = path.join(uploadDir, filename);
  const relativeUrl = `/uploads/${filename}`;

  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    
    // Configurar tiempo de espera razonable
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Esperar un poco para que se rendericen elementos dinámicos
    await page.waitForTimeout(3000);
    
    // Captura de pantalla de la página
    await page.screenshot({ path: outPath, type: 'png' });
    await browser.close();
    
    console.log(`[Screenshot Helper] Captura completada con éxito y guardada en: ${outPath}`);
    return relativeUrl;
  } catch (err) {
    console.error(`[Screenshot Helper] Error al capturar pantalla con Playwright:`, err.message);
    // Devolvemos null de manera controlada para no abortar de forma crítica el pipeline en entornos sin navegador configurado
    return null;
  }
}
