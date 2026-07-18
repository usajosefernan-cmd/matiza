Vale, ahora sí. La versión correcta no es “subes un vídeo y luego lo analiza por bloques”.
Es **Matiza Live Agentic**, en tiempo real: escucha, razona, escribe paneles y puede hablar solo cuando toca.

La idea:

```text
La página escucha en directo
→ transcribe en streaming
→ detecta claims al vuelo
→ actualiza paneles en pantalla
→ lanza agentes detrás
→ busca caché/fuentes
→ sugiere preguntas
→ marca alertas
→ si le nombras, responde por voz
```

No es extensión. Es **una sala web en vivo**.

---

# Matiza Live Agentic — Plan definitivo

## 1. Dos modos de uso

### Modo 1 — Solo escucha

La IA no habla. Solo observa y rellena paneles.

Sirve para:

```text
- directos de YouTube
- debates políticos
- entrevistas
- ruedas de prensa
- reuniones
- llamadas con banco
- seguros
- abogados
- vídeos comerciales
```

La pantalla va mostrando:

```text
- qué afirmación acaba de detectar
- qué parece dudoso
- qué fuente habría que pedir
- qué pregunta deberías hacer
- qué parte está ya verificada
- qué parte queda pendiente
- resumen vivo
```

### Modo 2 — Wake mode

La IA escucha, pero solo responde si la llamas.

Ejemplos:

```text
“Matiza, ¿esto es cierto?”
“Matiza, ¿qué le pregunto?”
“Matiza, ¿hay trampa aquí?”
“Matiza, explícame esto fácil.”
“Matiza, guarda este claim.”
```

Entonces responde por voz o por panel.

---

## 2. Arquitectura general

```text
Frontend web
  ↓
Realtime audio session
  ↓
Live transcription
  ↓
Event bus
  ↓
Agentes rápidos en paralelo
  ↓
Paneles en vivo
  ↓
Caché/fuentes/verticales
  ↓
Cola de revisión Matiza
```

Componentes:

```text
/live
/live/session/[id]
/admin/live

/api/live/token
/api/live/session/create
/api/live/events
/api/live/push-card
/api/live/send-to-review
```

---

## 3. Proveedores realtime

No hardcodear modelos. Usar `.env`.

```env
LIVE_PRIMARY_PROVIDER=gemini
LIVE_FALLBACK_PROVIDER=openai

LIVE_GEMINI_MODEL=
LIVE_OPENAI_MODEL=

LIVE_MODE=agentic
LIVE_WAKE_WORDS=Matiza,oye Matiza,escucha esto
LIVE_ALWAYS_LISTEN=true
LIVE_SPEAK_ONLY_WHEN_CALLED=true

LIVE_SAVE_AUDIO=false
LIVE_SAVE_TRANSCRIPT=true
LIVE_MAX_COST_PER_SESSION=0.30
LIVE_USE_CHEAP_MODELS=true
```

La regla:

```text
Gemini Live / OpenAI Realtime para audio inmediato.
Modelos baratos para transcripción y detección.
Modelos mejores solo para resumen, judicial, legal, banco o salud.
```

No poner claves en frontend.
El backend crea token efímero para la sesión.

---

## 4. Pantalla principal

La UI debe ser tipo cabina de control.

```text
┌──────────────────────────────────────────────────────┐
│ Matiza Live | Modo: Directo / Reunión / Banco        │
├───────────────┬──────────────────────┬───────────────┤
│ Vídeo/audio   │ Alertas en vivo       │ Claims        │
│ Transcripción │ Preguntas sugeridas   │ Fuentes       │
│ Timeline      │ Paneles IA            │ Cola          │
└───────────────┴──────────────────────┴───────────────┘
```

### Izquierda

```text
- vídeo embebido o micrófono
- transcripción en directo
- marcas de tiempo
- botón “marcar momento”
```

### Centro

Tarjetas que aparecen solas:

```text
⚠️ Claim detectado
🧊 Falta contexto
📄 Pide fuente
❓ Pregunta sugerida
💸 Posible interés comercial
⚖️ Cautela judicial
🎭 Manipulación emocional
✅ Ya verificado antes
🟠 Pendiente de investigar
```

### Derecha

```text
- claims guardados
- fuentes sugeridas
- vertical relacionado
- enviar a cola
- resumen vivo
- coste estimado
```

---

## 5. Motor agentic en vivo

Crear carpeta:

```text
/scripts/matiza-live/
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

Importante: no es un script lento.
Es un **sistema de eventos**.

Cada cosa que se oye genera eventos:

```json
{
  "type": "transcript.segment",
  "session_id": "...",
  "text": "...",
  "timestamp": 123.4
}
```

Luego los agentes reaccionan.

---

## 6. Event bus

Todo debe funcionar por eventos.

Ejemplos:

```text
audio.chunk.received
transcript.partial
transcript.final
claim.detected
wakeword.detected
question.requested
source.suggested
risk.detected
card.created
claim.sent_to_review
summary.updated
```

Así no se rompe todo si cambias una parte.

---

## 7. Agentes en segundo plano

Mientras el audio sigue, detrás trabajan varios agentes.

```text
Claim Detector
Detecta afirmaciones verificables.

