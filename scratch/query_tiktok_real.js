import { DatabaseSync } from 'node:sqlite';

const dbPath = process.env.SQLITE_DB_PATH || '/home/ubuntu/workspace/projects/matiza/data/matiza.db';
const db = new DatabaseSync(dbPath);

console.log('[Query] Consultando el último artículo insertado:');
const article = db.prepare(`
  SELECT id, slug, origin_url, origin_platform, title 
  FROM articles 
  ORDER BY created_at DESC 
  LIMIT 1
`).get();

console.log('Artículo:', JSON.stringify(article, null, 2));

if (article) {
  console.log(`[Query] Fuentes para el artículo ${article.id}:`);
  const sources = db.prepare(`
    SELECT * FROM sources 
    WHERE article_id = ?
  `).all(article.id);
  console.log(JSON.stringify(sources, null, 2));
}

db.close();
