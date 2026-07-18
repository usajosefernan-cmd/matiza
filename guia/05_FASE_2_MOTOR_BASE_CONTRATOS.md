# FASE 2 — MOTOR BASE Y CONTRATOS JSON

## Objetivo

Convertir los placeholders de la fase 1 en un motor base orquestado, todavía con mocks o datos locales, sin publicar nada.

## Idea

`ai-pipeline.js` no debe ser el cerebro entero. Debe quedar como wrapper o integrarse poco a poco. La inteligencia debe vivir en módulos separados.

## Archivos principales

```text
/scripts/matiza-engine/run-daily.js
/scripts/matiza-engine/run-hourly.js
/scripts/matiza-engine/run-manual-item.js
/scripts/matiza-engine/lib/logger.js
/scripts/matiza-engine/lib/safe-json.js
/scripts/matiza-engine/lib/phase-runner.js
/scripts/matiza-engine/lib/contracts.js
```

## Responsabilidad de los runners

### run-daily.js

```text
- preparar ciclo diario,
- llamar hot-topics,
- actualizar/sugerir verticales,
- guardar logs,
- no publicar.
```

### run-hourly.js

```text
- recoger señales recientes,
- aplicar relevance gate,
- dejar cola,
- no publicar.
```

### run-manual-item.js

```text
- procesar un item enviado por usuario/admin,
- pasar por relevancia, router, caché y fuente,
- dejar resultado en cola,
- no publicar.
```

## Contrato base de item

```json
{
  "id": "",
  "source_type": "url|text|image|video|rss|social|manual",
  "source_url": "",
  "raw_text": "",
  "platform": "",
  "detected_at": "",
  "metadata": {}
}
```

## Contrato base de fase

```json
{
  "phase": "",
  "input_id": "",
  "ok": true,
  "result": {},
  "warnings": [],
  "errors": [],
  "cost_estimate": null,
  "next_action": ""
}
```

## Logging

Cada fase debe guardar log:

```text
- fecha,
- fase,
- input_id,
- resultado,
- warnings,
- error si falla,
- duración aproximada,
- coste IA estimado si aplica.
```

## Prohibido

```text
- Conectar IA real si no hay control de coste.
- Publicar.
- Tocar diseño.
- Hacer cambios en admin complejos.
- Procesar datos reales sin dry-run.
```

## Comandos de prueba

```bash
node scripts/matiza-engine/run-daily.js --dry-run
node scripts/matiza-engine/run-hourly.js --dry-run
node scripts/matiza-engine/run-manual-item.js --dry-run --text "claim de prueba"
npm run build
```

## Entrega obligatoria

```text
1. Archivos tocados.
2. Contratos creados.
3. Comandos ejecutados.
4. Salidas JSON de ejemplo.
5. STOP.
```
