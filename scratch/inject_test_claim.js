import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = process.env.SQLITE_DB_PATH || import.meta.env.SQLITE_DB_PATH || path.resolve('data/matiza.db');
console.log('[Test Inject] Conectando a la DB en:', dbPath);
const db = new DatabaseSync(dbPath);

db.exec(`
  INSERT INTO scraped_items (
    id, platform, url, text, author_public_name, metrics_json, detected_claim, suggested_topic, virality_score, risk_score, status, created_at
  ) VALUES (
    'test-claim-1', 
    'Telegram', 
    'https://t.me/alviseperez/102030', 
    'El Gobierno ha aprobado una rebaja radical de las pensiones de jubilación un 15% para el próximo año en el BOE.', 
    'Alvise Pérez', 
    '{}', 
    'Rebaja del 15% en las pensiones de jubilación para el próximo año en el BOE', 
    'Pensiones y Sostenibilidad', 
    9.5, 
    8.5, 
    'pendiente', 
    datetime('now')
  );
`);

console.log('[Test Inject] ¡Fila de prueba insertada con éxito!');
db.close();
