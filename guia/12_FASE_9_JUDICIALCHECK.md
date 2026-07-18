# FASE 9 — JUDICIALCHECK

## Objetivo

Crear una capa especial para noticias judiciales donde ninguna resolución, denuncia, titular o acusación se trata como verdad cerrada hasta analizar fase, pruebas, firmeza, recursos y contexto.

Frase base:

```text
Una resolución judicial es una fuente institucional importante, pero no una verdad automática.
Matiza analiza: documento, fase, pruebas, firmeza, contradicciones, recursos y contexto.
```

## Principio editorial

MATIZA no da por bueno automáticamente lo que dice:

```text
- un político,
- un medio,
- una red social,
- una acusación,
- un juez,
- una filtración,
- una sentencia no firme.
```

Mira:

```text
qué está probado,
qué está alegado,
qué está en disputa,
qué falta.
```

## Bloque visual en cada noticia judicial

```text
⚖️ Estado judicial del caso

Fase: Investigación / Sentencia no firme / Recurso pendiente
¿Hay condena firme?: Sí / No
¿Hay documento original?: Sí / No
Fuente principal: Auto / Sentencia / Fiscalía / Prensa / Filtración
Nivel de cautela: Bajo / Medio / Alto / Máximo

Qué está probado:
...

Qué solo son indicios:
...

Qué dice la acusación:
...

Qué dice la defensa:
...

Qué dice Fiscalía:
...

Qué dice el juez/tribunal:
...

Qué falta para afirmarlo con seguridad:
...
```

## Veredictos especiales judiciales

```text
✅ Confirmado documentalmente
🟡 Hay indicios, falta prueba concluyente
🟠 Judicializado, no probado definitivamente
⚖️ Caso judicial controvertido
🧊 Sentencia no firme
🔴 Titular engañoso
⚫ Acusación presentada como hecho
❓ No verificable todavía
```

Ejemplos:

```text
“X está condenada” → Falso si no hay condena.
“X está investigada” → Correcto si existe resolución.
“Está demostrado que cometió X” → Judicializado/no probado si solo hay indicios.
“El juez dice X” → Correcto como cita judicial, pero no equivale a hecho probado firme.
```

## Motor JudicialCheck

Crear:

```text
scripts/matiza-engine/judicial/
  judicial-detector.js
  procedural-stage-classifier.js
  judicial-source-checker.js
  evidence-ledger.js
  judicial-context-analyzer.js
  judicial-quality-gate.js
  judicial-public-card.js
```

Responsabilidades:

```text
judicial-detector:
Detecta si una noticia es judicial.

procedural-stage-classifier:
Clasifica fase: denuncia, investigado, juicio, sentencia no firme, sentencia firme, recurso, archivo.

judicial-source-checker:
Comprueba si hay documento original.

evidence-ledger:
Separa pruebas, indicios, testimonios, informes, inferencias y filtraciones.

judicial-context-analyzer:
Añade contexto institucional sin sesgo.

judicial-quality-gate:
Bloquea titulares que confunden acusación con hecho probado.

judicial-public-card:
Genera tarjeta visual para lector.
```

## Datos sugeridos

```text
judicial_cases
- id
- article_id
- case_name
- court
- judge_or_panel
- procedural_stage
- has_original_document
- document_type
- is_final_judgment
- appeal_status
- prosecution_position
- defense_position
- court_position
- proven_facts_json
- alleged_facts_json
- disputed_facts_json
- evidence_json
- missing_documents_json
- caution_level
- legal_risk
- human_review_required
```

```text
judicial_claims
- claim_text
- claim_type
- proof_level
- source_type
- can_be_stated_as_fact
- safer_wording
```

Ejemplo:

```text
Claim: “X cometió prevaricación”
can_be_stated_as_fact: false
safer_wording: “X ha sido acusado/investigado/condenado en sentencia no firme por...”
```

## Admin judicial

Cuando entre un caso judicial debe aparecer:

```text
MODO JUDICIAL ACTIVADO
```

Checklist:

```text
- ¿Hay documento judicial original?
- ¿Es sentencia firme?
- ¿Hay recurso?
- ¿La Fiscalía discrepa?
- ¿Hay acusación popular?
- ¿Hay prueba directa o solo indicios?
- ¿La noticia confunde investigado con condenado?
- ¿Hay riesgo de difamación?
- ¿Hace falta segunda revisión humana?
```

Botones:

```text
- Pedir documento original.
- Marcar como acusación no probada.
- Marcar como sentencia no firme.
- Marcar como falta contexto judicial.
- Aprobar con cautela.
- Bloquear.
```

## Cómo titular sin manipular

Prohibido si no hay sentencia firme:

```text
“X es culpable”
“X robó”
“X cometió delito”
```

Sugerido:

```text
“Qué se sabe y qué no se sabe del caso X”
“Por qué este caso judicial aún no permite afirmar X”
“Investigado no significa condenado: claves del caso X”
“Qué dice el auto, qué dice Fiscalía y qué falta probar”
```

## Lemas

Interno:

```text
Resolución judicial ≠ verdad automática.
Prueba + fase + firmeza + contexto = verificación responsable.
```

Público:

```text
Matiza no juzga por titulares. Mira las pruebas.
```

## Criterio de aceptación

```text
- Se detectan piezas judiciales.
- Se genera ficha judicial.
- Quality gate bloquea titulares peligrosos.
- Hay revisión humana obligatoria.
- Build correcto.
```
