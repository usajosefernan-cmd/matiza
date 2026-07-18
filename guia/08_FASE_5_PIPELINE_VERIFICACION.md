# FASE 5 — PIPELINE DE VERIFICACIÓN Y REDACCIÓN

## Objetivo

Conectar el flujo desde claim verificable hasta borrador en cola, sin publicación automática.

## Scripts

```text
scripts/matiza-engine/04-source-strategy-planner.js
scripts/matiza-engine/05-claim-extractor.js
scripts/matiza-engine/06-evidence-finder.js
scripts/matiza-engine/07-verifier.js
scripts/matiza-engine/08-article-writer.js
scripts/matiza-engine/09-quality-gate.js
scripts/matiza-engine/10-review-queue.js
scripts/matiza-engine/11-social-writer.js
scripts/matiza-engine/12-topic-updater.js
```

## Source Strategy Planner

Debe decidir fuentes según:

```text
- tipo de claim,
- tema,
- sensibilidad,
- país,
- periodo temporal,
- si es dato, declaración, vídeo, imagen, acusación, promesa política, producto, salud, dinero, justicia o historia.
```

### Salida

```json
{
  "source_strategy": {
    "required_source_types": [],
    "preferred_authority_level": "",
    "minimum_sources": 0,
    "needs_original_source": true,
    "needs_context_source": true,
    "needs_counter_source": false,
    "manual_check_required": false
  },
  "search_queries": [],
  "reuse_from_cache": true,
  "reason": ""
}
```

## Claim Extractor

Debe extraer afirmaciones verificables, no opiniones puras.

Salida sugerida:

```json
{
  "claim": "",
  "normalized_claim": "",
  "claim_type": "dato|acusacion|promesa|video|salud|producto|historia|judicial|politica|otro",
  "verifiable": true,
  "verification_questions": [],
  "risk_flags": []
}
```

## Evidence Finder

Debe priorizar fuentes originales.

Orden general:

```text
1. Fuente original.
2. Documento oficial.
3. Base de datos pública.
4. Fuente técnica o científica.
5. Medio fiable como contexto.
6. Redes solo como origen del claim, no como prueba.
```

## Verifier

Debe comparar claim vs evidencia y producir:

```json
{
  "verdict": "verdadero|falso|engañoso|falta_contexto|sin_pruebas|no_verificable",
  "confidence": 0,
  "what_is_true": [],
  "what_is_false": [],
  "what_lacks_context": [],
  "what_is_unknown": [],
  "key_sources": [],
  "human_review_required": true
}
```

## Article Writer

Página de pieza/noticia:

```text
[Veredicto]
[Claim]
[Origen y viralidad]
[Resumen en 30 segundos]
[Explicación clara]
[Qué es cierto]
[Qué es falso]
[Qué falta contexto]
[Qué no está probado]
[Fuentes originales]
[Cómo responder en redes]
```

## Quality Gate

Debe bloquear:

```text
- acusaciones sin prueba,
- titulares judiciales peligrosos,
- fuentes insuficientes,
- veredictos incoherentes,
- texto partidista,
- contenido sensible sin revisión humana,
- publicación automática.
```

## Review Queue

Todo borrador debe quedar en cola humana antes de publicar.

## Social Writer

Genera:

```text
- respuesta breve para redes,
- carrusel,
- guion corto TikTok/Reels,
- resumen 5 líneas.
```

## Topic Updater

Cuando una pieza se aprueba, actualizar vertical padre:

```text
- resumen,
- claims,
- cronología,
- confusiones,
- fuentes,
- últimas piezas,
- FAQ.
```

No reescribir todo el vertical desde cero.

## Criterio de aceptación

```text
- Un item puede recorrer pipeline en dry-run.
- Se genera borrador en cola.
- No se publica automáticamente.
- Quality gate bloquea casos peligrosos.
- Build correcto.
```
