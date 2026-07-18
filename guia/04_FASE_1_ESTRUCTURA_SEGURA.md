# FASE 1 — ESTRUCTURA SEGURA AISLADA

## Objetivo

Crear la estructura base de MATIZA Engine sin conectarla todavía a la web ni activar crons.

## Permitido crear

```text
/docs/
/docs/matiza/
/scripts/matiza-engine/
/config/matiza/
/logs/matiza-engine/ si el repo lo permite
```

## Estructura obligatoria

```text
/scripts/matiza-engine/
  00-hot-topics-cron.js
  01-relevance-gate.js
  02-semantic-router.js
  03-cache-check.js
  04-source-strategy-planner.js
  05-claim-extractor.js
  06-evidence-finder.js
  07-verifier.js
  08-article-writer.js
  09-quality-gate.js
  10-review-queue.js
  11-social-writer.js
  12-topic-updater.js
  run-daily.js
  run-hourly.js
  run-manual-item.js
  README.md
```

```text
/config/matiza/
  editorial-policy.json
  source-catalog.json
  relevance-thresholds.json
  topic-rules.json
  social-templates.json
  judicial-policy.json
  politics-policy.json
```

## Qué deben hacer los scripts en esta fase

Solo placeholders seguros:

```text
- aceptar entrada mock,
- devolver salida JSON mock,
- no llamar IA real,
- no publicar,
- no escribir datos reales,
- no activar crons,
- no tocar la web pública.
```

## Prohibido

```text
- Cambiar home.
- Cambiar rutas públicas.
- Cambiar diseño.
- Cambiar admin real salvo documentación.
- Activar crons.
- Llamar a APIs IA.
- Publicar noticias.
- Migrar datos.
- Reescribir ai-pipeline.js.
```

## Contratos JSON mínimos

Cada fase debe tener función clara:

```text
input → process → output JSON
```

Ejemplo de salida base:

```json
{
  "ok": true,
  "phase": "01-relevance-gate",
  "input_id": "mock-item-1",
  "output": {},
  "warnings": [],
  "errors": []
}
```

## Comandos

Al terminar:

```bash
npm run build
```

Si hay tests:

```bash
npm run test
```

## Entrega obligatoria

```text
1. Archivos creados.
2. Confirmación de que no se conectó nada a producción.
3. Resultado de build/test.
4. Qué queda pendiente.
5. STOP.
```

## Criterio de aceptación

La fase está bien si:

```text
- La web visible sigue igual.
- El repo compila.
- Existe estructura modular.
- Los scripts no hacen nada peligroso.
```
