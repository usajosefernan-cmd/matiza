# FASE 15 — VÍDEO, SUBTÍTULOS Y SINCRONIZACIÓN

## Objetivo

Permitir que una sesión Live trabaje junto a un vídeo o directo sin construir una extensión y sin prometer acceso universal al audio de cualquier plataforma.

## Fuentes admitidas

Orden recomendado:

```text
1. Vídeo embebible autorizado.
2. Subtítulos o transcript disponibles mediante integración permitida.
3. Captura de pestaña/pantalla autorizada por el navegador y el usuario.
4. Micrófono como fallback.
5. Texto o transcript pegado.
```

## Regla de cumplimiento

Prohibido saltarse:

```text
- DRM,
- autenticación,
- CORS,
- políticas de una plataforma,
- permisos del navegador,
- restricciones de embedding.
```

Si una URL no es compatible, la UI debe explicarlo y ofrecer fallback.

## Implementar

### 1. Entrada de URL

La sesión debe guardar:

```text
source_url
source_platform
source_mode
embed_status
transcript_status
```

### 2. Adaptador de fuente

Resultado normalizado:

```json
{
  "supported": true,
  "mode": "embed|captions|tab_capture|microphone|manual",
  "embed_url": "",
  "reason": "",
  "requires_user_permission": false
}
```

### 3. Sincronización temporal

Cada evento derivado debe conservar:

```text
- media_time,
- wall_clock_time,
- transcript_start,
- transcript_end.
```

Permitir:

```text
- marcar momento,
- saltar al timestamp cuando el reproductor lo admita,
- relacionar claim y tarjeta con un instante.
```

### 4. UI de cabina inicial

Distribución orientativa:

```text
Izquierda: vídeo/audio + transcript.
Centro: tarjetas vivas y alertas.
Derecha: claims, fuentes, preguntas y resumen.
```

No rehacer la identidad completa de MATIZA.

### 5. Control de flujo

El vídeo no debe pausarse porque un agente tarde.

Aplicar:

```text
- cola de eventos,
- trabajos cancelables,
- prioridad,
- timeout,
- deduplicación,
- procesamiento asíncrono.
```

## Prohibido

```text
- descarga no autorizada,
- grabación oculta,
- extracción universal ficticia,
- scraping agresivo desde frontend,
- publicación automática,
- voz del asistente.
```

## Pruebas

```text
- URL embebible,
- URL no embebible,
- transcript disponible,
- transcript no disponible,
- fallback a micrófono,
- captura de pestaña denegada,
- sincronización de timestamps,
- claim vinculado a instante,
- sesión detenida,
- build/test/lint.
```

## Criterio de aceptación

```text
- fallbacks honestos,
- no vulnera restricciones,
- vídeo y paneles permanecen sincronizados,
- análisis no bloquea reproducción,
- cada tarjeta sabe de qué momento procede.
```

## Entrega y STOP

No conectar todavía proveedores de conversación por voz.
