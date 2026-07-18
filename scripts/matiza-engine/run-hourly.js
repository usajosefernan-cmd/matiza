import { getDb } from './config.js';
import { processItem } from './run-item-pipeline.js';
import { mapLimit } from './lib/async-pool.js';
import { isMainModule } from './lib/is-main.js';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const maxItems = Number.parseInt(limitArg?.split('=')[1] || process.env.MAX_ITEMS_PER_CYCLE || '20', 10);
const concurrency = Number.parseInt(process.env.ITEM_CONCURRENCY || '3', 10);

export async function runHourlyPipeline() {
  const db = getDb();
  const items = db.prepare(`
    SELECT * FROM scraped_items
    WHERE status IN ('pendiente', 'recibido', 'monitorizando')
    ORDER BY COALESCE(virality_score, 0) DESC, COALESCE(risk_score, 0) DESC, created_at ASC
    LIMIT ?
  `).all(maxItems);
  db.close();

  console.log(`[Hourly] Items=${items.length}, concurrencia=${concurrency}, dryRun=${dryRun}`);
  const results = await mapLimit(items, concurrency, item => processItem(item, { dryRun }));
  const summary = {
    processed: results.length,
    completed: results.filter(result => result.article_id || result.dry_run).length,
    stopped: results.filter(result => result.stopped_at).length,
    failed_quality: results.filter(result => result.status === 'necesita_revision_ia').length,
    results: results.map(result => ({
      item_id: result.item_id,
      article_id: result.article_id,
      status: result.status,
      stopped_at: result.stopped_at,
      ok: result.ok
    }))
  };
  console.log(JSON.stringify(summary, null, 2));
}

if (isMainModule(import.meta.url)) {
  runHourlyPipeline().catch(error => {
    console.error('[Hourly] Error:', error);
    process.exit(1);
  });
}
