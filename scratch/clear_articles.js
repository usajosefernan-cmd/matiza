// clear_articles.js - Limpiar todos los artículos y claims de la base de datos
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { argv } from 'node:process';

const args = argv.slice(2);
const dbArg = args.find(arg => arg.startsWith('--db='));
const targetDb = dbArg ? dbArg.split('=')[1] : path.resolve('data/matiza.db');

console.log(`🧹 [LIMPIEZA DE BASE DE DATOS] Conectando a: ${targetDb}`);

try {
  const db = new DatabaseSync(targetDb);
  db.exec('PRAGMA foreign_keys = OFF;');

  console.log('🔹 Vaciando tablas de artículos, revisiones, fuentes y redes sociales...');
  
  const t0 = db.prepare('DELETE FROM articles').run();
  console.log(`   - articles: ${t0.changes} filas eliminadas.`);
  
  const t1 = db.prepare('DELETE FROM article_topics').run();
  console.log(`   - article_topics: ${t1.changes} filas eliminadas.`);
  
  const t2 = db.prepare('DELETE FROM article_tags').run();
  console.log(`   - article_tags: ${t2.changes} filas eliminadas.`);
  
  const t3 = db.prepare('DELETE FROM reviews').run();
  console.log(`   - reviews: ${t3.changes} filas eliminadas.`);
  
  const t4 = db.prepare('DELETE FROM sources').run();
  console.log(`   - sources: ${t4.changes} filas eliminadas.`);
  
  const t5 = db.prepare('DELETE FROM social_posts').run();
  console.log(`   - social_posts: ${t5.changes} filas eliminadas.`);
  
  const t6 = db.prepare('DELETE FROM claim_cache').run();
  console.log(`   - claim_cache: ${t6.changes} filas eliminadas.`);
  
  const t7 = db.prepare('DELETE FROM scraped_items').run();
  console.log(`   - scraped_items: ${t7.changes} filas eliminadas.`);
  
  const t8 = db.prepare('DELETE FROM user_submissions').run();
  console.log(`   - user_submissions: ${t8.changes} filas eliminadas.`);

  db.exec('PRAGMA foreign_keys = ON;');
  db.close();
  
  console.log('✅ [ÉXITO] Base de datos vaciada de registros de prueba.');
} catch (err) {
  console.error('❌ [ERROR] Fallo al limpiar la base de datos:', err.message);
  process.exit(1);
}
