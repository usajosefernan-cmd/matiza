# Manifiesto del parche

## Sustituidos

- `00-hot-topics-cron.js`
- `01-relevance-gate.js`
- `02-semantic-router.js`
- `03-source-strategy-planner.js`
- `04-noise-filter.js`
- `06-evidence-finder.js`
- `07-verifier.js`
- `08-article-writer.js`
- `09-quality-gate.js`
- `10-review-queue.js`
- `run-hourly.js`
- `run-daily.js`
- `run-manual-item.js`
- `README.md`

## Añadidos

- `run-item-pipeline.js`
- `lib/async-pool.js`
- `lib/clustering.js`
- `lib/db-utils.js`
- `lib/is-main.js`
- `lib/multi-agent.js`
- `lib/schema-guard.js`
- `lib/search-providers.js`
- `lib/search-swarm.js`
- `lib/source-ranker.js`
- `lib/text-utils.js`
- `integration/radar-intelligence.js`
- `integration/radar-cron-v2.js`
- `integration/RADAR-PATCH.md`
- `.env.example`
- `pipeline_config.example.json`
- `IMPROVEMENTS.md`
- `test-improved-core.mjs`
- `check-syntax.sh`

## Conservados

Las fases y utilidades originales no mencionadas se mantienen para reducir el riesgo de romper integración existente. La migración debe hacerse en una rama y por fases, no sobrescribiendo producción directamente.
