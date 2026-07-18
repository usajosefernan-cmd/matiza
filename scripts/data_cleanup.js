import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = process.env.SQLITE_DB_PATH || process.env.MATIZA_DB_PATH || process.env.MATIZA_DB_PATH || path.resolve('data/matiza.db');
console.log(`[Cleanup] Abriendo base de datos para reinicio de datos en: ${dbPath}`);

try {
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = OFF;'); // Deshabilitar temporalmente FKs para vaciado limpio

  // Vaciar tablas manteniendo estructura y vertical de temas iniciales
  console.log('[Cleanup] Vaciando tabla de artículos...');
  db.exec('DELETE FROM articles;');
  
  console.log('[Cleanup] Vaciando tabla de posts en redes sociales...');
  db.exec('DELETE FROM social_posts;');
  
  console.log('[Cleanup] Vaciando tabla de fuentes...');
  db.exec('DELETE FROM sources;');
  
  console.log('[Cleanup] Vaciando tabla de items del radar (scraped_items)...');
  db.exec('DELETE FROM scraped_items;');
  
  console.log('[Cleanup] Vaciando caches semánticas (claim_cache y topic_cache)...');
  db.exec('DELETE FROM claim_cache;');
  db.exec('DELETE FROM topic_cache;');

  // Inicializar o verificar que la tabla de temas contenga temas válidos y activos
  const topicsCount = db.prepare("SELECT COUNT(*) as count FROM topics").get();
  console.log(`[Cleanup] Número de temas/expedientes activos tras vaciado: ${topicsCount.count}`);

  if (topicsCount.count === 0) {
    console.log('[Cleanup] Inicializando expedientes temáticos por defecto...');
    const insertTopic = db.prepare(`
      INSERT INTO topics (id, slug, title, description, category, verdict_summary, confidence, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, '', 'Alta', 'activo', datetime('now'), datetime('now'))
    `);
    insertTopic.run('t-vivienda', 'vivienda-y-okupacion', 'Vivienda y Okupación', 'Debates en torno a la okupación de viviendas, desahucios, legislación y el precio del alquiler en España.', 'Vivienda');
    insertTopic.run('t-migracion', 'inmigracion-y-menas', 'Inmigración y Convivencia', 'Claims y bulos que vinculan delincuencia, ayudas sociales y menores extranjeros no acompañados (MENAs).', 'Inmigración');
    insertTopic.run('t-empleo', 'empleo-y-paro', 'Economía Laboral', 'Cifras oficiales de desempleo, contratación, fijos discontinuos y la reforma laboral en España.', 'Economía');
    insertTopic.run('t-justicia', 'justicia-y-politica', 'Justicia y Política', 'Casos de corrupción, procesos judiciales a figuras públicas y desinformación jurídica.', 'Justicia');
  }

  db.exec('PRAGMA foreign_keys = ON;');
  db.close();
  console.log('[Cleanup] ¡Reinicio de base de datos completado con éxito absoluto! Listo para pruebas limpias del motor.');
} catch (err) {
  console.error('[Cleanup] ❌ Error ejecutando limpieza de base de datos:', err.message);
}
