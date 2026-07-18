# MATIZA MASTER — VISIÓN Y ARQUITECTURA

## Qué es MATIZA

MATIZA es una web de verificación, contexto y explicación pública para España. Su misión es detectar lo que se viraliza, decidir si tiene interés público, verificarlo con fuentes, explicarlo en lenguaje claro y enseñar al lector el truco de manipulación.

Lema interno:

```text
Detectar preocupación social → filtrar relevancia → verificar con fuentes → explicar claro → aprobar humano → publicar.
```

Lema público sugerido:

```text
El radar de lo que te intentan colar.
```

## Modelo de contenido

MATIZA no se organiza primero por secciones clásicas tipo política, internacional o deporte. Se organiza por **temas sociales preocupantes**.

Las categorías clásicas son etiquetas secundarias.

Ejemplo:

```text
Tema social preocupante: Vivienda en España
Vertical vivo: Vivienda y vida imposible
Piezas internas:
- claim viral sobre okupación,
- vídeo descontextualizado sobre alquiler,
- promesa política sobre vivienda pública,
- dato tramposo sobre precios.
```

## Vertical vivo

Un vertical vivo es una página estable y actualizable sobre un tema importante.

Debe contener:

```text
- explicación base,
- contexto,
- cronología,
- fuentes principales,
- preguntas frecuentes,
- confusiones habituales,
- últimas piezas publicadas,
- claims relacionados,
- actualizaciones.
```

Regla:

```text
No crear pieza aislada si ya existe un vertical apropiado.
No crear vertical nuevo si debe fusionarse con uno existente.
```

## Primeros verticales MVP

```text
1. Vivienda en España.
2. Inmigración, MENAS y convivencia.
3. Economía española: ¿va bien o mal?
4. Franquismo y nostalgia histórica.
5. Corrupción y promesas políticas.
6. Sanidad pública.
7. Justicia: investigado, imputado, condenado.
8. Consumo viral: promociones, salud y productos milagro.
9. Ciberestafas y dinero fácil.
10. Cataluña, independencia y memoria de ETA.
```

No deben ser una lista cerrada. El motor debe poder crear nuevos verticales si detecta repetición, viralidad y preocupación social.

## Score de interés público

Antes de gastar IA, todo item debe pasar un score.

```text
MATIZA_SCORE =
30% viralidad
25% daño potencial
20% interés público
15% verificabilidad
10% valor educativo
- ruido comercial
- repetición sin novedad
```

Procesar si:

```text
- afecta a muchas personas,
- puede cambiar voto, consumo, salud, convivencia o percepción social,
- tiene viralidad real,
- tiene fuente verificable,
- se repite en varias redes,
- encaja en un vertical vivo.
```

No procesar si:

```text
- es una reseña irrelevante,
- es opinión pura,
- no tiene viralidad,
- no afecta a salud, dinero, derechos, seguridad o convivencia,
- no se puede verificar mínimamente.
```

Ejemplo:

```text
Una secadora normal no entra.
Una promoción viral de un producto dental, suplemento, crema o inversión con posible engaño sí entra.
```

## Familias dinámicas de señales

No usar patrones cerrados. Detectar familias semánticas:

```text
- afirmación absoluta,
- culpa colectiva,
- dato sin denominador,
- vídeo/foto sin contexto,
- promoción disfrazada,
- producto milagro,
- manipulación política,
- acusación personal,
- nostalgia histórica,
- pánico moral.
```

## Páginas principales

```text
/
/radar
/tema/[slug]
/noticia/[slug]
/programas-politicos
/partidos
/partido/[slug]
/comparador-politico
/promesas-y-hechos
/bienes-y-patrimonio
/votaciones
/justicia-en-datos
/mapa-judicial
/corrupcion-en-datos
```

## Páginas admin

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


# MÓDULO MATIZA LIVE AGENTIC

MATIZA incorpora una sala web en tiempo real:

```text
escucha autorizada
→ transcripción streaming
→ detección de claims
→ paneles vivos
→ fuentes y preguntas
→ alertas
→ voz solo cuando se activa
→ envío opcional a revisión
```

No es una extensión de navegador.

Rutas previstas:

```text
/live
/live/new
/live/session/[id]
/live/video
/live/meeting
/live/advisor
/admin/live
```

Modos:

```text
silent
wake_only
alerts
full_assistant
```

La arquitectura completa y sus fases están en:

```text
guia/19_MASTER_MATIZA_LIVE_AGENTIC.md
guia/20_FASE_13_LIVE_TEXTO_EVENTOS.md
guia/21_FASE_14_LIVE_MICROFONO_STREAMING.md
guia/22_FASE_15_LIVE_VIDEO_SUBTITULOS.md
guia/23_FASE_16_LIVE_REALTIME_VOZ_PROVEEDORES.md
guia/24_FASE_17_LIVE_INTEGRACION_ADMIN_PRIVACIDAD.md
```
