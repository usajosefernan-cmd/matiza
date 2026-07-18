import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = process.env.SQLITE_DB_PATH || '/home/ubuntu/workspace/projects/matiza/data/matiza.db';
const db = new DatabaseSync(dbPath);

console.log('[Query] Consultando todos los test-tiktok en scraped_items:');
const rows = db.prepare("SELECT id, platform, detected_claim, status FROM scraped_items WHERE id LIKE 'test-tiktok%'").all();
console.log(JSON.stringify(rows, null, 2));

db.close();
