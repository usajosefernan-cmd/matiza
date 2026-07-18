# FASE 4 — RELEVANCE GATE, NOISE FILTER, ROUTER Y CACHÉ

## Objetivo

Evitar gasto de IA en contenido irrelevante y enrutar cada item hacia el vertical correcto usando señal semántica y caché.

## Scripts

```text
scripts/matiza-engine/01-relevance-gate.js
scripts/matiza-engine/02-semantic-router.js
scripts/matiza-engine/03-cache-check.js
scripts/matiza-engine/04-noise-filter.js
```

## 01 — Relevance Gate

Antes de investigar o redactar, todo item debe pasar filtro de relevancia.

### Entrada

```text
- texto/link/item detectado,
- métricas de viralidad si existen,
- plataforma,
- señales sociales,
- tema sugerido,
- riesgo potencial,
- histórico interno.
```

### Salida

```json
{
  "should_process": true,
  "reason": "",
  "priority": "alta|media|baja|descartar",
  "public_interest_score": 0,
  "virality_score": 0,
  "harm_score": 0,
  "verification_value_score": 0,
  "commercial_noise_score": 0,
  "recommended_action": "process|queue|ignore|monitor_only"
}
```

### Criterios

Procesar si:

```text
- hay alta viralidad,
- hay alto riesgo social,
- afecta a mucha gente,
- puede confundir sobre salud, dinero, derechos, justicia, elecciones, colectivos o seguridad.
```

Ignorar/monitorizar si:

```text
- es comercial menor,
- no tiene viralidad,
- es opinión pura,
- no es verificable,
- no afecta a interés público.
```

## 02 — Semantic Router

No usar solo keywords. Combinar:

```text
- similitud semántica si existe,
- histórico de verticales,
- fuente/plataforma,
- intención,
- tipo de claim,
- sensibilidad,
- señales de viralidad.
```

### Salida

```json
{
  "content_type": "",
  "claim_type": "",
  "topic_match": {
    "existing_topic_id": "",
    "confidence": 0,
    "should_merge": true
  },
  "category_tags": [],
  "needs_new_topic": false,
  "routing_reason": ""
}
```

## 03 — Cache Check

Crear capa de caché semántica.

Tablas o JSON sugeridos:

```text
topic_cache
- topic_id
- canonical_summary
- trusted_sources_json
- recurring_confusions_json
- known_claims_json
- source_strategy_json
- last_updated
```

```text
claim_cache
- normalized_claim_hash
- similar_claims_json
- previous_verdict
- previous_sources_json
- previous_article_id
- reuse_allowed
- last_seen
```

```text
source_strategy_cache
- semantic_area
- source_types_json
- preferred_sources_json
- validation_rules_json
- last_successful_use
```

Reglas:

```text
Si el claim ya existe o es parecido:
- reutilizar veredicto y fuentes,
- actualizar viralidad,
- crear nueva pieza solo si aporta algo nuevo,
- si no aporta nada, añadirlo como nueva aparición.
```

## 04 — Noise Filter

Detectar:

```text
- contenido comercial menor,
- reseñas normales,
- productos sin viralidad,
- entretenimiento sin daño,
- noticias locales sin impacto social,
- repeticiones sin novedad,
- contenido no verificable,
- opinión pura.
```

### Salida

```json
{
  "is_noise": true,
  "noise_reason": "",
  "keep_monitoring": false,
  "requires_processing": false
}
```

## Criterio de aceptación

```text
- Un item irrelevante queda ignorado o monitorizado.
- Un item de alto riesgo pasa a cola.
- Un item parecido se enruta a vertical existente.
- Se genera log de decisión.
- No se publica nada.
```
