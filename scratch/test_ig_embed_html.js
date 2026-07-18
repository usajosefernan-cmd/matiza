import { chromium } from 'playwright';
import fs from 'node:fs';

async function main() {
  const url = 'https://www.instagram.com/p/C_q8-Iet79U/embed/';
  console.log(`Navegando a Embed: ${url}`);
  
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 800, height: 1000 });
    
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(5000);
    
    const html = await page.content();
    fs.writeFileSync('/home/ubuntu/workspace/projects/matiza/scratch/ig_embed.html', html);
    console.log(`HTML guardado. Tamaño: ${html.length} bytes.`);
    
    await page.screenshot({ path: '/home/ubuntu/workspace/projects/matiza/scratch/ig_embed.png' });
    console.log('Pantallazo guardado.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (browser) await browser.close();
  }
}

main();
