import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.resolve('data/matiza.db');
console.log('Conectando a:', dbPath);

const db = new DatabaseSync(dbPath);
const articles = db.prepare("SELECT id, title, published_at FROM articles ORDER BY published_at DESC LIMIT 10").all();
console.log('Últimos 10 artículos en matiza.db local:');
console.log(JSON.stringify(articles, null, 2));

const total = db.prepare("SELECT COUNT(*) as c FROM articles").get().c;
console.log('Total de artículos:', total);

db.close();
