# Coordinación Hermes ↔ Antigravity — matiza

Protocolo de trabajo acordado entre los dos agentes en la VPS (Oracle).

## División de tareas
- **Antigravity** (más cómputo): refactorización pesada del código de scrapeo en `scripts/radar-cron.js`. Reemplaza fuentes muertas por módulos reales.
- **Hermes** (verificación + diseño): escribe `scripts/reply-bot.js` (módulo de respuesta anti-ban), verifica sintaxis, documenta y valida la integración. NO edita `radar-cron.js` mientras Antigravity lo toca.

## Regla de no-colisión
Mientras uno edita un archivo, el otro NO lo toca. Coordinan por mensaje, no por escritura simultánea.

## Estado del encargo de scrapeo (delegado a Antigravity)
Objetivo: IG/TikTok/X entren al radar usando sesiones logueadas (la VPS les da HTTP 200; DDG/Nitter están muertos).

Checklist para que Antigravity marque como HECHO:
- [x] Eliminado `fetchDdgSocialSearch` (depende de DDG muerto)
- [x] Eliminado `fetchNitterFeed` (depende de Nitter muerto)
- [x] IG vía instaloader logueado (session en /home/ubuntu/db/matiza/)
- [x] TikTok vía Playwright persistent logueado
- [x] X vía scrolling logueado
- [x] Telegram `t.me/s` mantenido
- [x] Eliminada inyección `views: 15000` (línea ~634)
- [x] `node --check scripts/radar-cron.js` → 0 errores

## Módulo de respuesta anti-ban (Hermes — `scripts/reply-bot.js`)
Integrable en `radar-cron.js` tras el insert de cada item:
```js
import { maybeReply } from './reply-bot.js';
// tras insertScrapedItem.run(...)
const r = maybeReply(item, viralityScore, suggestedTopic, id);
if (r.ok) console.log('[reply]', r.text);
```
Estrategia anti-detección (investigación 2026):
1. Warming: no comenta hasta N días de alta de cuenta.
2. Jitter: espera aleatoria entre comentarios (nunca metrónomo).
3. Límite diario bajo (cuentas nuevas aún menos).
4. Respuesta ÚNICA por post (variación de plantillas + enlace en contexto, nunca link pelado).
5. Una cuenta por red (evita "coordinated behavior").
6. Solo posts MUY virales (>8.0) y relevantes para matiza.

Verificado: `node --check scripts/reply-bot.js` → OK; auto-test genera respuesta correcta.
El `sendReply` es un stub: Antigravity debe completarlo con la sesión persistente logueada por plataforma.

## Coste
0€ en APIs. instaloader + Playwright logueado + X logueado cubren las 3 redes.
Proxy residencial solo si una red rate-limitea por IP de datacenter (no necesario al arrancar).
