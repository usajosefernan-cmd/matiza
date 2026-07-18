// run-hourly.js - MATIZA Engine Hourly Runner (Phase 2 Motor)
import { argv } from 'node:process';
import { runPhase } from './lib/phase-runner.js';
import { safeStringify } from './lib/safe-json.js';

const args = argv.slice(2);
const isDryRun = args.includes('--dry-run');

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║ 🕒 MATIZA: EJECUTOR HORARIO DE RADAR (HOURLY RUNNER) ║');
console.log(`║      MODO: ${isDryRun ? 'DRY-RUN (SIMULADO)' : 'REAL'}                       ║`);
console.log('╚══════════════════════════════════════════════════════╝');

async function runHourlyPipeline() {
  const inputId = `hourly-radar-${Date.now()}`;
  
  // Paso 1: Recoger señales recientes (simulado en dry-run / local)
  const signalsResult = await runPhase('radar-signals', inputId, async () => {
    return {
      ok: true,
      result: {
        signals_scraped: 3,
        items: [
          { id: "sig-1", text: "Afirman que los autónomos tendrán una cuota mínima de 500 euros en 2027.", platform: "X" },
          { id: "sig-2", text: "El Gobierno aprueba una ayuda directa de 10.000€ a todos los jóvenes sin condiciones.", platform: "TikTok" }
        ]
      }
    };
  });

  // Paso 2: Aplicar relevance gate (01-relevance-gate)
  const relevanceResult = await runPhase('01-relevance-gate', inputId, async () => {
    return {
      ok: true,
      result: {
        evaluated_signals: [
          { id: "sig-1", should_process: true, priority: "alta", reason: "Impacto relevante en sector autónomos y cuotas" },
          { id: "sig-2", should_process: true, priority: "media", reason: "Bulo de alta viralidad en juventud" }
        ]
      }
    };
  });

  const summary = {
    ok: signalsResult.ok && relevanceResult.ok,
    timestamp: new Date().toISOString(),
    steps: {
      'radar-signals': signalsResult,
      '01-relevance-gate': relevanceResult
    }
  };

  console.log('\n========================================================');
  console.log('🎉 Ciclo Horario Completado con Éxito.');
  console.log(safeStringify(summary));
  console.log('========================================================');
}

runHourlyPipeline().catch(err => {
  console.error('[Hourly Runner Error]', err);
  process.exit(1);
});
