# MATIZA LIVE AGENTIC — VISIÓN, LÍMITES Y ARQUITECTURA

## Qué es

MATIZA Live Agentic es una sala web en tiempo real que escucha una fuente autorizada por el usuario, recibe una transcripción progresiva, detecta afirmaciones, actualiza paneles y lanza agentes rápidos en segundo plano.

No es una extensión de Chrome y no debe convertirse en un chat normal.

```text
Audio o transcripción en directo
→ segmentos parciales y finales
→ bus de eventos
→ agentes rápidos en paralelo
→ tarjetas, preguntas, fuentes y alertas
→ respuesta por voz solo cuando corresponda
→ envío opcional a la cola normal de MATIZA
```

## Resultado esperado

Mientras una conversación, reunión, entrevista o directo continúa, la web debe poder mostrar:

```text
- claims detectados,
- contexto que falta,
- preguntas que conviene hacer,
- fuentes o documentos que conviene pedir,
- riesgos judiciales, comerciales, bancarios, sanitarios o legales,
- coincidencias con verificaciones anteriores,
- resumen vivo,
- claims que merecen pasar a investigación completa.
```

El análisis profundo no debe bloquear la escucha. Los agentes escriben paneles en paralelo y el audio continúa.

## Modos de voz

```text
silent
La IA no habla nunca. Solo actualiza paneles.

wake_only
Escucha y actualiza paneles. Solo habla cuando detecta una invocación configurada.

alerts
Solo habla ante una alerta de riesgo alto y permitida por configuración.

full_assistant
Mantiene conversación cuando el usuario activa expresamente este modo.
```

Modo inicial recomendado:

```text
LIVE_VOICE_MODE=wake_only
```

## Casos de uso

```text
- directos y debates,
- entrevistas y ruedas de prensa,
- reuniones,
- conversaciones con bancos o seguros,
- explicaciones de abogados,
- demostraciones comerciales,
- contenido político,
- contenido judicial,
- vídeos con afirmaciones verificables.
```

## Límites técnicos honestos

La implementación no debe prometer que cualquier URL permite extraer audio o subtítulos.

Puede utilizar:

```text
1. Micrófono autorizado por el usuario.
2. Captura de pestaña o pantalla cuando el navegador lo permita y el usuario la autorice.
3. Subtítulos o transcripciones obtenidos mediante integraciones permitidas.
4. Texto pegado o transcript simulado como fallback.
```

Prohibido:

```text
- saltarse DRM, CORS, autenticación o restricciones de una plataforma,
- capturar audio sin permiso,
- activar el micrófono sin gesto y consentimiento explícito,
- exponer claves de proveedores en el frontend,
- afirmar que un claim está verificado solo por haberlo detectado en directo.
```

## Arquitectura

```text
Frontend /live
  ↓
Session Gateway
  ↓
Audio/Text Provider Adapter
  ↓
Transcript Normalizer
  ↓
Event Bus
  ↓
Agentes ligeros y concurrentes
  ├─ Claim Detector
  ├─ Intent Detector
  ├─ Wake Detector
  ├─ Cache Lookup
  ├─ Source Suggester
  ├─ Question Suggester
  ├─ Risk Agent
  ├─ Card Writer
  └─ Live Summary
  ↓
Cards / Voice / Review Queue
```

## Carpeta técnica propuesta

```text
scripts/matiza-live/
  00-live-session-manager.js
  01-audio-stream-router.js
  02-live-transcriber.js
  03-segment-buffer.js
  04-live-claim-detector.js
  05-live-intent-detector.js
  06-wake-word-detector.js
  07-cache-lookup-agent.js
  08-source-suggester-agent.js
  09-question-suggester-agent.js
  10-risk-agent.js
  11-card-writer-agent.js
  12-voice-response-agent.js
  13-send-to-review-queue.js
  14-live-summary-agent.js
```

Antigravity debe adaptar nombres y ubicación a la arquitectura real detectada en la Fase 0. No debe crear duplicados si el repo ya tiene servicios equivalentes.

## Rutas propuestas

```text
/live
/live/new
/live/session/[id]
/live/video
/live/meeting
/live/advisor
/admin/live
```

APIs orientativas:

```text
POST /api/live/token
POST /api/live/session/create
POST /api/live/session/[id]/start
POST /api/live/session/[id]/stop
POST /api/live/session/[id]/event
POST /api/live/session/[id]/segment
GET  /api/live/session/[id]/events
GET  /api/live/session/[id]/cards
POST /api/live/session/[id]/send-to-review
POST /api/live/session/[id]/summary
DELETE /api/live/session/[id]
```

Las rutas exactas deben seguir el framework actual.

## Eventos

```text
session.created
session.started
session.stopped
audio.chunk.received
transcript.partial
transcript.final
wakeword.detected
claim.detected
claim.deduplicated
cache.hit
cache.miss
source.suggested
question.suggested
risk.detected
card.created
voice.response.created
claim.sent_to_review
summary.updated
session.deleted
provider.fallback
provider.error
```

## Reglas de rendimiento

No enviar cada palabra parcial a un modelo caro.

Aplicar:

```text
- buffer de segmentos,
- finalización por pausa o puntuación,
- debounce,
- deduplicación semántica,
- límites por sesión,
- cancelación de trabajos obsoletos,
- backpressure,
- timeout por agente,
- circuit breaker por proveedor,
- fallback controlado.
```

Los agentes rápidos producen tarjetas provisionales. La verificación completa sigue en el pipeline normal de MATIZA.

## Proveedores

No hardcodear proveedor ni nombre de modelo.

```env
LIVE_ENABLED=false
LIVE_PRIMARY_PROVIDER=
LIVE_FALLBACK_PROVIDER=
LIVE_GEMINI_MODEL=
LIVE_OPENAI_MODEL=
LIVE_FAST_MODEL=
LIVE_REVIEW_MODEL=
LIVE_VOICE_MODE=wake_only
LIVE_WAKE_WORDS=Matiza,oye Matiza,escucha esto
LIVE_SAVE_AUDIO=false
LIVE_SAVE_TRANSCRIPT=false
LIVE_MAX_COST_PER_SESSION=0.30
LIVE_USE_CHEAP_MODELS=true
```

Las claves permanecen en backend. Cuando el proveedor lo admita, usar credenciales o tokens efímeros de corta duración.

## Privacidad

Valores iniciales seguros:

```text
No guardar audio.
No guardar transcripción sin consentimiento.
Mostrar indicador visible de escucha.
Permitir detener inmediatamente.
Permitir borrar la sesión.
Separar modo temporal de modo persistente.
No reutilizar una sesión privada como contenido público.
```

## Integración con MATIZA normal

```text
Claim Live
→ relevance gate
→ semantic router
→ caché
→ vertical
→ fuentes
→ verificación
→ cola humana
→ publicación opcional
```

Live nunca publica por sí mismo. Solo propone y envía elementos a la cola cuando el usuario lo ordena o una regla autorizada lo permite.

## Orden de implementación

```text
Fase 13 — Texto y bus de eventos.
Fase 14 — Micrófono y transcripción streaming.
Fase 15 — Vídeo, subtítulos y sincronización.
Fase 16 — Proveedores realtime y respuesta de voz.
Fase 17 — Integración, admin, privacidad y endurecimiento.
```

Cada fase termina con STOP y aprobación humana.
