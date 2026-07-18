import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { detectHotTopics } from './matiza-engine/00-hot-topics-cron.js';

const dbPath = path.resolve('data/matiza.db');

async function run() {
  console.log('[Antigravity Radar] Iniciando escaneo de tendencias y redes sociales...');
  
  try {
    // 1. Ejecutar deteccion de temas candentes (Hot Topics)
    const normalizedTopics = await detectHotTopics(false);
    console.log(`[Antigravity Radar] Se detectaron y guardaron ${normalizedTopics?.length || 0} candidatos potenciales.`);

    const db = new DatabaseSync(dbPath);
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA journal_mode = WAL;');

    // 2. Buscar candidatos pendientes en la tabla topic_candidates
    const candidates = db.prepare(`
      SELECT * FROM topic_candidates
      WHERE status = 'pendiente'
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

    if (!candidates.length) {
      console.log('[Antigravity Radar] No hay nuevos candidatos pendientes en topic_candidates para verificar.');
      db.close();
      return;
    }

    console.log(`[Antigravity Radar] Encolando ${candidates.length} candidatos de redes sociales en verification_jobs...`);

    const insertJob = db.prepare(`
      INSERT INTO verification_jobs (id, job_type, input_type, input_text, priority, status, progress_phase, progress_percent, created_at, updated_at)
      VALUES (?, 'social_radar_candidate', 'text', ?, 'normal', 'queued', 'En cola esperando motor local', 0, datetime('now'), datetime('now'))
    `);

    const updateCandidate = db.prepare(`
      UPDATE topic_candidates
      SET status = 'procesado', updated_at = datetime('now')
      WHERE id = ?
    `);

    for (const cand of candidates) {
      const jobId = `job-radar-${cand.id.slice(-6)}-${Date.now().toString().slice(-4)}`;
      const textToVerify = `¿Es real o un bulo lo siguiente?: ${cand.title}. Contexto de debate social: ${cand.summary}`;

      insertJob.run(jobId, textToVerify);
      updateCandidate.run(cand.id);
      
      console.log(`  -> Encolado candidato ${cand.id} en job ${jobId}`);
    }

    db.close();
    console.log('[Antigravity Radar] Finalizado el encolamiento de candidatos del radar.');

  } catch (err) {
    console.error('[Antigravity Radar] ERROR en el radar programado:', err.message);
  }
}

run();
