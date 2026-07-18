# FASE 14 — MICRÓFONO Y TRANSCRIPCIÓN STREAMING

## Objetivo

Añadir captura de micrófono autorizada por el usuario y convertir audio en segmentos parciales/finales, reutilizando el bus de eventos de la Fase 13.

Todavía no se implementa conversación por voz del asistente.

## Principio

```text
El audio continúa.
La transcripción llega progresivamente.
Los agentes consumen transcript, no bloquean la captura.
```

## Implementar

### 1. Consentimiento visible

Antes de iniciar:

```text
- explicar qué se escucha,
- indicar si se guardará transcripción,
- pedir permiso del navegador,
- mostrar estado de micrófono,
- permitir detener con un clic.
```

### 2. Estado del stream

```text
idle
requesting_permission
connecting
listening
reconnecting
paused
stopping
stopped
denied
error
```

### 3. Router de audio

Crear un adaptador que no acople la UI a un proveedor concreto.

Debe aceptar:

```text
- chunks o frames,
- timestamps,
- información de formato,
- señal de finalización,
- cancelación.
```

### 4. Transcriptor

El transcriptor produce:

```text
transcript.partial
transcript.final
```

Debe normalizar resultados de diferentes proveedores al mismo contrato.

### 5. Segment buffer

Responsabilidades:

```text
- agrupar parciales,
- cerrar segmento por pausa/fin,
- evitar duplicados,
- preservar timestamp,
- cancelar parciales antiguos,
- limitar tamaño,
- detectar idioma cuando exista soporte.
```

### 6. Wake detector inicial

En esta fase puede funcionar sobre texto transcrito.

Debe:

```text
- detectar variantes configuradas,
- ignorar coincidencias accidentales evidentes,
- emitir wakeword.detected,
- no responder todavía por voz,
- mostrar una tarjeta de que la llamada fue detectada.
```

### 7. UI

Añadir:

```text
- botón iniciar escucha,
- indicador claro de micrófono,
- transcripción parcial,
- transcripción final,
- latencia aproximada,
- detener,
- pausar si la arquitectura lo permite.
```

## Seguridad

```text
- no guardar audio por defecto,
- no activar micrófono automáticamente,
- no pedir permisos hasta gesto explícito,
- no poner credenciales en cliente,
- no registrar audio en logs,
- limitar tamaño y duración.
```

## Prohibido

```text
- captura silenciosa,
- voz del asistente,
- enviar claims a publicación,
- cambiar pipeline normal,
- asumir que un partial es una afirmación final,
- activar persistencia sin consentimiento.
```

## Pruebas

```text
- permiso aceptado,
- permiso denegado,
- desconexión,
- reconexión controlada,
- stop inmediato,
- partial reemplazado por final,
- wake word,
- sesión larga simulada,
- límite de coste/duración,
- build/test/lint.
```

## Criterio de aceptación

```text
- escucha solo tras permiso,
- audio no persistido por defecto,
- partial y final diferenciados,
- paneles siguen respondiendo,
- detener corta la captura,
- fallback claro si el proveedor falla.
```

## Entrega y STOP

No avanzar a vídeo ni voz sin aprobación.
