import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.resolve('data/matiza.db');
const db = new DatabaseSync(dbPath);

console.log('--- CONTEO POR PLATAFORMA EN SCRAPED_ITEMS ---');
try {
  const counts = db.prepare("SELECT platform, status, count(*) as total FROM scraped_items GROUP BY platform, status").all();
  counts.forEach(c => {
    console.log(`Plataforma: ${c.platform} | Status: ${c.status} | Total: ${c.total}`);
  });
} catch (err) {
  console.error('Error:', err.message);
} finally {
  db.close();
}
