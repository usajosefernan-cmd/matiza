import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = process.env.SQLITE_DB_PATH || path.resolve('data/matiza.db');
const db = new DatabaseSync(dbPath);

console.log('Insertando claim de prueba de YouTube en:', dbPath);

db.prepare(`
  INSERT OR REPLACE INTO scraped_items (
    id, platform, url, text, author_public_name, metrics_json, 
    detected_claim, suggested_topic, virality_score, risk_score, 
    status, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
`).run(
  'youtube-test-1',
  'YouTube',
  'https://youtu.be/k92_vP67Daw?si=fsxv0nrOR6ma4mau',
  'Vídeo de Jose Elías en el podcast El Director debatiendo sobre vivienda, salarios, impuestos y por qué España no funciona.',
  'Jose Elías / El Director',
  JSON.stringify({
    score: 120000,
    comments: 800,
    imageUrl: 'https://i.ytimg.com/vi/k92_vP67Daw/hqdefault.jpg'
  }),
  'Jose Elías: España ha traicionado a su juventud, es muy difícil emprender por la burocracia e impuestos y la vivienda está disparada.',
  'Economía e Impuestos',
  15.0,
  5.0,
  'pendiente'
);

console.log('Claim de YouTube insertado con éxito en estado PENDIENTE.');
db.close();
