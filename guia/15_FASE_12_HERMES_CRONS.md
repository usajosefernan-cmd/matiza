# FASE 12 — HERMES, CRONS Y OPERACIÓN

## Objetivo

Dejar scripts probados para que Hermes los ejecute por cron sin inventar lógica ni tocar código.

## Regla base

```text
Antigravity construye y prueba.
Hermes solo ejecuta.
Admin controla.
```

## Scripts que Hermes podrá ejecutar

```bash
node scripts/matiza-engine/run-daily.js
node scripts/matiza-engine/run-hourly.js
node scripts/matiza-engine/run-manual-item.js --itemId=ID
```

## run-daily.js

Uso:

```bash
node scripts/matiza-engine/run-daily.js
```

Responsabilidad:

```text
- detectar temas calientes,
- actualizar verticales,
- revisar caché,
- generar cola de temas,
- no publicar automáticamente.
```

## run-hourly.js

Uso:

```bash
node scripts/matiza-engine/run-hourly.js
```

Responsabilidad:

```text
- recoger señales recientes,
- aplicar relevance gate,
- monitorizar viralidad,
- dejar items en cola si procede,
- no publicar automáticamente.
```

## run-manual-item.js

Uso:

```bash
node scripts/matiza-engine/run-manual-item.js --itemId=123
```

Responsabilidad:

```text
- procesar envío manual,
- hacer triage,
- enrutar,
- verificar si procede,
- dejar resultado en cola.
```

## Dry-run obligatorio

Antes de activar cualquier cron:

```bash
node scripts/matiza-engine/run-daily.js --dry-run
node scripts/matiza-engine/run-hourly.js --dry-run
node scripts/matiza-engine/run-manual-item.js --dry-run --text "claim de prueba"
npm run build
```

## Ejemplo de cron, solo cuando esté probado

```cron
0 7 * * * cd /ruta/matiza && node scripts/matiza-engine/run-daily.js >> logs/matiza-daily.log 2>&1
0 * * * * cd /ruta/matiza && node scripts/matiza-engine/run-hourly.js >> logs/matiza-hourly.log 2>&1
```

## README técnico final

Antigravity debe dejar un README con:

```text
- qué hace cada script,
- cómo probar dry-run,
- cómo activar cron,
- qué logs revisar,
- cómo reprocesar una fase,
- cómo parar el sistema,
- qué NO debe hacer Hermes.
```

## Prohibido

```text
- Activar crons sin dry-run correcto.
- Publicar sin revisión humana.
- Que Hermes modifique código.
- Que Hermes invente prompts nuevos.
- Ejecutar en VPS antes de probar local.
```

## Criterio de aceptación

```text
- Scripts ejecutables.
- Dry-run correcto.
- Logs claros.
- README claro.
- Crons documentados pero no activados sin aprobación.
```
