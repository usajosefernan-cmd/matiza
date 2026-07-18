# PROMPTS CORTOS POR FASE

Usa estos prompts después de que Antigravity complete y tú apruebes la fase anterior.

## Fase 1

```text
Lee guia/04_FASE_1_ESTRUCTURA_SEGURA.md.
Ejecuta SOLO la Fase 1.
Crea estructura segura aislada para Matiza Engine.
No conectes nada a la web.
No actives crons.
No llames IA real.
Al terminar ejecuta npm run build si existe.
Entrega archivos tocados, cambios, riesgos y STOP.
```

## Fase 2

```text
Lee guia/05_FASE_2_MOTOR_BASE_CONTRATOS.md.
Ejecuta SOLO la Fase 2.
Crea motor base, runners y contratos JSON.
Todo en dry-run o mocks.
No publiques nada.
No cambies diseño público.
Al terminar ejecuta build y dry-run si aplica.
Entrega informe y STOP.
```

## Fase 3

```text
Lee guia/06_FASE_3_HOT_TOPICS_VERTICALES.md.
Ejecuta SOLO la Fase 3.
Implementa hot-topics y modelo de verticales vivos de forma segura.
No hardcodees lista cerrada.
No publiques nada.
Al terminar build/dry-run e informe.
STOP.
```

## Fase 4

```text
Lee guia/07_FASE_4_RELEVANCE_ROUTER_CACHE.md.
Ejecuta SOLO la Fase 4.
Implementa relevance gate, noise filter, semantic router y cache check.
No gastes IA real si no hay control de coste.
No publiques nada.
Build/dry-run/informe.
STOP.
```

## Fase 5

```text
Lee guia/08_FASE_5_PIPELINE_VERIFICACION.md.
Ejecuta SOLO la Fase 5.
Conecta claim extractor, source planner, evidence finder, verifier, writer, quality gate y review queue.
Debe dejar borradores en cola, no publicar.
Build/dry-run/informe.
STOP.
```

## Fase 6

```text
Lee guia/09_FASE_6_ADMIN_MOTOR_APROBACION.md.
Ejecuta SOLO la Fase 6.
Crea admin del motor y aprobación rápida.
El admin no debe contener la inteligencia; solo controlar estados y lanzar acciones seguras.
No rehagas diseño público.
Build/informe.
STOP.
```

## Fase 7

```text
Lee guia/10_FASE_7_RADAR_USUARIOS.md.
Ejecuta SOLO la Fase 7.
Crea radar de usuarios con triage, guardado de submissions y estado.
No investigues todo automáticamente.
No publiques nada.
Build/informe.
STOP.
```

## Fase 8

```text
Lee guia/11_FASE_8_POLITICA_EN_CLARO.md.
Ejecuta SOLO la Fase 8.
Implementa Política en claro como módulo separado.
No copies Newtral/Neutral.
No recomiendes voto.
Usa fuentes oficiales y revisión humana.
Build/informe.
STOP.
```

## Fase 9

```text
Lee guia/12_FASE_9_JUDICIALCHECK.md.
Ejecuta SOLO la Fase 9.
Implementa JudicialCheck como capa especial para noticias judiciales.
No afirmar culpabilidad sin sentencia firme.
Revisión humana obligatoria.
Build/informe.
STOP.
```

## Fase 10

```text
Lee guia/13_FASE_10_JUSTICIA_EN_DATOS_CORRUPCION.md.
Ejecuta SOLO la Fase 10.
Implementa Justicia en datos y corrupción como módulo separado.
Convierte sospechas en métricas: fases, tiempos, pruebas, recursos y condenas.
Comparaciones semiautomáticas con validación humana.
Build/informe.
STOP.
```

## Fase 11

```text
Lee guia/14_FASE_11_UX_HOME_PORTAL_JOVEN.md.
Ejecuta SOLO la Fase 11.
Mejora UX pública, home, verticales, piezas y lenguaje joven.
No rompas rutas ni identidad actual.
Build/informe.
STOP.
```

## Fase 12

```text
Lee guia/15_FASE_12_HERMES_CRONS.md.
Ejecuta SOLO la Fase 12.
Deja scripts probados y documentación para que Hermes ejecute crons.
No actives crons sin aprobación.
Dry-run obligatorio.
Build/informe.
STOP.
```


# FASES MATIZA LIVE AGENTIC

## Fase 13

```text
Lee guia/19_MASTER_MATIZA_LIVE_AGENTIC.md y guia/20_FASE_13_LIVE_TEXTO_EVENTOS.md.
Ejecuta SOLO la Fase 13.
Implementa texto, sesiones y eventos. Sin audio real.
LIVE_ENABLED=false.
Build/tests/informe.
STOP.
```

## Fase 14

```text
Lee guia/21_FASE_14_LIVE_MICROFONO_STREAMING.md.
Ejecuta SOLO la Fase 14.
Añade micrófono autorizado y transcript streaming.
No voz del asistente.
No guardar audio por defecto.
Build/tests/informe.
STOP.
```

## Fase 15

```text
Lee guia/22_FASE_15_LIVE_VIDEO_SUBTITULOS.md.
Ejecuta SOLO la Fase 15.
Añade vídeo y sincronización con fallbacks permitidos.
No saltar restricciones de plataformas.
Build/tests/informe.
STOP.
```

## Fase 16

```text
Lee guia/23_FASE_16_LIVE_REALTIME_VOZ_PROVEEDORES.md.
Ejecuta SOLO la Fase 16.
Añade adaptadores realtime, token efímero, fallback y voz wake_only.
No exponer secretos ni activar producción.
Build/tests/informe.
STOP.
```

## Fase 17

```text
Lee guia/24_FASE_17_LIVE_INTEGRACION_ADMIN_PRIVACIDAD.md.
Ejecuta SOLO la Fase 17.
Integra cola, admin, privacidad, retención, borrado y seguridad.
No publicar automáticamente.
LIVE_ENABLED=false hasta aprobación.
End-to-end/build/tests/informe.
STOP.
```
