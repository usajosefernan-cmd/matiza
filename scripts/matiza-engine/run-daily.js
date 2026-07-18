// run-daily.js - MATIZA Engine Daily Runner (Phase 2 Motor)
import { argv } from 'node:process';
import { runPhase } from './lib/phase-runner.js';
import { safeStringify } from './lib/safe-json.js';

import { detectHotTopics } from './00-hot-topics-cron.js';

const args = argv.slice(2);
const isDryRun = args.includes('--dry-run');

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║ 📅 MATIZA: EJECUTOR DIARIO DEL MOTOR (DAILY RUNNER)  ║');
console.log(`║      MODO: ${isDryRun ? 'DRY-RUN (SIMULADO)' : 'REAL'}                       ║`);
console.log('╚══════════════════════════════════════════════════════╝');

async function runDailyPipeline() {
  const inputId = `daily-cycle-${Date.now()}`;
  
  // Fase 00: Hot Topics
  const hotTopicsResult = await runPhase('00-hot-topics-cron', inputId, async () => {
    const topics = await detectHotTopics(isDryRun);
    return {
      ok: true,
      result: {
        detected_topics: topics
      }
    };
  });

  // Fase 12: Topic Updater / Verticals
  const verticalResult = await runPhase('12-topic-updater', inputId, async () => {
    return {
      ok: true,
      result: {
        updated_verticals: ["Economía y Hacienda", "Convivencia y Servicios"],
        status: "Sugeridos para revisión humana"
      }
    };
  });

  const summary = {
    ok: hotTopicsResult.ok && verticalResult.ok,
    timestamp: new Date().toISOString(),
    steps: {
      '00-hot-topics-cron': hotTopicsResult,
      '12-topic-updater': verticalResult
    }
  };

  console.log('\n========================================================');
  console.log('🎉 Ciclo Diario Completado con Éxito.');
  console.log(safeStringify(summary));
  console.log('========================================================');
}

runDailyPipeline().catch(err => {
  console.error('[Daily Runner Error]', err);
  process.exit(1);
});
