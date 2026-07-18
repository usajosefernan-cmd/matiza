import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

/**
 * MATIZA — Limpieza de Datos Residuales
 *
 * Elimina de la base de datos:
 * 1. Artículos con origin_platform = 'Newtral.es' (restos de scraping externo)
 * 2. Fuentes genéricas con url = 'https://trends.google.es' (sin valor real)
 * 3. Scraped items con URLs rotas (CDATA, ejemplo.es, prensaejemplo.es, N/A)
 * 4. Social posts huérfanos (sin artículo asociado)
 */

const dbPath = process.env.SQLITE_DB_PATH || process.env.MATIZA_DB_PATH || process.env.MATIZA_DB_PATH || path.resolve('data/matiza.db');

console.log('╔══════════════════════════════════════════════════╗');
console.log('║  MATIZA — Limpieza de Datos Residuales          ║');
console.log('╚══════════════════════════════════════════════════╝');
console.log('');

if (!fs.existsSync(dbPath)) {
  console.error(`❌ La base de datos no existe en ${dbPath}`);
  process.exit(1);
}

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON;');

let totalDeleted = 0;

// 1. Identificar y eliminar artículos Newtral.es
console.log('[Limpieza] Buscando artículos con origin_platform = "Newtral.es"...');
const newtralArticles = db.prepare(
  "SELECT id, title, origin_url FROM articles WHERE origin_platform = 'Newtral.es'"
).all();

if (newtralArticles.length > 0) {
  console.log(`  → Encontrados ${newtralArticles.length} artículos de Newtral.es:`);
  for (const art of newtralArticles) {
    console.log(`    - [${art.id}] ${art.title.substring(0, 80)}...`);

    // Eliminar fuentes asociadas
    const deletedSources = db.prepare("DELETE FROM sources WHERE article_id = ?").run(art.id);
    console.log(`      → Fuentes eliminadas: ${deletedSources.changes}`);

    // Eliminar social_posts asociados
    const deletedSocial = db.prepare("DELETE FROM social_posts WHERE article_id = ?").run(art.id);
    console.log(`      → Posts sociales eliminados: ${deletedSocial.changes}`);

    // Eliminar artículo
    db.prepare("DELETE FROM articles WHERE id = ?").run(art.id);
    totalDeleted++;
  }
  console.log(`  ✅ ${newtralArticles.length} artículos Newtral.es eliminados`);
} else {
  console.log('  → No hay artículos de Newtral.es');
}

console.log('');

// 2. Eliminar fuentes genéricas (Google Trends sin enlace específico)
console.log('[Limpieza] Buscando fuentes genéricas (trends.google.es sin ruta)...');
const genericSources = db.prepare(
  "SELECT id, article_id, title, url FROM sources WHERE url = 'https://trends.google.es'"
).all();

if (genericSources.length > 0) {
  console.log(`  → Encontradas ${genericSources.length} fuentes genéricas:`);
  for (const src of genericSources) {
    console.log(`    - [${src.id}] "${src.title}" → ${src.url}`);
  }
  const deleted = db.prepare("DELETE FROM sources WHERE url = 'https://trends.google.es'").run();
  console.log(`  ✅ ${deleted.changes} fuentes genéricas eliminadas`);
  totalDeleted += deleted.changes;
} else {
  console.log('  → No hay fuentes genéricas de Google Trends');
}

console.log('');

// 3. Eliminar scraped_items con URLs rotas
console.log('[Limpieza] Buscando scraped_items con URLs rotas o simuladas...');
const brokenPatterns = [
  { pattern: '%CDATA%', label: 'CDATA wrapping' },
  { pattern: '%ejemplo.es%', label: 'ejemplo.es (fake)' },
  { pattern: '%prensaejemplo%', label: 'prensaejemplo.es (fake)' },
  { pattern: 'N/A', label: 'N/A' }
];

for (const { pattern, label } of brokenPatterns) {
  let items;
  if (pattern === 'N/A') {
    items = db.prepare("SELECT id, url, detected_claim FROM scraped_items WHERE url = 'N/A'").all();
  } else {
    items = db.prepare(`SELECT id, url, detected_claim FROM scraped_items WHERE url LIKE '${pattern}'`).all();
  }

  if (items.length > 0) {
    console.log(`  → ${items.length} items con URL ${label}:`);
    for (const item of items) {
      console.log(`    - [${item.id}] "${(item.detected_claim || '').substring(0, 60)}..."`);
      db.prepare("DELETE FROM scraped_items WHERE id = ?").run(item.id);
      totalDeleted++;
    }
  }
}

