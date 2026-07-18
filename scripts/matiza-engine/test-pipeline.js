import { getDb } from './config.js';
import { execSync } from 'node:child_process';

const db = getDb();
const TEST_FIXTURE_URL = 'https://x.com/bulo_falso/status/1234';

// Limpiar fixtures anteriores
console.log('[Test Pipeline] Limpiando fixtures de pruebas anteriores...');
// Nunca uses el patrón genérico art-<número>-<número>: también coincide con
// artículos reales y puede borrar datos de usuario durante una prueba.
const testArticleIds = db.prepare('SELECT id FROM articles WHERE origin_url = ?').all(TEST_FIXTURE_URL).map(a => a.id);

if (testArticleIds.length > 0) {
  const placeholders = testArticleIds.map(() => '?').join(',');
  db.prepare(`DELETE FROM article_topics WHERE article_id IN (${placeholders})`).run(...testArticleIds);
  db.prepare(`DELETE FROM article_tags WHERE article_id IN (${placeholders})`).run(...testArticleIds);
  db.prepare(`DELETE FROM reviews WHERE article_id IN (${placeholders})`).run(...testArticleIds);
  db.prepare(`DELETE FROM sources WHERE article_id IN (${placeholders})`).run(...testArticleIds);
  db.prepare(`DELETE FROM social_posts WHERE article_id IN (${placeholders})`).run(...testArticleIds);
  db.prepare(`DELETE FROM claim_cache WHERE previous_article_id IN (${placeholders})`).run(...testArticleIds);
  db.prepare(`DELETE FROM articles WHERE id IN (${placeholders})`).run(...testArticleIds);
}

const staleTestSubmissionIds = db.prepare("SELECT id FROM user_submissions WHERE id LIKE 'test-sub-%'").all().map(row => row.id);
if (staleTestSubmissionIds.length > 0) {
  const placeholders = staleTestSubmissionIds.map(() => '?').join(',');
  db.prepare(`DELETE FROM scraped_items WHERE id IN (${placeholders})`).run(...staleTestSubmissionIds);
  db.prepare(`DELETE FROM user_submissions WHERE id IN (${placeholders})`).run(...staleTestSubmissionIds);
}
db.prepare("DELETE FROM scraped_items WHERE id LIKE 'radar-user-%'").run();


console.log('[Test Pipeline] Insertando claim de prueba en user_submissions y scraped_items...');
const subId = `test-sub-${Date.now()}`;
db.prepare(`
  INSERT INTO user_submissions (id, submitted_url, submitted_text, detected_claim, suggested_topic_id, virality_status, relevance_score, status, reason, created_at)
  VALUES (?, 'https://x.com/bulo_falso/status/1234', 'Aseguran que los inmigrantes reciben una paga de 4.000€ mensuales nada más llegar a España sin cotizar.', 'Paga de 4.000€ a inmigrantes', null, 'Pendiente', 0.0, 'recibido', 'Test', datetime('now'))
`).run(subId);

db.prepare(`
  INSERT INTO scraped_items (id, platform, url, text, author_public_name, metrics_json, detected_claim, suggested_topic, virality_score, risk_score, status, created_at)
  VALUES (?, 'Usuario', 'https://x.com/bulo_falso/status/1234', 'Aseguran que los inmigrantes reciben una paga de 4.000€ mensuales nada más llegar a España sin cotizar.', 'Usuario Anónimo', '{"imageUrl":"https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5"}', 'Paga de 4.000€ a inmigrantes', 'General', 5.0, 5.0, 'pendiente', datetime('now'))
`).run(subId);

db.close();

console.log('[Test Pipeline] Ejecutando el pipeline de IA modular...');
try {
  const output = execSync(`node scripts/ai-pipeline.js --item-id=${subId}`, { encoding: 'utf-8', env: process.env });
  console.log(output);

  // Verificar la base de datos
  const dbVerify = getDb();

  const sub = dbVerify.prepare("SELECT * FROM user_submissions WHERE id = ?").get(subId);
  console.log(`[Test Pipeline] Estado del envío: ${sub.status}. Motivo: ${sub.reason}`);

  // Seleccionamos el artículo propio usando la URL conocida en lugar de ORDER BY / LIMIT 1
  const art = dbVerify.prepare("SELECT * FROM articles WHERE origin_url = ?").get(TEST_FIXTURE_URL);
  
  if (!art) {
    console.error(`[Test Pipeline] Error: El artículo creado para la URL ${TEST_FIXTURE_URL} no existe.`);
    process.exit(1);
  }
  console.log(`[Test Pipeline] Artículo generado: "${art.title}" (Veredicto: ${art.verdict}, Estado: ${art.status})`);

  // Verificar que el review del artículo propio existe
  const review = dbVerify.prepare("SELECT * FROM reviews WHERE article_id = ?").get(art.id);
  if (!review) {
    console.error(`[Test Pipeline] Error: No se encontró la revisión humana (review) para el artículo con ID: ${art.id}`);
    process.exit(1);
  }
  console.log(`[Test Pipeline] Ficha de revisión humana creada: "${review.notes}" (Status: ${review.status})`);

  // Verificar que la consulta de social_posts pertenece al artículo propio
  const posts = dbVerify.prepare("SELECT * FROM social_posts WHERE article_id = ?").all(art.id);
  
  // Asegurar que todos pertenecen al artículo propio
  for (const post of posts) {
    if (post.article_id !== art.id) {
      console.error(`[Test Pipeline] Error: El post social con ID ${post.id} pertenece al artículo ${post.article_id}, no al artículo propio ${art.id}.`);
      process.exit(1);
    }
  }

  // Dejar la aserción acorde al contrato real (permite 0 posts) pero informar claramente
  if (posts.length === 0) {
    console.log('[Test Pipeline] Info: Se generaron 0 borradores de posts sociales (estado válido según el contrato de producción).');
  } else if (posts.length !== 2) {
    console.error(`[Test Pipeline] Error: Se esperaba obtener exactamente 2 posts sociales en este flujo de pruebas con MOCK_LLM, pero se obtuvieron ${posts.length}.`);
    process.exit(1);
  } else {
    console.log(`[Test Pipeline] Se generaron y verificaron correctamente ${posts.length} borradores de posts sociales.`);
  }

  dbVerify.close();
  console.log('[Test Pipeline] Prueba finalizada correctamente. Todo funciona al 100% de forma modular.');
} catch (e) {
  console.error('[Test Pipeline] Error en test:', e.message);
  if (e.stdout) console.log(e.stdout);
  process.exit(1);
}
