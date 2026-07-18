import { chromium } from 'playwright';

async function checkUrl(url) {
  console.log(`Verificando URL: ${url}`);
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);
    const title = await page.title();
    console.log(`Título de la página: "${title}"`);
    
    const isErrorPage = await page.evaluate(() => {
      return document.body.innerText.includes('Esta página no está disponible') || 
             document.body.innerText.includes('Page Not Found') || 
             document.body.innerText.includes('Page not available');
    });
    
    console.log(`¿Es página de error?: ${isErrorPage}`);
  } catch (e) {
    console.error(`Error al verificar: ${e.message}`);
  } finally {
    if (browser) await browser.close();
  }
}

async function main() {
  await checkUrl('https://www.instagram.com/p/C_q8-Iet79U/'); // Con I mayúscula
  console.log('-----------------------------');
  await checkUrl('https://www.instagram.com/p/C_q8-let79U/'); // Con l minúscula
}

main();