console.log('');

// 4. Eliminar fuentes huérfanas (article_id que ya no existe)
console.log('[Limpieza] Buscando fuentes huérfanas (artículo eliminado)...');
const orphanSources = db.prepare(`
  SELECT s.id, s.article_id, s.title
  FROM sources s
  LEFT JOIN articles a ON s.article_id = a.id
  WHERE a.id IS NULL
`).all();

if (orphanSources.length > 0) {
  console.log(`  → ${orphanSources.length} fuentes huérfanas encontradas`);
  for (const src of orphanSources) {
    console.log(`    - [${src.id}] art: ${src.article_id} → "${src.title}"`);
  }
  const deleted = db.prepare(`
    DELETE FROM sources WHERE id IN (
      SELECT s.id FROM sources s LEFT JOIN articles a ON s.article_id = a.id WHERE a.id IS NULL
    )
  `).run();
  console.log(`  ✅ ${deleted.changes} fuentes huérfanas eliminadas`);
  totalDeleted += deleted.changes;
} else {
  console.log('  → No hay fuentes huérfanas');
}

console.log('');

// 5. Eliminar social_posts huérfanos
console.log('[Limpieza] Buscando social_posts huérfanos...');
const orphanPosts = db.prepare(`
  SELECT sp.id, sp.article_id, sp.platform
  FROM social_posts sp
  LEFT JOIN articles a ON sp.article_id = a.id
  WHERE a.id IS NULL
`).all();

if (orphanPosts.length > 0) {
  console.log(`  → ${orphanPosts.length} social_posts huérfanos`);
  const deleted = db.prepare(`
    DELETE FROM social_posts WHERE id IN (
      SELECT sp.id FROM social_posts sp LEFT JOIN articles a ON sp.article_id = a.id WHERE a.id IS NULL
    )
  `).run();
  console.log(`  ✅ ${deleted.changes} social_posts huérfanos eliminados`);
  totalDeleted += deleted.changes;
} else {
  console.log('  → No hay social_posts huérfanos');
}

console.log('');

// 6. También limpiar fuentes con URLs claramente falsas en artículos existentes
console.log('[Limpieza] Buscando fuentes con URLs de ejemplo en artículos existentes...');
const fakeSources = db.prepare(`
  SELECT id, article_id, title, url FROM sources
  WHERE url LIKE '%ejemplo.es%' OR url LIKE '%prensaejemplo%' OR url = 'N/A'
`).all();

if (fakeSources.length > 0) {
  console.log(`  → ${fakeSources.length} fuentes con URLs falsas:`);
  for (const src of fakeSources) {
    console.log(`    - [${src.id}] "${src.title}" → ${src.url}`);
  }
  const deleted = db.prepare(`
    DELETE FROM sources WHERE url LIKE '%ejemplo.es%' OR url LIKE '%prensaejemplo%' OR url = 'N/A'
  `).run();
  console.log(`  ✅ ${deleted.changes} fuentes falsas eliminadas`);
  totalDeleted += deleted.changes;
} else {
  console.log('  → No hay fuentes con URLs de ejemplo');
}

console.log('');

// Resumen final
console.log('═══════════════════════════════════════════════');
console.log(`  Total de registros eliminados: ${totalDeleted}`);
console.log('═══════════════════════════════════════════════');

// Mostrar estado final
const artCount = db.prepare("SELECT COUNT(*) as c FROM articles").get().c;
const srcCount = db.prepare("SELECT COUNT(*) as c FROM sources").get().c;
const scrapedCount = db.prepare("SELECT COUNT(*) as c FROM scraped_items").get().c;
const socialCount = db.prepare("SELECT COUNT(*) as c FROM social_posts").get().c;

console.log('');
console.log('[Estado Final de la BD]');
console.log(`  Artículos: ${artCount}`);
console.log(`  Fuentes: ${srcCount}`);
console.log(`  Scraped Items: ${scrapedCount}`);
console.log(`  Social Posts: ${socialCount}`);

db.close();
console.log('');
console.log('✅ Limpieza completada.');
