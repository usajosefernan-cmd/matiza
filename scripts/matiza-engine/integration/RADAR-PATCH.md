# Integración segura con `scripts/radar-cron.js`

El radar actual de NewNews falla por cuatro motivos observados en el código:

1. Usa una lista fija de consultas (`baseQueries`) y añade `bulo` a tendencias; eso sesga la búsqueda y pierde afirmaciones virales que aún no han sido llamadas bulo.
2. Filtra por `interestingKeywords` y asigna verticales con una cadena fija de `if/else`; solo encuentra lo que ya fue escrito a mano.
3. Considera toda la prensa y Google Trends viral por defecto, aunque no haya métricas reales.
4. Ejecuta búsquedas de YouTube, X y Reddit secuencialmente, sin panel de agentes ni triage semántico.

## Sustitución recomendada

Importar:

```js
import { buildDynamicRadarQueries, triageRadarItems } from './matiza-engine/integration/radar-intelligence.js';
```

Después de obtener tendencias y verticales existentes:

```js
const queryPlan = await buildDynamicRadarQueries({
  trends: dynamicTrends,
  recentSignals: db.prepare(`SELECT text, platform, virality_score, risk_score FROM scraped_items ORDER BY created_at DESC LIMIT 100`).all(),
  existingTopics: db.prepare(`SELECT id, title, description FROM topics WHERE status='activo'`).all()
});
```

Ejecutar los conectores de cada plataforma con `queryPlan.queries`, usando concurrencia limitada. No asignar un score de viralidad ficticio a una fuente sin métricas: guardar `virality_status = desconocida` o score bajo hasta tener señales reales.

Después de recolectar y deduplicar los items:

```js
const triaged = await triageRadarItems(allItems);
const selected = triaged.filter(result => result.selected);
```

Guardar usando:

- `result.claim.detected_claim`
- primer `topic_matches` de `result.route`, si existe
- scores de `result.relevance`
- estado `pendiente`

No publicar ni crear artículo desde el radar. El radar solo descubre, filtra, extrae el claim y propone vertical.
