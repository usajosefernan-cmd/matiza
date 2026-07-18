import { detectHotTopics } from './00-hot-topics-cron.js';
import { getDb } from './config.js';
import { updateTopicHeader } from './12-topic-updater.js';
import { mapLimit } from './lib/async-pool.js';
import { isMainModule } from './lib/is-main.js';

const dryRun = process.argv.includes('--dry-run');

export async function runDailyPipeline() {
  const proposals = await detectHotTopics(dryRun);
  const db = getDb();
  const activeTopics = db.prepare("SELECT id FROM topics WHERE status = 'activo' ORDER BY updated_at ASC LIMIT ?")
    .all(Number.parseInt(process.env.DAILY_TOPIC_REFRESH_LIMIT || '10', 10));
  db.close();

  let updated = [];
  if (!dryRun) {
    updated = await mapLimit(activeTopics, Number.parseInt(process.env.TOPIC_UPDATE_CONCURRENCY || '2', 10), async topic => {
      await updateTopicHeader(topic.id);
      return topic.id;
    });
  }

  console.log(JSON.stringify({
    detected_topic_proposals: proposals.length,
    proposals_for_review: proposals.filter(topic => ['update_existing', 'propose_new'].includes(topic.recommended_action)).length,
    refreshed_verticals: updated,
    dry_run: dryRun
  }, null, 2));
}

if (isMainModule(import.meta.url)) {
  runDailyPipeline().catch(error => {
    console.error('[Daily] Error:', error);
    process.exit(1);
  });
}
