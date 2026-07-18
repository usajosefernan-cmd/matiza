import { getDb } from '../scripts/matiza-engine/config.js';

const db = getDb();
const art = db.prepare("SELECT id FROM articles WHERE title LIKE '%Jose Elías%' OR title LIKE '%José Elías%'").get();
if (!art) {
  console.error("No se encontró el artículo de Jose Elías!");
  db.close();
  process.exit(1);
}

const articleId = art.id;
console.log(`Encontrado artículo con ID: ${articleId}`);

// 1. Actualizar artículo a borrador y human_review_required = 1
db.prepare("UPDATE articles SET status = 'borrador', human_review_required = 1, published_at = null WHERE id = ?").run(articleId);
console.log("Artículo actualizado a 'borrador' con revisión humana requerida.");

// 2. Actualizar la review a 'pendiente' y checklist_json a false
const review = db.prepare("SELECT id FROM reviews WHERE article_id = ?").get(articleId);
if (review) {
  const checklist = {
    fuente_original_suficiente: false,
    veredicto_coherente: false,
    titular_neutral: false,
    no_acusacion_sin_prueba: false,
    no_riesgo_legal_evidente: false,
    encaja_vertical_correcto: false,
    merece_publicarse: false
  };
  db.prepare("UPDATE reviews SET status = 'pendiente', checklist_json = ? WHERE article_id = ?").run(
    JSON.stringify(checklist),
    articleId
  );
  console.log("Review actualizada a 'pendiente'.");
}

// 3. Vincular los otros temas en article_topics
db.prepare("INSERT OR IGNORE INTO article_topics (article_id, topic_id) VALUES (?, 't-autonomos')").run(articleId);
db.prepare("INSERT OR IGNORE INTO article_topics (article_id, topic_id) VALUES (?, 't-empleo')").run(articleId);
console.log("Temas adicionales t-autonomos y t-empleo vinculados en article_topics.");

// 4. Asegurar que user_submissions y scraped_items tengan estados correctos
db.prepare("UPDATE user_submissions SET status = 'en_cola', reason = 'Aprobado para investigación - Borrador generado en revisión humana' WHERE id = 'sub-1784082709958-691'").run();
db.prepare("UPDATE scraped_items SET status = 'procesado' WHERE id = 'sub-1784082709958-691'").run();
console.log("Estados de user_submissions y scraped_items actualizados.");

db.close();
console.log("Finalización exitosa.");
