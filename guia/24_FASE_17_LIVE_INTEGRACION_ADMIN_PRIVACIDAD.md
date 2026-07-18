# FASE 17 — INTEGRACIÓN, ADMIN, PRIVACIDAD Y ENDURECIMIENTO

## Objetivo

Completar MATIZA Live como módulo controlable, integrarlo con la cola normal de verificación y cerrar seguridad, privacidad, retención, observabilidad y activación.

## Implementar

### 1. Persistencia

Tablas o colecciones equivalentes:

```text
live_sessions
live_transcript_segments
live_events
live_claims
live_cards
live_sources_suggested
live_voice_responses
live_session_summaries
live_consents
live_retention_actions
```

No crear tablas duplicadas si la base actual permite reutilizar estructuras.

### 2. Política de retención

Valores seguros:

```text
audio: no guardar por defecto
transcript: no guardar por defecto o consentimiento explícito
events técnicos: retención mínima
claims enviados a revisión: conservar solo lo necesario
sesión temporal: borrado automático configurable
```

Añadir:

```text
- borrar sesión,
- borrar transcript,
- exportar resumen si procede,
- registrar consentimiento,
- mostrar qué se conserva.
```

### 3. Admin Live

Ruta:

```text
/admin/live
```

Debe permitir:

```text
- ver sesiones activas y finalizadas,
- estado y proveedor,
- errores,
- coste estimado,
- latencia,
- claims,
- tarjetas,
- consentimiento,
- enviar claim a revisión,
- descartar,
- borrar sesión,
- bloquear una sesión abusiva,
- ver fallback y warnings.
```

El admin no contiene la inteligencia de los agentes.

### 4. Integración con cola MATIZA

Adaptador:

```text
live claim
→ normalizar
→ relevance gate
→ semantic router
→ caché
→ review queue
```

Debe conservar:

```text
session_id
timestamp
source_url
claim_text
context_window
risk
cards
suggested_sources
```

Nunca publicar directamente.

### 5. Observabilidad

Métricas:

```text
- sesiones,
- duración,
- latencia parcial/final,
- latencia de tarjetas,
- errores por agente,
- errores por proveedor,
- fallback,
- coste,
- claims deduplicados,
- claims enviados a revisión.
```

Logs sin audio, secretos ni transcripciones completas innecesarias.

### 6. Seguridad

```text
- autenticación y autorización,
- rate limit,
- límites de duración,
- validación de payload,
- protección contra replay,
- sanitización de transcript,
- prevención de inyección en prompts,
- separación de instrucciones del contenido escuchado,
- CSP y origen para realtime,
- revisión del bundle.
```

El contenido escuchado es datos no confiables. Nunca debe convertirse en instrucciones de sistema.

### 7. UX final

La sala debe mostrar con claridad:

```text
- escuchando/no escuchando,
- modo de voz,
- fuente actual,
- si se guarda transcript,
- coste aproximado,
- tarjetas provisionales,
- verificado previamente,
- pendiente,
- enviado a revisión,
- botón de detener y borrar.
```

### 8. Activación

```text
LIVE_ENABLED=false
```

Solo cambiar a true tras:

```text
- build,
- tests,
- revisión manual,
- privacidad aceptada,
- límites de coste,
- prueba con proveedor,
- aprobación humana.
```

## Pruebas finales

```text
- sesión temporal sin persistencia,
- sesión con consentimiento,
- borrar sesión,
- exportar resumen si existe,
- enviar claim a cola,
- confirmar que no publica,
- admin con permisos,
- usuario sin permisos,
- rate limit,
- prompt injection en transcript,
- proveedor caído,
- costes,
- secretos,
- build/test/lint,
- prueba end-to-end.
```

## Criterio de aceptación

```text
- módulo aislado,
- integración por adaptador,
- privacidad visible,
- borrado real,
- admin controlable,
- seguridad básica,
- no publicación automática,
- feature flag,
- documentación para operación.
```

## Entrega final

Antigravity entrega:

```text
- mapa de arquitectura,
- archivos,
- variables env,
- contratos,
- migraciones,
- pruebas,
- riesgos pendientes,
- procedimiento de activación,
- procedimiento de rollback,
- STOP.
```
