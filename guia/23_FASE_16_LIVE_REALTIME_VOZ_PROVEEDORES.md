# FASE 16 — PROVEEDORES REALTIME Y RESPUESTA POR VOZ

## Objetivo

Conectar uno o más proveedores de audio realtime mediante adaptadores intercambiables y habilitar respuesta de voz según el modo autorizado.

## Principio

Los modelos concretos no deben quedar fijados en código.

```env
LIVE_PRIMARY_PROVIDER=
LIVE_FALLBACK_PROVIDER=
LIVE_GEMINI_MODEL=
LIVE_OPENAI_MODEL=
LIVE_FAST_MODEL=
LIVE_REVIEW_MODEL=
LIVE_VOICE_MODE=wake_only
LIVE_WAKE_WORDS=Matiza,oye Matiza,escucha esto
LIVE_MAX_COST_PER_SESSION=0.30
```

## Implementar

### 1. Provider interface

Operaciones mínimas:

```text
createSession
createEphemeralCredential
connect
sendAudio
sendText
cancelResponse
close
healthCheck
estimateCost
```

### 2. Tokens efímeros o credenciales seguras

```text
- claves maestras solo en backend,
- token con duración mínima,
- sesión asociada al usuario,
- rate limit,
- origen validado,
- logs sin secretos.
```

### 3. Fallback

Si el proveedor principal falla:

```text
provider.error
→ evaluar si el fallback está permitido
→ provider.fallback
→ mantener historial mínimo necesario
→ informar al usuario
```

No cambiar silenciosamente a un proveedor con reglas de privacidad incompatibles.

### 4. Modos de voz

#### silent

No sintetizar voz.

#### wake_only

Responder únicamente tras `wakeword.detected` válido y dentro de una ventana corta.

#### alerts

Responder únicamente cuando:

```text
risk_score >= umbral
AND el tipo de alerta está permitido
AND no existe cooldown
```

#### full_assistant

Solo tras activación explícita del usuario.

### 5. Voice response agent

Debe producir primero un contrato de respuesta:

```json
{
  "session_id": "",
  "trigger_event_id": "",
  "mode": "wake_only",
  "response_text": "",
  "should_speak": true,
  "reason": "",
  "expires_at": ""
}
```

La síntesis ocurre después de la autorización lógica.

### 6. Cancelación e interrupción

Permitir:

```text
- cancelar respuesta,
- barge-in si el proveedor lo soporta,
- evitar voces superpuestas,
- cooldown,
- no repetir la misma alerta.
```

### 7. Control de coste

```text
- contador por sesión,
- aviso antes del límite,
- degradación a modo barato,
- stop automático configurable,
- no mandar todos los partials a modelo caro,
- resumen incremental.
```

## Riesgos especiales

En judicial, salud, banco, seguros y legal:

```text
- lenguaje de cautela,
- distinguir sugerencia de verificación,
- pedir documento o fuente,
- evitar afirmar ilegalidad o culpabilidad,
- enviar a revisión humana si procede.
```

## Prohibido

```text
- claves en frontend,
- hablar sin modo autorizado,
- activar full_assistant por defecto,
- publicar,
- presentar sugerencia realtime como veredicto definitivo,
- sobrepasar límite de coste sin consentimiento.
```

## Pruebas

```text
- proveedor principal,
- fallback,
- token expirado,
- wake correcto,
- falso wake,
- silent,
- alerts,
- cancelación,
- límite de coste,
- desconexión,
- secretos ausentes del bundle,
- build/test/lint.
```

## Criterio de aceptación

```text
- adaptadores intercambiables,
- wake_only funciona,
- silencio real en silent,
- fallback controlado,
- costes visibles,
- ningún secreto en cliente,
- respuestas cortas y vinculadas al claim actual.
```

## Entrega y STOP

No activar el módulo en producción todavía.
