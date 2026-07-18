import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = process.env.SQLITE_DB_PATH || process.env.MATIZA_DB_PATH || process.env.MATIZA_DB_PATH || path.resolve('data/matiza.db');
const db = new DatabaseSync(dbPath);

const ins = db.prepare(`
  INSERT OR IGNORE INTO radar_sources (id, platform, name, url_or_id, status, created_at)
  VALUES (?, ?, ?, ?, 'activo', datetime('now'))
`);

const xAccounts = [
  { id: 'source-x-alvise', name: 'Alvise Pérez (X)', username: 'Alvsjng' },
  { id: 'source-x-vox', name: 'VOX España (X)', username: 'vox_es' },
  { id: 'source-x-psoe', name: 'PSOE Oficial (X)', username: 'PSOE' },
  { id: 'source-x-pp', name: 'PP Oficial (X)', username: 'PPopular' },
  { id: 'source-x-sumar', name: 'Sumar (X)', username: 'suabordo' },
];

for (const a of xAccounts) {
  ins.run(a.id, 'X', a.name, a.username);
}

console.log(`Registered ${xAccounts.length} X accounts as radar sources.`);
db.close();
