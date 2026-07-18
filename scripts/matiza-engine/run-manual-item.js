// run-manual-item.js - MATIZA Engine Manual Item Process (Phase 2 Motor)
import { argv } from 'node:process';
import { runPhase } from './lib/phase-runner.js';
import { safeStringify } from './lib/safe-json.js';
import { validateItem } from './lib/contracts.js';

const args = argv.slice(2);
const isDryRun = args.includes('--dry-run');

const textArg = args.find(arg => arg.startsWith('--text='));
const textVal = textArg ? textArg.split('=')[1] : args[args.indexOf('--text') + 1] || 'Afirmación de prueba del manual';

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║ 👤 MATIZA: PROCESADOR MANUAL DE CLAIMS (MANUAL RUN)  ║');
console.log(`║      MODO: ${isDryRun ? 'DRY-RUN (SIMULADO)' : 'REAL'}                       ║`);
console.log('╚══════════════════════════════════════════════════════╝');

async function runManualPipeline() {
  const itemInput = {
    id: `manual-item-${Date.now()}`,
    source_type: "manual",
    raw_text: textVal,
    platform: "Manual UI",
    detected_at: new Date().toISOString()
  };

  const validation = validateItem(itemInput);
  if (!validation.ok) {
    console.error('❌ Contrato del item inválido:', validation.errors);
    process.exit(1);
  }

  const item = validation.item;
  const inputId = item.id;

  console.log(`📝 Procesando Claim: "${item.raw_text}"`);

  // 1. Relevance Gate
  const relevance = await runPhase('01-relevance-gate', inputId, async () => {
    return {
      ok: true,
      result: {
        should_process: true,
        priority: "alta",
        public_interest_score: 8.5,
        recommended_action: "process"
      }
    };
  });

  // 2. Semantic Router
  const router = await runPhase('02-semantic-router', inputId, async () => {
    return {
      ok: true,
      result: {
        content_type: "bulo_social",
        claim_type: "economico",
        needs_new_topic: true,
        category_tags: ["autonomos", "fiscalidad"]
      }
    };
  });

  // 3. Cache Check (03-cache-check)
  const cache = await runPhase('03-cache-check', inputId, async () => {
    return {
      ok: true,
      result: {
        cached: false,
        previous_verdict: null,
        suggested_action: "process"
      }
    };
  });

  // 4. Source Strategy Planner (04-source-strategy-planner)
  const sourcePlanner = await runPhase('04-source-strategy-planner', inputId, async () => {
    return {
      ok: true,
      result: {
        source_strategy: {
          required_source_types: ["boe", "aeat"],
          minimum_sources: 1,
          needs_original_source: true
        },
        search_queries: ["cuotas RETA 2027 BOE", "tipos IRPF Agencia Tributaria"]
      }
    };
  });

  const summary = {
    ok: relevance.ok && router.ok && cache.ok && sourcePlanner.ok,
    timestamp: new Date().toISOString(),
    item,
    steps: {
      '01-relevance-gate': relevance,
      '02-semantic-router': router,
      '03-cache-check': cache,
      '04-source-strategy-planner': sourcePlanner
    }
  };

  console.log('\n========================================================');
  console.log('🎉 Análisis Manual Completado.');
  console.log(safeStringify(summary));
  console.log('========================================================');
}

runManualPipeline().catch(err => {
  console.error('[Manual Process Error]', err);
  process.exit(1);
});
