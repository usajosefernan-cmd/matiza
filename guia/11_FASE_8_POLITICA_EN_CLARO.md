# FASE 8 — POLÍTICA EN CLARO

## Objetivo

Crear una sección visual para explicar programas electorales, promesas, hechos de gobierno, votaciones y bienes declarados de políticos.

No copiar diseño ni estructura de Newtral/Neutral. Crear una experiencia propia de Matiza.

## Nombre sugerido

```text
Política en claro
```

o

```text
Antes de votar
```

Lema:

```text
Antes de votar, entiende qué prometen, qué votan y qué hicieron.
```

## Rutas públicas

```text
/programas-politicos
/partidos
/partido/[slug]
/comparador-politico
/promesas-y-hechos
/bienes-y-patrimonio
/votaciones
```

## Partidos iniciales

Empezar con principales partidos con representación nacional/autonómica relevante:

```text
PP, PSOE, VOX, SUMAR, PODEMOS, ERC, JUNTS, PNV, BILDU, BNG/CC/UPN según prioridad.
```

No hardcodear solo estos. Permitir añadir más desde admin.

## Áreas políticas

```text
- vivienda
- empleo
- salarios
- impuestos
- autónomos
- sanidad
- educación
- pensiones
- dependencia
- ayudas sociales
- inmigración
- seguridad
- justicia
- corrupción
- energía
- medio ambiente
- territorial
- igualdad
- europa
```

## Formato de cada medida

Cada medida debe tener:

```text
1. Texto original.
2. Fuente oficial.
3. Explicación clara.
4. A quién afecta.
5. Posible impacto.
6. Qué hizo el partido cuando gobernó.
7. Votaciones relacionadas.
8. Estado de cumplimiento.
```

Estados:

```text
✅ cumplida
🟡 parcial
🔴 incumplida
🔵 bloqueada
⚪ no verificable
```

No usar “mintió” por defecto. Usar lenguaje prudente:

```text
Prometió X, pero no se aprobó.
Prometió X y se aprobó parcialmente.
Prometió X, pero necesitaba mayoría.
Prometió X, pero los datos no permiten confirmarlo.
```

## Tablas sugeridas

```text
parties
- id
- slug
- name
- logo
- ideology_summary
- official_website
- current_leader
```

```text
electoral_programs
- id
- party_id
- election
- year
- source_url
- pdf_path
- status
```

```text
policy_areas
- id
- slug
- name
- description
```

```text
policy_measures
- id
- party_id
- program_id
- area_id
- original_text
- plain_explanation
- affected_groups
- cost_or_impact
- source_page
- confidence
```

```text
government_actions
- id
- party_id
- area_id
- period
- government_level
- action_title
- action_summary
- official_source_url
- related_measure_id
- result_status
```

```text
parliament_votes
- id
- party_id
- area_id
- title
- date
- institution
- vote
- source_url
```

```text
promise_tracking
- id
- measure_id
- action_id
- status
- explanation
- evidence_url
```

```text
asset_declarations
- id
- person_name
- party_id
- role
- source_url
- assets_summary
- debts_summary
- income_summary
- date_declared
```

## Bienes y patrimonio

Solo fuentes oficiales.

Mostrar:

```text
- político,
- cargo,
- partido,
- declaración oficial,
- inmuebles,
- cuentas/depósitos,
- acciones/participaciones,
- deudas/hipotecas,
- ingresos declarados,
- fecha de declaración,
- fuente oficial.
```

Aviso obligatorio:

```text
Esto es patrimonio declarado oficialmente, no patrimonio total real.
Puede estar desactualizado si el cargo no ha actualizado declaración.
No implica delito ni irregularidad.
```

## Admin política

```text
/admin/politica
/admin/politica/partidos
/admin/politica/programas
/admin/politica/medidas
/admin/politica/promesas
/admin/politica/votaciones
/admin/politica/bienes
```

Flujo:

```text
1. Subir programa electoral PDF o URL oficial.
2. Extraer medidas con IA.
3. Clasificar por área.
4. Traducir a lenguaje claro.
5. Relacionar con hechos de gobierno.
6. Relacionar con votaciones.
7. Marcar estado.
8. Humano aprueba.
```

## Fuentes prioritarias

```text
1. Programa electoral oficial PDF/web del partido.
2. Congreso de los Diputados.
3. Senado.
4. BOE.
5. Presupuestos Generales.
6. Boletines autonómicos.
7. Parlamento autonómico correspondiente.
8. Tribunal de Cuentas.
9. Portal de Transparencia.
10. Declaraciones oficiales de bienes.
11. Votaciones parlamentarias.
12. INE / Eurostat / AIReF / Banco de España para impacto económico.
```

## Comparador práctico

`/comparador-politico` debe permitir elegir perfiles:

```text
- soy joven,
- soy autónomo,
- cobro ayuda,
- tengo alquiler,
- me preocupa sanidad,
- me preocupan impuestos,
- soy pensionista,
- tengo una pyme.
```

Y mostrar:

```text
- qué propone cada partido,
- qué hizo cuando gobernó,
- qué votó,
- qué puede cambiar para ti,
- fuentes.
```

## Criterio de aceptación

```text
- Existe estructura de rutas o prototipo visual.
- Hay modelo de datos.
- Hay admin para cargar/revisar.
- No se copia diseño de otro medio.
- No se recomienda voto.
- Build correcto.
```
