import { DatabaseSync } from 'node:sqlite';
const dbPath = '/home/ubuntu/db/matiza/matiza.db';
const db = new DatabaseSync(dbPath);
db.prepare("UPDATE scraped_items SET status = 'triage_completado' WHERE id = 'radar-instagram-aHR0cHM6Ly93d3cuaW5zdGFncmFtLmNv'").run();
console.log('✅ Post de Instagram resetado a triage_completado con éxito.');
