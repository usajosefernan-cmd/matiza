import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = process.env.SQLITE_DB_PATH || path.resolve('data/matiza.db');
console.log('[Test Inject] Conectando a la DB en:', dbPath);
const db = new DatabaseSync(dbPath);

db.exec(`
  INSERT OR REPLACE INTO scraped_items (
    id, platform, url, text, author_public_name, metrics_json, detected_claim, suggested_topic, virality_score, risk_score, status, created_at
  ) VALUES (
    'manual-test-radar-1', 
    'YouTube', 
    'https://www.youtube.com/watch?v=AAmdB1bvmYw', 
    'El Gobierno de España ha aprobado una ley en el BOE que congela la cuota mínima de los autónomos en 500 euros mensuales para el 2026.', 
    'Canal Autónomos', 
    '{"views": 250000}', 
    'El Gobierno de España ha aprobado una ley en el BOE que congela la cuota mínima de los autónomos en 500 euros mensuales para el 2026', 
    'Autónomos y Fiscalidad', 
    9.0, 
    8.0, 
    'triage_completado', 
    datetime('now')
  );
`);

console.log('[Test Inject] ¡Fila de prueba inyectada con status triage_completado con éxito!');
db.close();
