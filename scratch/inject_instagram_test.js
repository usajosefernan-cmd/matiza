import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = process.env.SQLITE_DB_PATH || '/home/ubuntu/db/matiza/matiza.db';
console.log(`[Test Injector] Conectando a la base de datos en: ${dbPath}`);

try {
  const db = new DatabaseSync(dbPath);
  
  const id = `radar-instagram-${Buffer.from('https://www.instagram.com/p/C6hM7s9oGZ3/').toString('base64').substring(0, 32)}`;
  const platform = 'Instagram';
  const url = 'https://www.instagram.com/p/C6hM7s9oGZ3/';
  const author = '@espana_patriota_news';
  const text = 'BRUTAL ROBO: Se filtra el decreto de ayudas de alquiler donde se prioriza con un 85% de puntuación extra a colectivos vulnerables extranjeros y okupas frente a trabajadores nacionales españoles. ¡Escándalo total ocultan la verdad! #okupas #ayudas #vergüenza #censurado';
  const title = 'Se prioriza con un 85% de puntuación extra a colectivos extranjeros y okupas frente a trabajadores nacionales en ayudas de alquiler';
  const suggestedTopic = 'Inmigración, Delincuencia y Ayudas';
  const viralityScore = 7.8;
  const riskScore = 8.5;
  
  const metricsJson = JSON.stringify({
    score: 1850,
    comments: 312,
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=600&auto=format&fit=crop'
  });

  db.prepare("DELETE FROM scraped_items WHERE id = ?").run(id);

  const insertScrapedItem = db.prepare(`
    INSERT INTO scraped_items (id, platform, url, text, author_public_name, metrics_json, detected_claim, suggested_topic, virality_score, risk_score, status, origin_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'triage_completado', ?, datetime('now'))
  `);

  insertScrapedItem.run(
    id,
    platform,
    url,
    text,
    author,
    metricsJson,
    title,
    suggestedTopic,
    viralityScore,
    riskScore,
    new Date().toISOString()
  );

  console.log(`✅ Post de Instagram inyectado con éxito: ${id}`);
  db.close();
} catch (err) {
  console.error('❌ Error inyectando post:', err);
}
