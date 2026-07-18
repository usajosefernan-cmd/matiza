import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = process.env.SQLITE_DB_PATH || '/home/ubuntu/workspace/projects/matiza/data/matiza.db';
const db = new DatabaseSync(dbPath);

console.log('[Reset] Restableciendo el estado del item test-tiktok-1784112160608 a triage_completado...');
db.prepare("UPDATE scraped_items SET status = 'triage_completado' WHERE id = 'test-tiktok-1784112160608'").run();

// Borrar cualquier artículo duplicado temporal de la tabla de artículos si es que se llegó a insertar a medias (no se insertó por el error de columna, así que no hace falta, pero por seguridad)
db.close();
console.log('[Reset] Completado.');
