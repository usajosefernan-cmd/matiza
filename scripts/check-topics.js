import { getDb } from './matiza-engine/config.js';

const db = getDb();
const topics = db.prepare("SELECT * FROM topics").all();
console.log('--- VERTICALES ACTUALES EN DB ---');
topics.forEach(t => {
  console.log(`- [${t.category}] ID: ${t.id} | Slug: ${t.slug} | Título: ${t.title}`);
});
db.close();
