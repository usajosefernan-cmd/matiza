import { getDb, callGemini } from './config.js';
import { getTopicCache, setTopicCache } from './cache.js';

export async function updateTopicHeader(topicId, signal = null) {
  console.log(`[Topic Updater] Actualizando cabecera del vertical: ${topicId}`);
  const db = getDb();

  try {
    // 1. Obtener los detalles actuales del vertical
    const topic = db.prepare("SELECT * FROM topics WHERE id = ?").get(topicId);
    if (!topic) {
      throw new Error(`Tema con ID ${topicId} no encontrado.`);
    }

    // 2. Obtener todas las piezas publicadas de este vertical
    const publishedArticles = db.prepare(`
      SELECT title, subtitle, verdict, claim, summary, published_at
      FROM articles
      WHERE topic_id = ? AND status = 'publicado'
      ORDER BY published_at DESC
    `).all(topicId);

    // 3. Obtener todas las fuentes oficiales consolidadas de este vertical
    const topicSources = db.prepare(`
      SELECT DISTINCT s.title, s.url
      FROM sources s
      JOIN articles a ON s.article_id = a.id
      WHERE a.topic_id = ? AND a.status = 'publicado'
    `).all(topicId);

    if (publishedArticles.length === 0) {
      console.log(`[Topic Updater] No hay artículos publicados para el tema ${topicId}. Omitiendo actualización de cabecera.`);
      return;
    }

    // Cargar caché del tema
    const cached = getTopicCache(topicId) || { recurring_confusions: [] };

    const prompt = `
Eres el Editor Jefe de MATIZA España. Tu tarea es actualizar de forma incremental la cabecera explicativa estable del vertical con ID "${topicId}".
Debes revisar los artículos publicados recientemente y las fuentes oficiales del tema para consolidar un resumen objetivo, cronología de claims y preguntas frecuentes actualizadas.

DATOS ACTUALES DEL VERTICAL:
- Título: "${topic.title}"
- Descripción actual: "${topic.description || ''}"
- Cabecera resumen actual: "${topic.header_summary || ''}"

ÚLTIMAS PIEZAS PUBLICADAS DENTRO:
${JSON.stringify(publishedArticles)}

FUENTES OFICIALES ASOCIADAS:
${JSON.stringify(topicSources)}

HISTORIAL DE CONFUSIONES RECURRENTES EN CACHÉ:
${JSON.stringify(cached.recurring_confusions)}

--- REGLA DE ACTUALIZACIÓN ---
No inventes información que no esté fundamentada en los artículos provistos o las fuentes.
Actualiza los campos estructurando de forma clara, neutral y periodística.

Devuelve un JSON con la estructura exacta:
{
  "header_summary": "[Resumen ejecutivo consolidado del tema social hoy en España. Máximo 4 líneas]",
  "verdict_summary": "[Resumen rápido del veredicto común o la verdad factual consolidada]",
  "main_confusions": ["[Confusión 1 de actualidad]", "[Confusión 2]"],
  "canonical_summary": "[Explicación y contexto base detallado para el lector sobre por qué preocupa este tema en España hoy]"
}
`;

    let updateData = null;
    try {
      updateData = await callGemini(prompt, null, signal);
      console.log(`[Topic Updater] Datos del vertical consolidados por la IA.`);
    } catch (err) {
      console.warn('[Topic Updater] Fallo al llamar a la IA para actualizar el tema. Usando fallback.');
      updateData = {
        header_summary: topic.header_summary || 'Actualización periódica del expediente social.',
        verdict_summary: topic.verdict_summary || 'Múltiples claims contrastados bajo investigación.',
        main_confusions: cached.recurring_confusions.length > 0 ? cached.recurring_confusions : ['Mitos propagados en redes sociales'],
        canonical_summary: topic.description || 'Contexto general del expediente en base a datos oficiales.'
      };
    }

    // 4. Actualizar la base de datos `topics`
    db.prepare(`
      UPDATE topics
      SET header_summary = ?, verdict_summary = ?, description = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(updateData.header_summary, updateData.verdict_summary, updateData.canonical_summary, topicId);

    // 5. Actualizar la caché del tema `topic_cache`
    setTopicCache(topicId, {
      canonical_summary: updateData.canonical_summary,
      trusted_sources: topicSources,
      recurring_confusions: updateData.main_confusions,
      known_claims: publishedArticles.map(a => a.claim),
      source_strategy: { sources_count: topicSources.length }
    }, db);

    console.log(`[Topic Updater] ✅ Cabecera del vertical ${topicId} actualizada de forma incremental.`);
  } catch (e) {
    console.error(`[Topic Updater] ❌ Error actualizando el vertical ${topicId}:`, e.message);
  } finally {
    db.close();
  }
}