Intent Detector
Distingue si el usuario pregunta algo o solo está escuchando.

Wake Word Detector
Detecta “Matiza...” para responder.

Cache Agent
Mira si ya existe esa verificación.

Source Agent
Sugiere fuentes.

Question Agent
Sugiere preguntas útiles.

Risk Agent
Detecta legal, judicial, banco, salud, consumo, estafa.

Card Agent
Escribe tarjetas cortas para pantalla.

Voice Agent
Solo responde por voz si se le llama.
```

---

## 8. Modos especiales

### Directo político

Detecta:

```text
- cifras sin fuente
- promesas
- ataques personales
- datos económicos
- acusaciones judiciales
- historia manipulada
```

### Judicial

Activa cautela máxima:

```text
- investigado no es condenado
- sentencia firme o no firme
- fiscalía discrepa
- acusación no es hecho probado
- documento original requerido
```

### Banco / seguro

Detecta:

```text
- permanencia
- comisiones
- obligatoriedad falsa
- letra pequeña
- exclusiones
- coste total
- condiciones por escrito
```

### Consumo comercial

Detecta:

```text
- afiliado
- patrocinio oculto
- promesa exagerada
- producto milagro
- falsa urgencia
- falta de evidencia
```

### Reunión de trabajo

Detecta:

```text
- decisiones
- riesgos
- tareas
- contradicciones
- cosas que pedir por escrito
- próximos pasos
```

---

## 9. Funcionamiento en directo

Ejemplo real.

Alguien dice:

```text
“Este seguro es obligatorio si quieres la hipoteca.”
```

Matiza Live muestra:

```text
⚠️ Posible afirmación sensible

Claim:
“El seguro es obligatorio para contratar la hipoteca.”

Pregunta sugerida:
“¿Me puede enseñar dónde aparece esa obligación por escrito?”

Fuente/documento a pedir:
- oferta vinculante
- condiciones particulares
- condiciones generales
- desglose de bonificaciones

Cautela:
Puede ser obligatorio para obtener una bonificación, pero no necesariamente para contratar la hipoteca.
```

Si el usuario dice:

```text
“Matiza, ¿qué le pregunto?”
```

La IA responde:

```text
“Pregúntale si el seguro es obligatorio legalmente o solo necesario para mantener una bonificación. Y pide que te lo dé por escrito.”
```

---

## 10. Datos que guarda

```sql
live_sessions
- id
- mode
- title
- context
- source_url
- status
- provider
- model
- cost_estimate
- privacy_mode
- created_at
- ended_at

live_transcript_segments
- id
- session_id
- start_time
- end_time
- speaker_label
- text
- confidence

live_events
- id
- session_id
- event_type
- payload_json
- created_at

live_claims
- id
- session_id
- claim_text
- normalized_claim
- category
- risk_score
- relevance_score
- status

live_cards
- id
- session_id
- claim_id
- card_type
- title
- content
- severity
- labels_json

live_voice_responses
- id
- session_id
- trigger_text
- response_text
- spoken
- created_at
```

Por defecto:

```text
No guardar audio.
Guardar transcripción solo si el usuario acepta.
Botón borrar sesión.
```

---

## 11. Estados de una tarjeta

```text
detectado
en_cache
requiere_fuente
pendiente_investigacion
enviado_a_revision
descartado
respondido_por_voz
```

---

## 12. Respuesta en voz

Hay tres niveles:

```text
Silencioso
Solo paneles.

Aviso corto
La IA dice frases breves cuando detecta algo grave.

Interactivo
Solo responde si dices “Matiza...”.
```

Configurable:

```env
LIVE_VOICE_MODE=silent
# silent | alerts | wake_only | full_assistant
```

Mi recomendación inicial:

```text
wake_only
```

Es decir: escucha y rellena paneles, pero solo habla si la llamas.

---

## 13. Integración con Matiza normal

Un claim detectado en Live puede pasar a la cola.

```text
Live claim
→ relevance gate
→ topic router
→ vertical existente
→ fuentes
→ verificación
→ artículo
→ redes
```

Ejemplo:

```text
Directo político dice:
“España tiene la peor economía de Europa.”

