import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

let dbInstance = null;

export function getDatabase() {
  if (!dbInstance) {
    const dbPath = process.env.SQLITE_DB_PATH || process.env.MATIZA_DB_PATH || path.resolve('data/matiza.db');
    console.log(`[Database] Inicializando Singleton para: ${dbPath}`);
    dbInstance = new DatabaseSync(dbPath);
    dbInstance.exec('PRAGMA busy_timeout = 10000;');
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    
    // Sobreescribir close para evitar que páginas individuales cierren la conexión compartida
    dbInstance.closeMock = dbInstance.close;
    dbInstance.close = () => {
      // No-op para mantener la conexión compartida en caliente durante el build
    };
  }
  return dbInstance;
}

// Permitir cerrar la conexión manualmente al final de un script u orquestador
export function closeDatabase() {
  if (dbInstance && typeof dbInstance.closeMock === 'function') {
    console.log('[Database] Cerrando conexión Singleton de forma definitiva.');
    dbInstance.closeMock();
    dbInstance = null;
  }
}
