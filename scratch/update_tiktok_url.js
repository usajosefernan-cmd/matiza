import { DatabaseSync } from 'node:sqlite';

const dbPath = process.env.SQLITE_DB_PATH || '/home/ubuntu/workspace/projects/matiza/data/matiza.db';
const db = new DatabaseSync(dbPath);

const fakeUrl = 'https://www.tiktok.com/@impuestos_hoy/video/729108399';
const realUrl = 'https://www.tiktok.com/@malditobulo/video/7212002347101588741';

console.log(`[Update TikTok URL] Conectado a la base de datos: ${dbPath}`);

// 1. Actualizar scraped_items
const updateScraped = db.prepare(`
  UPDATE scraped_items 
  SET url = ? 
  WHERE url = ?
`);
const resScraped = updateScraped.run(realUrl, fakeUrl);
console.log(`[Update TikTok URL] Filas actualizadas en scraped_items: ${resScraped.changes}`);

// 2. Actualizar articles
const updateArticles = db.prepare(`
  UPDATE articles 
  SET origin_url = ? 
  WHERE origin_url = ?
`);
const resArticles = updateArticles.run(realUrl, fakeUrl);
console.log(`[Update TikTok URL] Filas actualizadas en articles: ${resArticles.changes}`);

db.close();
console.log('[Update TikTok URL] Completado.');
