export const prerender = false;
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

export async function POST({ request }) {
  try {
    const data = await request.json();
    const url = data.url || '';
    const text = data.text || '';

    if (!url.trim() && !text.trim()) {
      return new Response(JSON.stringify({ success: false, error: 'Debes proporcionar una URL o un texto explicativo.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const dbPath = process.env.SQLITE_DB_PATH || import.meta.env.SQLITE_DB_PATH || path.resolve('data/matiza.db');
    const db = new DatabaseSync(dbPath);
    db.exec('PRAGMA foreign_keys = ON;');

    // 1. Triage preliminar: Comprobar si ya existe un artículo publicado que tenga coincidencia con palabras clave
    const searchText = (text.trim() || url.trim()).toLowerCase();
    let existingArticle = null;

    if (searchText.length > 5) {
      const articles = db.prepare("SELECT slug, title, verdict FROM articles WHERE status = 'publicado'").all();
      for (const art of articles) {
        if (searchText.includes(art.title.toLowerCase()) || art.title.toLowerCase().includes(searchText)) {
          existingArticle = art;
          break;
        }
      }
    }

    if (existingArticle) {
      db.close();
      return new Response(JSON.stringify({
        success: true,
        already_exists: true,
        verdict: existingArticle.verdict,
        slug: existingArticle.slug,
        title: existingArticle.title,
        message: '¡Este tema ya ha sido verificado!'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Comprobar si ya ha sido enviado por otros usuarios
    const duplicate = db.prepare("SELECT status FROM user_submissions WHERE submitted_url = ? OR submitted_text = ?").get(url || null, text || null);
    if (duplicate) {
      db.close();
      return new Response(JSON.stringify({
        success: true,
        already_exists: false,
        status: duplicate.status,
        message: 'Este claim ya ha sido reportado por otro usuario y está en fase de triage/monitoreo.'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Registrar el nuevo envío
    const id = `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    db.prepare(`
      INSERT INTO user_submissions (id, submitted_url, submitted_text, detected_claim, suggested_topic_id, virality_status, relevance_score, status, reason, created_at)
      VALUES (?, ?, ?, ?, null, 'Pendiente de análisis', 0.0, 'recibido', 'Espera de análisis automático del pipeline', datetime('now'))
    `).run(id, url || null, text || null, text.substring(0, 100));

    db.close();

    return new Response(JSON.stringify({
      success: true,
      already_exists: false,
      status: 'recibido',
      message: 'Tu reporte ha sido recibido por el radar. Nuestros motores lo analizarán en el próximo ciclo.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
