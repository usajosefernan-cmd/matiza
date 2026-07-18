import { getDatabase } from '../../../lib/db.js';

export const prerender = false;

export async function GET() {
  let db;
  try {
    db = getDatabase();
    db.exec('PRAGMA foreign_keys = ON;');

    const claims = db.prepare(`
      SELECT 
        us.id as submission_id,
        us.detected_claim,
        us.virality_status,
        us.status as submission_status,
        us.created_at as submitted_at,
        a.id as article_id,
        a.title as article_title,
        a.verdict as article_verdict
      FROM user_submissions us
      LEFT JOIN articles a ON a.origin_url = us.submitted_url
      WHERE us.detected_claim IS NOT NULL AND us.detected_claim != ''
      ORDER BY us.created_at DESC
      LIMIT 6
    `).all();

    for (const claim of claims) {
      if (claim.article_id) {
        claim.evidences = db.prepare(`
          SELECT url, title, relevance_score, status 
          FROM sources 
          WHERE article_id = ?
          ORDER BY relevance_score DESC
        `).all(claim.article_id);
      } else {
        claim.evidences = [];
      }
    }

    db.close();
    return new Response(JSON.stringify({ claims }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (e) {
    if (db) {
      try { db.close(); } catch(err) {}
    }
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
