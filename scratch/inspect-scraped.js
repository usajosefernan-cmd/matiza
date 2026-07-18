import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.resolve('data/matiza.db');
const db = new DatabaseSync(dbPath);

console.log('--- INSPECCIÓN DE SCRAPED_ITEMS EN MATIZAME ---');
try {
  const items = db.prepare("SELECT id, platform, status, detected_claim, suggested_topic, virality_score, created_at FROM scraped_items ORDER BY created_at DESC LIMIT 25").all();
  console.log(`Total registros encontrados: ${items.length}`);
  items.forEach((item, idx) => {
    console.log(`[${idx + 1}] ID: ${item.id} | Platform: ${item.platform} | Status: ${item.status} | Virality: ${item.virality_score}`);
    console.log(`    Claim: "${item.detected_claim}"`);
    console.log(`    Topic: "${item.suggested_topic}"`);
    console.log('----------------------------------------------------');
  });
} catch (err) {
  console.error('Error:', err.message);
} finally {
  db.close();
}
