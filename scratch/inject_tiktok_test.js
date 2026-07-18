import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = process.env.SQLITE_DB_PATH || '/home/ubuntu/workspace/projects/matiza/data/matiza.db';
const db = new DatabaseSync(dbPath);

const itemId = `test-tiktok-${Date.now()}`;

console.log(`[Inject TikTok] Insertando claim de TikTok en la base de datos (${dbPath})...`);

db.prepare(`
  INSERT INTO scraped_items (
    id, platform, url, text, author_public_name, metrics_json, 
    detected_claim, suggested_topic, virality_score, risk_score, status, created_at
  ) VALUES (?, 'TikTok', 'https://www.tiktok.com/@impuestos_hoy/video/729108399', 
    'Vídeo de TikTok asegura que el Gobierno español obliga a los autónomos a pagar un 70% de impuestos fijos desde la primera cuota.',
    'impuestos_hoy', '{"views": 25000, "likes": 1500, "comments": 200}',
    'El Gobierno obliga a los autónomos en España a pagar un 70% de impuestos fijos',
    'Autónomos y Fiscalidad', 85.0, 75.0, 'triage_completado', datetime('now')
  )
`).run(itemId);

db.close();
console.log(`[Inject TikTok] Inyección completada. Item ID: ${itemId}`);
