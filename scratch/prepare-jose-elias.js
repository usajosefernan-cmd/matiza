import { getDb } from '../scripts/matiza-engine/config.js';

const db = getDb();
const id = 'sub-1784082709958-691';

console.log('--- PREPARANDO BASE DE DATOS PARA JOSE ELÍAS ---');

// Verificar si ya existe en scraped_items
const existing = db.prepare("SELECT * FROM scraped_items WHERE id = ?").get(id);

if (existing) {
  console.log('El item ya existe en scraped_items:', existing);
  // Restablecer estado a 'pendiente' para poder trazarlo
  db.prepare("UPDATE scraped_items SET status = 'pendiente', metrics_json = ? WHERE id = ?").run(
    JSON.stringify({ imageUrl: 'https://i.ytimg.com/vi/k92_vP67Daw/hqdefault.jpg' }),
    id
  );
  console.log('Estado actualizado a \'pendiente\'.');
} else {
  console.log('Insertando nuevo registro en scraped_items...');
  db.prepare(`
    INSERT INTO scraped_items (id, platform, url, text, author_public_name, metrics_json, detected_claim, suggested_topic, virality_score, risk_score, status, created_at)
    VALUES (?, 'Usuario', 'https://youtu.be/k92_vP67Daw?si=ex0rp8fDNyNgJPtl', 'va tan mal españa ¿', 'Usuario Anónimo', ?, 'Jose Elías: España ha traicionado a su juventud, es muy difícil emprender por la burocracia e impuestos y la vivienda está disparada.', 'General', 9.0, 8.0, 'pendiente', '2026-07-15 02:31:49')
  `).run(
    id,
    JSON.stringify({ imageUrl: 'https://i.ytimg.com/vi/k92_vP67Daw/hqdefault.jpg' })
  );
  console.log('Insertado con éxito.');
}

// Limpiar artículos, revisiones, sources o social posts preexistentes de Jose Elías para evitar duplicados en la prueba
console.log('Limpiando posibles artículos anteriores de Jose Elías...');
const cleanArticles = db.prepare("SELECT id FROM articles WHERE title LIKE '%Jose Elías%' OR title LIKE '%José Elías%' OR claim LIKE '%Jose Elías%'").all();
for (const art of cleanArticles) {
  console.log(`Borrando relaciones de artículo: ${art.id}`);
  db.prepare("DELETE FROM article_topics WHERE article_id = ?").run(art.id);
  db.prepare("DELETE FROM article_tags WHERE article_id = ?").run(art.id);
  db.prepare("DELETE FROM reviews WHERE article_id = ?").run(art.id);
  db.prepare("DELETE FROM sources WHERE article_id = ?").run(art.id);
  db.prepare("DELETE FROM social_posts WHERE article_id = ?").run(art.id);
  db.prepare("DELETE FROM articles WHERE id = ?").run(art.id);
}

db.close();
console.log('Base de datos preparada.');
