# FASE 6 — ADMIN DEL MOTOR Y APROBACIÓN RÁPIDA

## Objetivo

Crear o ampliar el admin para controlar el motor sin meter lógica compleja dentro del admin.

## Principio

```text
El admin no programa.
El admin no decide solo.
El admin controla estados, revisa borradores, cambia verticales y lanza reprocesos.
```

## Rutas admin sugeridas

```text
/admin/radar
/admin/cola
/admin/verticales
/admin/fuentes
/admin/motor
/admin/redes
/admin/politica
/admin/judicial
```

## Admin Motor

Debe mostrar por item:

```text
- fase actual,
- vertical asignado,
- puntuación de relevancia,
- viralidad,
- riesgo,
- caché usada,
- fuentes usadas,
- warnings,
- errores,
- coste IA estimado,
- acción recomendada.
```

Debe permitir:

```text
- reejecutar solo una fase,
- cambiar vertical,
- fusionar verticales,
- marcar como ruido,
- forzar investigación,
- aprobar rápido,
- pedir más fuentes,
- descartar.
```

## Aprobación rápida

El humano no debe revisar letra a letra salvo casos sensibles.

Debe ver:

```text
- claim,
- vertical sugerido,
- veredicto,
- fuentes clave,
- nivel de confianza,
- riesgos,
- formatos sociales,
- checklist.
```

Botones:

```text
- aprobar web y redes,
- aprobar solo web,
- aprobar solo redes,
- editar rápido,
- pedir más fuentes,
- fusionar con tema existente,
- descartar por baja relevancia,
- bloquear.
```

Checklist:

```text
- fuente original suficiente,
- veredicto coherente,
- titular neutral,
- no hay acusación sin prueba,
- no hay riesgo legal evidente,
- encaja en el vertical correcto,
- merece publicarse.
```

## APIs sugeridas

```text
/api/admin/approve-item
/api/admin/reject-item
/api/admin/reprocess-phase
/api/admin/change-topic
/api/admin/update-source-strategy
/api/admin/run-manual-check
```

Las APIs no deben contener toda la inteligencia. Solo cambian estados o lanzan scripts.

## Prohibido

```text
- Meter pipeline entero en componentes React.
- Publicar sin aprobación.
- Reprocesar todo si solo falló una fase.
- Cambiar diseño público general.
```

## Criterio de aceptación

```text
- Hay panel para ver cola.
- Hay acciones seguras.
- Se puede aprobar/rechazar un borrador.
- Se puede reejecutar una fase concreta.
- Build correcto.
```
