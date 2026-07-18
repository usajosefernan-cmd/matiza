// Merge seguro: inserta en la DB del .env (destino) los articulos/topics/sources
// de data/matiza.db (fuente) que aun no existen, sin pisar nada existente.
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const SRC = path.resolve('data/matiza.db');
const DST = process.env.MATIZA_DB_PATH || process.env.SQLITE_DB_PATH || '/home/ubuntu/db/matiza/matiza.db';

const s = new DatabaseSync(SRC);
const d = new DatabaseSync(DST);
d.exec('PRAGMA foreign_keys = OFF;');

function cols(db, table) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all().map(r => r.name);
  return rows;
}
function copyMissing(table) {
  const c = cols(s, table);
  const placeholder = c.map(() => '?').join(',');
  const sel = s.prepare(`SELECT * FROM ${table}`);
  const ins = d.prepare(`INSERT OR IGNORE INTO ${table} (${c.join(',')}) VALUES (${placeholder})`);
  const existing = new Set(d.prepare(`SELECT id FROM ${table}`).all().map(r => r.id));
  let added = 0;
  for (const row of sel.all()) {
    if (existing.has(row.id)) continue;
    ins.run(...c.map(col => row[col] ?? null));
    added++;
  }
  return added;
}

const report = {};
for (const t of ['themes','topics','tags','articles','sources','scraped_items','social_posts','reviews','parties','policy_measures','promise_tracking','asset_declarations','user_submissions','article_tags','article_topics','topic_cache','claim_cache','source_strategy_cache']) {
  try { report[t] = copyMissing(t); } catch (e) { report[t] = 'ERR:' + e.message; }
}
console.log('Merge completado. Filas insertadas por tabla:');
console.log(JSON.stringify(report, null, 2));
const finalArticles = d.prepare('SELECT COUNT(*) c FROM articles').get().c;
console.log('Total articulos en destino ahora:', finalArticles);
s.close(); d.close();
