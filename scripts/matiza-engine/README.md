# MATIZA Engine 2 — motor dinámico y multiagente para NewNews

Versión refactorizada del motor aportado. Mantiene la idea de fases independientes, pero sustituye mocks, decisiones rígidas y verificaciones frágiles por un pipeline real, concurrente y auditable.

Lee primero [`IMPROVEMENTS.md`](./IMPROVEMENTS.md).

## Responsabilidades

- **Antigravity** desarrolla, modifica y prueba el código.
- **Hermes** ejecuta por cron los runners ya terminados.
- **El admin** controla estados, errores y aprobación humana; no contiene la lógica editorial.
- **MATIZA Engine** filtra, enruta, busca fuentes, verifica, redacta y deja borradores.

## Pipeline

```text
radar dinámico
→ relevancia
→ ruido
→ claim verificable
→ vertical semántico
→ estrategia de fuentes
→ búsqueda multiagente
→ verificador adversarial
→ redacción por panel
→ quality gate cerrado
→ revisión humana
→ borradores sociales
```

Fases:

1. `00-hot-topics-cron.js`: agrupa señales recientes y propone verticales; no los publica automáticamente.
2. `01-relevance-gate.js`: panel concurrente de interés público, daño, verificabilidad y ruido.
3. `02-semantic-router.js`: asigna un vertical existente por similitud o propone evaluación dinámica.
4. `03-source-strategy-planner.js`: diseña qué fuentes y consultas necesita el claim concreto.
5. `04-noise-filter.js`: descarta ruido sin eliminar automáticamente consumo viral o contenido dañino.
6. `05-claim-extractor.js`: extrae la afirmación comprobable.
7. `06-evidence-finder.js`: búsqueda en enjambre, lectura de páginas y auditoría de evidencia.
8. `07-verifier.js`: agentes a favor, en contra, contexto y metodología; especialistas cuando toca.
9. `08-article-writer.js`: redacción factual, clara y neutral, sintetizada por un coordinador.
10. `09-quality-gate.js`: bloquea por defecto cuando faltan pruebas o falla la revisión.
11. `10-review-queue.js`: fuerza revisión; nunca conserva publicación automática.
12. `11-social-writer.js`: genera borradores, no publica.
13. `12-topic-updater.js`: actualiza partes concretas del vertical.

## Búsqueda

El motor prueba, por este orden:

1. un gateway HTTP configurado en `ANTIGRAVITY_SEARCH_URL` o `SEARCH_API_URL`;
2. una instancia `SEARXNG_URL`;
3. DuckDuckGo HTML como último recurso.

`ANTIGRAVITY_SEARCH_URL` solo debe configurarse si existe una API real accesible por los crons. El buscador interno del IDE no se convierte mágicamente en una API de producción.

Contrato esperado del gateway:

```http
POST $ANTIGRAVITY_SEARCH_URL
Content-Type: application/json
Authorization: Bearer $SEARCH_API_KEY   # opcional

{
  "query": "consulta",
  "limit": 10,
  "domains": [],
  "locale": "es-ES",
  "recency_days": 3
}
```

Respuesta aceptada:

```json
{
  "results": [
    {
      "title": "...",
      "url": "https://...",
      "snippet": "...",
      "published_at": "..."
    }
  ]
}
```

## Instalación en NewNews

Copia esta carpeta como:

```text
scripts/matiza-engine/
```

No reemplaces toda la web. Integra primero en una rama.

```bash
cp scripts/matiza-engine/.env.example .env.matiza.example
cp scripts/matiza-engine/pipeline_config.example.json pipeline_config.json
```

Ajusta `MATIZA_DB_PATH` a la base usada por NewNews.

## Radar mejorado

El archivo:

```text
integration/radar-cron-v2.js
```

es un collector web dinámico de referencia. Ejecuta consultas propuestas por varios agentes, deduplica, hace triage semántico y guarda solo elementos seleccionados o monitorizados.

```bash
node scripts/matiza-engine/integration/radar-cron-v2.js --dry-run
node scripts/matiza-engine/integration/radar-cron-v2.js
```

Para integrar los conectores existentes de YouTube, X, Reddit u otras plataformas, consulta:

```text
integration/RADAR-PATCH.md
```

No se inventan visitas. Cuando no hay métricas de la plataforma, el radar guarda recurrencia de búsqueda como señal distinta.

## Planificación con Antigravity

Antigravity ejecuta crons programados localmente usando la herramienta schedule:

```bash
# Descubrimiento dinámico. Frecuencia orientativa: 15–30 minutos.
node scripts/matiza-engine/integration/radar-cron-v2.js

# Procesar cola pendiente. Frecuencia orientativa: cada hora.
node scripts/matiza-engine/run-hourly.js

# Proponer temas calientes y actualizar verticales. Una vez al día.
node scripts/matiza-engine/run-daily.js

# Reprocesar un elemento solicitado desde admin.
node scripts/matiza-engine/run-manual-item.js --item-id=ID
```

Primero prueba siempre con `--dry-run` donde esté disponible.

## Procesamiento manual

Por ID existente:

```bash
node scripts/matiza-engine/run-manual-item.js --item-id=ITEM_ID --dry-run
```

Con texto nuevo:

```bash
node scripts/matiza-engine/run-manual-item.js \
  --text="Afirmación a analizar" \
  --url="https://origen.example" \
  --platform="manual" \
  --dry-run
```

## Seguridad editorial

- Nunca publicar directamente desde el pipeline.
- Cualquier pieza generada queda en `borrador`, `revision_humana` o `necesita_revision_ia`.
- Si falla el `quality-gate`, se bloquea: no se aprueba por defecto.
- Un snippet no se considera prueba.
- Una URL oficial genérica no prueba un claim concreto.
- Las fuentes de caché deben volver a pasar relevancia y auditoría.
- Los temas sensibles requieren validación humana.

## Pruebas incluidas

```bash
node scripts/matiza-engine/test-improved-core.mjs
bash scripts/matiza-engine/check-syntax.sh
```

Las pruebas no llaman APIs externas ni consumen tokens.

## Integración con el admin

El admin debería mostrar, no ejecutar inteligencia dentro de sus páginas:

- fase actual;
- artefactos de cada fase;
- paneles de agentes;
- consultas y fuentes seleccionadas;
- errores y advertencias;
- coste/modelo;
- reprocesar una sola fase;
- aprobar, pedir más fuentes o rechazar.

Las tablas auxiliares se crean de forma compatible mediante `lib/schema-guard.js`:

- `topic_candidates`;
- `search_audit`;
- `phase_artifacts`.

## Antes de producción

1. Ejecuta el radar en `--dry-run`.
2. Comprueba que los conectores devuelven URLs y métricas reales.
3. Prueba 20 claims conocidos: verdaderos, falsos, ambiguos y sin evidencia.
4. Verifica que ningún error de LLM termina en publicación.
5. Mide coste y ajusta `AGENT_CONCURRENCY` y límites de consultas.
6. Conecta el admin a `phase_artifacts` y `search_audit`.
7. Mantén el motor detrás de aprobación humana hasta tener métricas de precisión.
