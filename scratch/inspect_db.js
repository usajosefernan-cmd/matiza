// inspect_db.js - Inspeccionar artículos en la base de datos local
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.resolve('data/matiza.db');
console.log(`Conectando a la base de datos: ${dbPath}`);

try {
  const db = new DatabaseSync(dbPath);
  
  // Listar artículos
  const articles = db.prepare("SELECT id, title, origin_url, category, status FROM articles").all();
  console.log(`\n--- ARTÍCULOS ENCONTRADOS (${articles.length}) ---`);
  articles.forEach(a => {
    console.log(`ID: ${a.id} | Título: "${a.title}" | Status: ${a.status} | URL: ${a.origin_url}`);
  });

  // Listar scraped_items
  const scraped = db.prepare("SELECT id, platform, detected_claim, status FROM scraped_items LIMIT 10").all();
  console.log(`\n--- SCRAPED ITEMS (Primeros 10 de ${db.prepare("SELECT count(*) as count FROM scraped_items").get().count}) ---`);
  scraped.forEach(s => {
    console.log(`ID: ${s.id} | Plataforma: ${s.platform} | Claim: "${s.detected_claim}" | Status: ${s.status}`);
  });

  db.close();
} catch (err) {
  console.error('Error al inspeccionar la base de datos:', err.message);
}
