# FASE 13 — LIVE TEXTO, SESIONES Y BUS DE EVENTOS

## Objetivo

Construir el esqueleto funcional de MATIZA Live sin audio real.

La fase debe demostrar que una transcripción simulada o texto enviado por fragmentos puede:

```text
crear una sesión
→ emitir eventos
→ detectar claims
→ generar tarjetas
→ actualizar un resumen vivo
→ mantener orden temporal
```

## Dependencias

Solo ejecutar después de aprobar las fases estructurales del proyecto. Leer:

```text
guia/19_MASTER_MATIZA_LIVE_AGENTIC.md
guia/01_REGLAS_GLOBALES.md
guia/16_CHECKLIST_BUILD_TESTS.md
```

## Antes de programar

Antigravity debe localizar:

```text
- framework frontend,
- sistema de rutas/API,
- base de datos,
- patrón de servicios,
- sistema de logs,
- sistema de estado realtime ya existente,
- tests disponibles.
```

Debe reutilizar infraestructura existente cuando sea segura.

## Implementar

### 1. Feature flag

```env
LIVE_ENABLED=false
```

El módulo no debe aparecer públicamente en producción mientras esté desactivado.

### 2. Sesión Live mínima

Estados:

```text
created
ready
running
paused
stopped
error
deleted
```

### 3. Event bus desacoplado

Puede comenzar como bus interno o adaptador sobre infraestructura existente.

Contrato mínimo:

```json
{
  "event_id": "",
  "type": "transcript.final",
  "session_id": "",
  "sequence": 1,
  "occurred_at": "",
  "source": "text_simulator",
  "payload": {},
  "schema_version": "1"
}
```

Requisitos:

```text
- secuencia monotónica por sesión,
- idempotencia,
- validación de esquema,
- logs,
- manejo de errores por consumidor,
- un fallo de agente no detiene la sesión.
```

### 4. Simulador de transcript

Crear una forma de pegar texto o enviar segmentos manualmente.

Debe soportar:

```text
transcript.partial
transcript.final
```

### 5. Agentes iniciales

Implementar versiones simples y desacopladas de:

```text
claim detector
risk detector
question suggester
card writer
live summary
```

No usar modelos caros obligatoriamente. Debe existir modo mock/determinista para tests.

### 6. UI mínima

Crear una ruta Live protegida por feature flag con:

```text
- creación de sesión,
- caja para insertar segmentos,
- timeline,
- tarjetas,
- resumen vivo,
- estado de sesión,
- botón detener,
- botón borrar.
```

No diseñar todavía la cabina final completa.

## Contratos

Usar los contratos de:

```text
guia/contracts/CONTRACTS_JSON.md
```

## Archivos permitidos

```text
- nuevo módulo Live,
- rutas Live aisladas,
- contratos,
- tests,
- variables de ejemplo,
- documentación.
```

## Prohibido

```text
- micrófono,
- captura de pestaña,
- proveedor realtime real,
- voz sintetizada,
- publicación,
- alterar el pipeline principal,
- cambiar home pública,
- activar LIVE_ENABLED en producción.
```

## Pruebas obligatorias

```text
1. Crear sesión.
2. Enviar varios partial.
3. Enviar final.
4. Confirmar orden de eventos.
5. Confirmar que un claim duplicado no genera tarjetas infinitas.
6. Forzar fallo de un agente y comprobar que la sesión continúa.
7. Detener sesión.
8. Borrar sesión.
9. npm run build.
10. test/lint si existen.
```

## Criterio de aceptación

```text
- funciona sin audio,
- funciona en mock,
- eventos ordenados,
- agentes desacoplados,
- ningún error individual bloquea toda la sesión,
- feature flag apagada por defecto,
- no toca motor principal,
- no publica.
```

## Entrega y STOP

Antigravity debe entregar archivos tocados, arquitectura usada, contratos, pruebas, riesgos y STOP.
