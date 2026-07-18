# FASE 7 — RADAR DE USUARIOS

## Objetivo

Crear un radar público donde el usuario pueda enviar enlaces, textos, capturas, noticias, comentarios, vídeos o publicaciones sociales.

## Ruta pública

```text
/radar
```

## Regla principal

El sistema NO debe investigarlo todo automáticamente.

Primero debe hacer triage:

```text
1. ¿Es verificable?
2. ¿Tiene interés público?
3. ¿Hay señales de viralidad?
4. ¿Encaja en un vertical existente?
5. ¿Puede causar daño o confusión?
6. ¿Merece gastar tokens?
```

## Resultado para usuario

El usuario debe recibir uno de estos estados:

```text
- ya existe explicación,
- está en cola,
- no parece relevante todavía,
- necesita más datos,
- se ha enviado a revisión,
- se está monitorizando.
```

## Tabla sugerida

```text
user_submissions
- id
- submitted_url
- submitted_text
- detected_claim
- suggested_topic_id
- virality_status
- relevance_score
- status
- reason
- created_at
```

Estados:

```text
- recibido
- descartado_por_baja_relevancia
- monitorizando
- en_cola
- investigando
- publicado
- fusionado_con_vertical_existente
```

## UI sugerida

```text
[Hero]
¿Has visto algo raro en TikTok, YouTube, Instagram o X?
Pega el enlace o frase y Matiza te dice si merece verificación.

[Input grande]
Pega enlace o texto.

[Respuesta]
Estado + explicación breve + vertical relacionado si existe.
```

## Admin conectado

En `/admin/radar` mostrar:

```text
- envíos recientes,
- score,
- estado,
- razón,
- vertical sugerido,
- acción recomendada.
```

## Prohibido

```text
- Investigar automáticamente todo envío.
- Publicar envíos de usuarios sin revisión.
- Permitir spam sin rate limit básico.
- Gastar IA en cada input irrelevante.
```

## Criterio de aceptación

```text
- El usuario puede enviar input.
- Se guarda como submission.
- Pasa por triage.
- Puede acabar en cola o descartado/monitorizado.
- No publica automáticamente.
```
