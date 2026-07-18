import { getDb } from './config.js';
import { processItem } from './run-item-pipeline.js';
import { uid } from './lib/db-utils.js';
import { isMainModule } from './lib/is-main.js';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const itemId = args.find(arg => arg.startsWith('--itemId='))?.split('=')[1]
  || args.find(arg => arg.startsWith('--item-id='))?.split('=')[1];
const text = args.find(arg => arg.startsWith('--text='))?.slice('--text='.length);
const url = args.find(arg => arg.startsWith('--url='))?.slice('--url='.length) || '';

export async function runManualItem() {
  let item;
  if (itemId) {
    const db = getDb();
    item = db.prepare('SELECT * FROM scraped_items WHERE id = ?').get(itemId);
    db.close();
    if (!item) throw new Error(`No existe scraped_item ${itemId}.`);
  } else if (text) {
    item = {
      id: uid('manual'),
      platform: 'Manual',
      url,
      text,
      metrics_json: JSON.stringify({}),
      virality_score: Number.parseFloat(process.env.MANUAL_DEFAULT_VIRALITY || '5'),
      risk_score: 5,
      suggested_topic: 'General',
      origin_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    if (!dryRun) {
      const db = getDb();
      db.prepare(`
        INSERT INTO scraped_items
        (id, platform, url, text, author_public_name, metrics_json, detected_claim, suggested_topic, virality_score, risk_score, status, origin_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, 'pendiente', ?, ?)
      `).run(item.id, item.platform, item.url, item.text, 'Usuario', item.metrics_json, item.suggested_topic, item.virality_score, item.risk_score, item.origin_date, item.created_at);
      db.close();
    }
  } else {
    throw new Error('Usa --item-id=ID o --text="...".');
  }

  const result = await processItem(item, { dryRun });
  console.log(JSON.stringify(result, null, 2));
}

if (isMainModule(import.meta.url)) {
  runManualItem().catch(error => {
    console.error('[Manual] Error:', error);
    process.exit(1);
  });
}