Matiza Live:
- detecta claim
- lo manda a economía española
- sugiere INE, Eurostat, Banco de España
- crea item en cola
```

---

## 14. Fases de implementación

### Fase 1 — Live texto inmediato

```text
/live/session
pegar texto o transcript
procesar por eventos
crear tarjetas
sin audio aún
```

### Fase 2 — Audio por micrófono

```text
micrófono navegador
transcripción streaming
paneles en vivo
wake word simple
```

### Fase 3 — Vídeo embebido

```text
pegar URL YouTube
embeber vídeo
usar subtítulos/transcripción si existe
o micrófono escuchando audio
```

### Fase 4 — Realtime real

```text
Gemini Live / OpenAI Realtime
WebRTC o WebSocket
tokens efímeros
respuesta por voz
paneles sincronizados
```

### Fase 5 — Integración total

```text
enviar claims a cola
usar caché Matiza
crear artículos
admin live
```

---

## 15. Prompt para Antigravity

```text
IMPLEMENTAR MATIZA LIVE AGENTIC EN WEB

Objetivo:
Crear un módulo web realtime dentro de Matiza para analizar directos, vídeos, reuniones y conversaciones importantes.

No crear extensión Chrome.
No rehacer la web.
No mezclarlo con el motor principal.
Debe ser agentic, inmediato y por eventos.

Modos:
1. Solo escucha y rellena paneles.
2. Wake mode: solo responde si el usuario dice “Matiza” o una frase configurada.
3. Alert mode: avisa por voz solo ante riesgos altos.
4. Full assistant mode: conversa si el usuario lo activa.

Rutas:
- /live
- /live/new
- /live/session/[id]
- /live/video
- /live/meeting
- /live/advisor
- /admin/live

UI:
Pantalla con:
- vídeo/audio/transcripción a la izquierda,
- tarjetas vivas en el centro,
- claims/fuentes/preguntas a la derecha.

Debe mostrar en tiempo real:
- claims detectados,
- preguntas sugeridas,
- fuentes sugeridas,
- etiquetas,
- riesgo,
- si existe en caché,
- si debe ir a revisión.

Arquitectura:
Crear sistema de eventos.

Eventos:
- audio.chunk.received
- transcript.partial
- transcript.final
- wakeword.detected
- claim.detected
- source.suggested
- question.suggested
- risk.detected
- card.created
- voice.response.created
- claim.sent_to_review
- summary.updated

Crear scripts:

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

Crear tablas:
- live_sessions
- live_transcript_segments
- live_events
- live_claims
- live_cards
- live_sources_suggested
- live_voice_responses
- live_session_summaries

Crear APIs:
- POST /api/live/token
- POST /api/live/session/create
- POST /api/live/session/[id]/start
- POST /api/live/session/[id]/stop
- POST /api/live/session/[id]/event
- POST /api/live/session/[id]/segment
- GET /api/live/session/[id]/events
- GET /api/live/session/[id]/cards
- POST /api/live/session/[id]/send-to-review
- POST /api/live/session/[id]/summary

Realtime:
Usar proveedor configurado por env:
- Gemini Live si está disponible.
- OpenAI Realtime/Live si está disponible.
- fallback a transcripción por bloques si no hay realtime.

Variables:
LIVE_PRIMARY_PROVIDER=
LIVE_FALLBACK_PROVIDER=
LIVE_GEMINI_MODEL=
LIVE_OPENAI_MODEL=
LIVE_FAST_MODEL=
LIVE_REVIEW_MODEL=
LIVE_VOICE_MODE=wake_only
LIVE_WAKE_WORDS=Matiza,oye Matiza,escucha esto
LIVE_SAVE_AUDIO=false
LIVE_SAVE_TRANSCRIPT=true
LIVE_MAX_COST_PER_SESSION=0.30
LIVE_USE_CHEAP_MODELS=true

Reglas:
- No exponer API keys.
- Usar tokens efímeros.
- No guardar audio por defecto.
- Guardar transcripción solo con consentimiento.
- No verificar todo como verdad en directo.
- Si está en caché, mostrar “ya verificado”.
- Si no está en caché, mostrar “pendiente”.
- En legal, judicial, salud, banco o seguros: cautela alta.
- No publicar nada automáticamente.
- Permitir enviar claims a cola Matiza.

Modo wake:
El sistema escucha todo, pero solo responde por voz si detecta wake word.
Mientras tanto, sigue escribiendo paneles.

Modo solo escucha:
No habla nunca.
Solo rellena paneles.

Modo alertas:
Habla solo si detecta riesgo alto.

Modo full assistant:
Responde de forma conversacional si el usuario lo activa.

Implementar por fases:
1. Texto/transcripción por eventos.
2. Micrófono y paneles en vivo.
3. Vídeo embebido.
4. Realtime provider.
5. Integración con cola Matiza.

Ejecutar npm run build al final de cada fase.
No tocar web pública general salvo añadir enlace a /live.
```

---

## Resumen final

La idea correcta es:

```text
Matiza Live no es un chat.
Es un copiloto realtime que escucha, detecta, etiqueta, pregunta, advierte y guarda claims.
```

Y el modo ideal de inicio:

```text
Escucha siempre.
Escribe paneles siempre.
Habla solo si dices “Matiza”.
Investiga a fondo solo si el claim merece pasar a cola.
```

Eso es potente, barato y mucho más controlable.
