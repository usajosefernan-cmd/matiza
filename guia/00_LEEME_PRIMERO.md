# MATIZA — GUÍA PARA ANTIGRAVITY

Esta carpeta convierte `guia02.md` en un plan ejecutable por fases. La idea no es que Antigravity lea un megaprompt y toque toda la web, sino que trabaje con **Loop Engineering controlado**.

## Cómo usar esta carpeta

1. Copia la carpeta `guia/` dentro del repo.
2. Abre Antigravity en el repo.
3. Pega el prompt de `prompts/PROMPT_00_INICIO.md`.
4. Antigravity debe hacer solo la **Fase 0: Auditoría**.
5. Cuando termine, revisas el informe.
6. Si está bien, le das el prompt de la fase siguiente.
7. Nunca le digas “haz todo”. Siempre: **haz solo esta fase y para**.

## Regla central

```text
Antigravity programa y prueba.
Hermes solo ejecuta scripts/crons ya hechos.
El admin no contiene inteligencia: solo controla estados, aprobación y reprocesos.
La web pública no se rompe ni se rehace.
```

## Orden de ejecución

```text
Fase 0  — Auditoría del repo actual. Sin modificar archivos.
Fase 1  — Estructura segura aislada.
Fase 2  — Motor base y contratos JSON.
Fase 3  — Hot topics + verticales vivos.
Fase 4  — Relevance gate + noise filter + semantic router + caché.
Fase 5  — Pipeline de verificación: fuentes, claim, verifier, writer, quality gate.
Fase 6  — Admin del motor + aprobación rápida.
Fase 7  — Radar de usuarios.
Fase 8  — Política en claro.
Fase 9  — JudicialCheck.
Fase 10 — Justicia en datos y corrupción.
Fase 11 — UX pública juvenil y home.
Fase 12 — Crons Hermes y documentación operativa del motor normal.
Fase 13 — Live: texto, sesiones y bus de eventos.
Fase 14 — Live: micrófono y transcripción streaming.
Fase 15 — Live: vídeo, subtítulos y sincronización.
Fase 16 — Live: proveedores realtime y voz wake-only.
Fase 17 — Live: integración, admin, privacidad y endurecimiento.
```

## Qué debe entregar Antigravity al final de cada fase

```text
1. Archivos tocados.
2. Qué cambió.
3. Qué NO tocó.
4. Riesgos.
5. Comandos ejecutados.
6. Resultado de build/test.
7. Próxima fase recomendada.
8. STOP: no avanzar sin aprobación humana.
```

## Lo que está prohibido siempre

```text
- Rehacer toda la web.
- Cambiar diseño público sin fase aprobada.
- Meter toda la lógica en ai-pipeline.js.
- Meter lógica compleja en el admin.
- Publicar automáticamente sin revisión humana.
- Crear listas cerradas o hardcodeadas como única verdad.
- Gastar IA/tokens en contenido sin relevancia social.
- Activar crons antes de que los scripts estén probados.
- Borrar caché o datos existentes sin permiso.
```

## Frase que debe repetirse en cada fase

```text
No quiero patrones cerrados. Quiero un router dinámico con caché semántica: si algo se repite, reutiliza estrategia; si es nuevo, planifica fuentes; si no tiene relevancia social, no gasta tokens.
```


## Módulo adicional: MATIZA Live Agentic

Antes de empezar la Fase 13, leer:

```text
guia/19_MASTER_MATIZA_LIVE_AGENTIC.md
```

Live es un módulo separado. No sustituye el motor normal, no depende de una extensión y no publica automáticamente.
