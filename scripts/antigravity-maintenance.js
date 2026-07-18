import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.resolve('data/matiza.db');

function run() {
  console.log('[Antigravity Maintenance] Iniciando limpieza de cola y leases...');
  try {
    const db = new DatabaseSync(dbPath);
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA journal_mode = WAL;');

    const nowStr = new Date().toISOString();

    // 1. Recuperar leases caducados
    const recoveryResult = db.prepare(`
      UPDATE verification_jobs
      SET status = 'queued',
          claimed_by = NULL,
          lease_expires_at = NULL,
          progress_phase = 'Reencolado por timeout de procesamiento',
          updated_at = ?
      WHERE status = 'claimed' AND lease_expires_at < ?
    `).run(nowStr, nowStr);

    if (recoveryResult.changes > 0) {
      console.log(`[Antigravity Maintenance] Se recuperaron y reencolaron ${recoveryResult.changes} trabajos colgados.`);
    }

    // 2. Marcar fallidos crónicos
    const failResult = db.prepare(`
      UPDATE verification_jobs
      SET status = 'failed',
          error_code = 'ERR_MAX_ATTEMPTS_EXCEEDED',
          error_message = 'Se superaron los 3 intentos máximos de procesamiento local',
          updated_at = ?
      WHERE status = 'queued' AND attempts >= max_attempts
    `).run(nowStr);

    if (failResult.changes > 0) {
      console.log(`[Antigravity Maintenance] Se marcaron ${failResult.changes} trabajos como fallidos permanentes (intentos excedidos).`);
    }

    db.close();
    console.log('[Antigravity Maintenance] Limpieza completada con éxito.');
  } catch (err) {
    console.error('[Antigravity Maintenance] ERROR en el mantenimiento:', err.message);
  }
}

run();
