import { getDb } from './config.js';

export function queueForReview(articleId, reviewerNotes = '') {
  console.log(`[Review Queue] Añadiendo artículo ${articleId} a la cola de revisión humana...`);
  const db = getDb();

  try {
    // 1. Verificar si el artículo existe
    const art = db.prepare("SELECT * FROM articles WHERE id = ?").get(articleId);
    if (!art) {
      throw new Error(`Artículo con ID ${articleId} no encontrado en la DB.`);
    }

    // 2. Insertar en la tabla reviews
    const reviewId = `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const checklist = {
      fuente_original_suficiente: false,
      veredicto_coherente: false,
      titular_neutral: false,
      no_acusacion_sin_prueba: false,
      no_riesgo_legal_evidente: false,
      encaja_vertical_correcto: false,
      merece_publicarse: false
    };

    db.prepare(`
      INSERT OR REPLACE INTO reviews (id, article_id, reviewer, checklist_json, status, notes, created_at)
      VALUES (?, ?, ?, ?, 'pendiente', ?, datetime('now'))
    `).run(
      reviewId,
      articleId,
      'IA Engine Quality System',
      JSON.stringify(checklist),
      reviewerNotes || 'Autogenerado por el pipeline del motor MATIZA. Requiere revisión editorial rápida.'
    );

    // 3. Asegurar que el estado del artículo es borrador (sólo si no se forzó su publicación como publicado)
    if (art.status !== 'publicado') {
      db.prepare("UPDATE articles SET status = 'borrador', human_review_required = 1 WHERE id = ?").run(articleId);
      console.log(`[Review Queue] ✅ Registro de revisión ${reviewId} creado. Artículo establecido como borrador.`);
    } else {
      console.log(`[Review Queue] ✅ Registro de revisión ${reviewId} creado. El artículo permanece como PUBLICADO de forma automática.`);
    }
    return {
      review_id: reviewId,
      status: 'success'
    };
  } catch (e) {
    console.error(`[Review Queue] ❌ Error en cola de revisión:`, e.message);
    return {
      status: 'error',
      message: e.message
    };
  } finally {
    db.close();
  }
}
