# FASE 3 — HOT TOPICS Y VERTICALES VIVOS

## Objetivo

Crear el sistema que detecta temas calientes en España y los convierte en verticales vivos o actualizaciones de verticales existentes.

## Script principal

```text
scripts/matiza-engine/00-hot-topics-cron.js
```

## Función

Detectar, agrupar y priorizar los temas sociales calientes del día/semana en España.

## Entradas posibles

```text
- RSS,
- medios,
- buscadores/trends,
- redes públicas disponibles,
- YouTube,
- Telegram público si procede,
- fuentes oficiales,
- items enviados por usuarios,
- histórico interno de MATIZA.
```

Si alguna fuente no está disponible, usar adaptadores mock o dejar interfaz preparada.

## Salida esperada

```json
{
  "topic_id": "",
  "slug": "",
  "title": "",
  "public_concern_summary": "",
  "why_it_matters": "",
  "main_confusions": [],
  "source_map_status": "",
  "priority_score": 0,
  "social_heat_score": 0,
  "risk_score": 0,
  "evergreen_score": 0,
  "needs_new_vertical": true,
  "merge_with_existing_topic": null
}
```

## Reglas

El sistema debe distinguir entre:

```text
- tema social importante,
- noticia puntual,
- rumor menor,
- contenido comercial,
- contenido sin relevancia pública.
```

No todo lo viral merece artículo.
No todo lo detectado merece gastar tokens.

## Vertical vivo

Cada vertical debe tener:

```text
- título,
- resumen base,
- por qué importa,
- qué sabemos,
- qué no sabemos,
- datos clave,
- fuentes principales,
- cronología,
- confusiones frecuentes,
- últimas piezas,
- preguntas pendientes.
```

## Primeros verticales sugeridos

```text
- Vivienda y vida imposible.
- Inmigración, MENAS y convivencia.
- Economía real de España.
- Seguridad, delincuencia y ciberestafas.
- Sanidad pública y listas de espera.
- Historia y memoria.
- Programas políticos y hechos.
- Corrupción y transparencia.
- Justicia y acusaciones públicas.
- Cataluña e independentismo.
- Clima, agua y energía.
- Consumo, salud y promociones virales.
```

No hardcodear como única verdad. Deben poder gestionarse desde config/admin.

## Criterio de aceptación

```text
- run-daily.js puede generar una lista de verticales sugeridos.
- Cada vertical tiene scores.
- El sistema puede decir “fusionar con existente”.
- No publica nada.
- Build correcto.
```
