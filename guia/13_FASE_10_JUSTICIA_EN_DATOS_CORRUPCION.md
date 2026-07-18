# FASE 10 — JUSTICIA EN DATOS Y CORRUPCIÓN

## Objetivo

Crear una sección dentro de Matiza que muestre, caso por caso:

```text
- quién está implicado,
- de qué partido o entorno político,
- qué se investiga,
- cuándo empezó,
- cuánto tarda,
- en qué fase está,
- qué pruebas hay,
- qué delitos se imputan,
- qué pide Fiscalía,
- qué pide la acusación,
- qué decide el juez,
- qué condena hubo si la hubo,
- si la sentencia es firme o recurrible,
- cómo se compara con casos parecidos.
```

Idea clave:

```text
Convertir sospechas en métricas.
```

No decir:

```text
“Este caso se retrasa por interés político.”
```

Decir:

```text
“Este caso lleva X meses desde la denuncia, X meses desde la admisión, X meses sin juicio, y está por encima/debajo de la media comparable.”
```

## Rutas públicas

```text
/justicia-en-datos
/mapa-judicial
/caso-judicial/[slug]
/corrupcion-en-datos
/comparador-judicial
```

## Secciones

```text
1. Casos judiciales activos.
2. Casos de corrupción por partido.
3. Cronología de cada caso.
4. Comparador de tiempos.
5. Comparador de penas.
6. Fiscalía vs juez vs acusación.
7. Sentencias firmes.
8. Sentencias recurribles.
9. Casos archivados.
10. Casos pendientes antes/después de elecciones.
```

## Comparador de tiempos

Cada caso debería tener barra visual:

```text
Denuncia → Investigación → Juicio oral → Sentencia → Recurso → Firmeza
```

Y debajo:

```text
Duración total: X meses
Media comparable: Y meses
Diferencia: +Z meses
Estado: normal / lento / muy lento / acelerado
```

## Comparador de condenas

Delicado. No comparar sin normalizar.

Campos mínimos:

```text
- delito exacto,
- número de delitos,
- cantidad económica,
- cargo público o no,
- concurso de delitos,
- atenuantes,
- agravantes,
- reparación del daño,
- colaboración,
- sentencia firme o no,
- tribunal,
- año.
```

Mostrar:

```text
Pena impuesta: X
Rango legal: Y-Z
Casos comparables: A, B, C
Severidad relativa: normal / alta / baja / no comparable
```

## Tablas sugeridas

```text
judicial_cases
- id
- slug
- title
- summary
- political_area
- party_related
- persons_json
- court
- judge_or_panel
- prosecutor_position
- accusation_position
- defense_position
- procedural_stage
- start_date
- investigation_start_date
- trial_date
- sentence_date
- final_judgment_date
- appeal_status
- is_final
- source_urls_json
- confidence
- caution_level
```

```text
judicial_events
- id
- case_id
- event_date
- event_type
- title
- description
- source_url
- document_type
```

```text
judicial_charges
- id
- case_id
- person_name
- alleged_crime
- amount_involved
- requested_penalty
- imposed_penalty
- final_penalty
- status
```

```text
judicial_comparisons
- id
- case_id
- comparable_case_id
- similarity_score
- similarity_reason
- difference_in_duration_months
- difference_in_penalty
- warning_notes
```

```text
corruption_cases
- id
- case_id
- party_related
- government_level
- region
- amount_involved
- public_contracts_involved
- final_status
```

## Motor

```text
scripts/matiza-engine/judicial/
  judicial-case-ingestor.js
  judicial-event-extractor.js
  procedural-stage-classifier.js
  duration-comparator.js
  sentence-comparator.js
  corruption-case-classifier.js
  judicial-source-checker.js
  judicial-quality-gate.js
```

## Fuentes base

Orden de autoridad:

```text
1. Sentencia / auto / documento judicial original.
2. CGPJ / CENDOJ / Poder Judicial.
3. Fiscalía / BOE / Congreso / Senado.
4. Tribunal de Cuentas / portales de contratación.
5. Informes UCO u oficiales si están publicados.
6. Prensa solo como fuente secundaria.
```

## Visual joven

Cada caso debe tener tarjetas:

```text
⚖️ Estado del caso
⏱️ Velocidad judicial
📄 Pruebas disponibles
🧭 Comparabilidad
🔥 Ruido político
🚨 Cautela Matiza
```

Ejemplo:

```text
Duración del caso        ███████░░░ 72%
Pruebas documentales     ████░░░░░░ 40%
Sentencia firme          ██░░░░░░░░ 20%
Ruido político           █████████░ 90%
Riesgo de titular falso  ████████░░ 80%
```

## Admin

```text
/admin/judicial
/admin/judicial/casos
/admin/judicial/comparador
/admin/judicial/fuentes
/admin/judicial/alertas
```

Botones:

```text
Añadir caso
Añadir evento judicial
Pedir documento original
Comparar con casos similares
Actualizar fase
Marcar sentencia firme
Marcar recurso pendiente
Marcar caso politizado
Publicar ficha
```

Regla:

```text
Comparar casos debe ser semiautomático. La IA propone comparables, pero el humano confirma.
```

## Criterio de aceptación

```text
- Existen modelos/rutas o prototipo.
- Se puede registrar un caso.
- Se puede mostrar timeline.
- Se puede calcular duración.
- Se puede marcar cautela.
- No se afirma sesgo judicial sin datos.
```
