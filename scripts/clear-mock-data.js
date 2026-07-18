import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = process.env.SQLITE_DB_PATH || process.env.MATIZA_DB_PATH || process.env.MATIZA_DB_PATH || path.resolve('data/matiza.db');
console.log(`[Cleaner] Conectando a la base de datos en: ${dbPath}`);

try {
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = OFF;'); // Desactivar temporalmente para evitar restricciones durante la limpieza

  console.log('[Cleaner] Purgando tablas de datos inventados/de prueba...');

  const deletedSocial = db.prepare('DELETE FROM social_posts').run();
  console.log(`- Eliminados ${deletedSocial.changes} posts sociales.`);

  const deletedSources = db.prepare('DELETE FROM sources').run();
  console.log(`- Eliminados ${deletedSources.changes} fuentes de artículos.`);

  const deletedArticles = db.prepare('DELETE FROM articles').run();
  console.log(`- Eliminados ${deletedArticles.changes} artículos desmentidos.`);

  const deletedScraped = db.prepare('DELETE FROM scraped_items').run();
  console.log(`- Eliminados ${deletedScraped.changes} items del radar.`);

  const deletedLogs = db.prepare('DELETE FROM verification_logs').run();
  console.log(`- Eliminados ${deletedLogs.changes} logs de verificación.`);

  db.exec('PRAGMA foreign_keys = ON;');
  db.close();
  console.log('✨ Base de datos purgada y limpia de simulaciones con éxito.');
} catch (err) {
  console.error('❌ Error limpiando la base de datos:', err);
  process.exit(1);
}
