export const prerender = false;
import { getDatabase, closeDatabase } from '../../lib/db.js';

export async function GET({ request }) {
  const urlObj = new URL(request.url);
  const jobId = urlObj.searchParams.get('id');

  if (!jobId) {
    return new Response(JSON.stringify({ success: false, error: 'Falta el parámetro id del trabajo.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const db = getDatabase();
    const job = db.prepare(`
      SELECT status, progress_phase, progress_percent, result_id, error_message
      FROM verification_jobs
      WHERE id = ?
    `).get(jobId);

    if (!job) {
      return new Response(JSON.stringify({ success: false, error: 'Trabajo no encontrado.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let slug = null;
    if (job.status === 'completed' && job.result_id) {
      const article = db.prepare(`
        SELECT slug FROM articles
        WHERE id = ?
      `).get(job.result_id);
      if (article) {
        slug = article.slug;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      status: job.status,
      progress_phase: job.progress_phase,
      progress_percent: job.progress_percent,
      error_message: job.error_message,
      slug: slug
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
