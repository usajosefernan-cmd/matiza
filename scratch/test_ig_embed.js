import { chromium } from 'playwright';

async function main() {
  const url = 'https://www.instagram.com/p/C_q8-Iet79U/embed/';
  console.log(`Navegando a la URL de Embed de Instagram: ${url}`);
  
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Configurar User Agent e idioma común para evitar sospechas
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'es-ES,es;q=0.9'
    });
    
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(4000);
    
    // Obtener título y ver si cargó la página de error o el post
    const title = await page.title();
    console.log(`Título de la página: "${title}"`);
    
    // Extraer datos del DOM del Embed
    const data = await page.evaluate(() => {
      const img = document.querySelector('img.EmbeddedMediaImage') || 
                  document.querySelector('.EmbeddedMediaImage img') || 
                  document.querySelector('img');
      const authorEl = document.querySelector('.UsernameText');
      const captionEl = document.querySelector('.Caption');
      
      return {
        imageUrl: img ? img.src : null,
        author: authorEl ? authorEl.innerText : null,
        caption: captionEl ? captionEl.innerText : null,
        html: document.body.innerHTML.substring(0, 1000) // snippet para debug
      };
    });
    
    console.log('--- DATOS EXTRAÍDOS DEL EMBED ---');
    console.log('Imagen URL:', data.imageUrl);
    console.log('Autor:', data.author);
    console.log('Texto/Caption:', data.caption ? data.caption.substring(0, 150) + '...' : 'No encontrado');
    
  } catch (err) {
    console.error('Error al navegar o extraer:', err.message);
  } finally {
    if (browser) await browser.close();
  }
}

main();
