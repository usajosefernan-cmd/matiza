import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = process.env.SQLITE_DB_PATH || import.meta.env.SQLITE_DB_PATH || path.resolve('data/matiza.db');
const db = new DatabaseSync(dbPath);

console.log("=== EXPEDIENTES / TEMAS ===");
const topics = db.prepare("SELECT * FROM topics").all();
for (const t of topics) {
  console.log(`[${t.id}] Slug: ${t.slug} | Title: ${t.title}`);
}

console.log("\n=== ARTÍCULOS VINCULADOS A TEMAS ===");
const articles = db.prepare(`
  SELECT a.id, a.slug, a.title, a.topic_id, t.slug as topic_slug 
  FROM articles a 
  LEFT JOIN topics t ON a.topic_id = t.id
  ORDER BY a.topic_id
`).all();

for (const a of articles) {
  console.log(`- Art: ${a.slug} | Topic: ${a.topic_slug || 'NINGUNO'}`);
}

db.close();
