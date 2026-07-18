import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { exec } from 'node:child_process';

const dbPath = process.env.SQLITE_DB_PATH || import.meta.env.SQLITE_DB_PATH || path.resolve('data/matiza.db');
const CHECK_INTERVAL_MS = 10000; // Cada 10 segundos

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║ 📡 MATIZA: DAEMON DE SINCRONIZACIÓN REACTIVA LOCAL  ║');
console.log('║  (Simulador Hermes VPS - Vigilancia de Reportes)    ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log(`[Daemon] Buscando reportes pendientes en: ${dbPath}`);
console.log(`[Daemon] Intervalo de vigilancia: ${CHECK_INTERVAL_MS / 1000} segundos.`);

function runCommandAsync(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ [Error Comando]: ${error.message}`);
        return reject(error);
      }
      resolve({ stdout, stderr });
    });
  });
}

let isSyncing = false;

async function checkAndSync() {
  if (isSyncing) {
    console.log('[Daemon] Pipeline de IA ya se está ejecutando. Saltando intervalo para evitar colapsar la CPU...');
    return;
  }
  if (!fs.existsSync(dbPath)) {
    return;
  }

  let db;
  try {
    db = new DatabaseSync(dbPath);
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA journal_mode = WAL;');

    // Comprobar si hay algún item pendiente en el radar
    const pending = db.prepare("SELECT COUNT(*) as count FROM scraped_items WHERE status = 'pendiente'").all()[0];
    const count = pending ? pending.count : 0;

    db.close();

    if (count > 0) {
      console.log(`\n⚡ [Daemon Alert] ¡Se detectaron ${count} reportes pendientes en SQLite!`);
      console.log('🤖 Lanzando procesamiento automático de IA (ai-pipeline.js)...');
      
      isSyncing = true;
      // 1. Ejecutar el Pipeline de IA para procesar el claim
      try {
        const { stdout } = await runCommandAsync('node scripts/ai-pipeline.js');
        console.log(stdout);
        console.log('✅ Pipeline de IA completado. Los datos se han guardado en SQLite y se verán reflejados en caliente al refrescar.');
      } catch (err) {
        console.error('❌ Error ejecutando el pipeline de sincronización reactiva:', err.message);
      } finally {
        isSyncing = false;
      }
    }
  } catch (err) {
    if (db) {
      try { db.close(); } catch (_) {}
    }
    console.error('[Daemon Error]:', err.message);
  }
}


// Iniciar bucle de vigilancia continua
setInterval(checkAndSync, CHECK_INTERVAL_MS);

// Primera comprobacion inmediata
checkAndSync();
