# Informe de Auditoría — MATIZA (Fase 0)

> [!NOTE]
> Este documento ha sido redactado de forma objetiva tras realizar una auditoría de solo lectura en el repositorio. Ningún archivo del proyecto ha sido modificado en esta fase.

---

## 1. Tecnología Detectada
El ecosistema de la aplicación está construido bajo las siguientes tecnologías principales:
* **Framework Web Principal:** [Astro v4](https://astro.build/) en modo híbrido (SSG para fichas de noticias estáticas y SSR a través de `@astrojs/node` para endpoints de API y paneles dinámicos).
* **Framework de Componentes:** [React](https://react.dev/) (v19) integrado con Astro.
* **Lenguaje:** JavaScript y TypeScript (v5.5.0) en scripts de soporte.
* **Base de Datos:** [SQLite 3](https://sqlite.org/) con modo WAL (Write-Ahead Logging) habilitado para permitir accesos y escrituras concurrentes.
* **Scraping / Ingestión:** Python (`scrape_instagram.py`) y JavaScript / Playwright (`radar-cron.js`) para capturar publicaciones de YouTube, TikTok, Instagram, X, Telegram y feeds RSS.
* **Inferencia de IA:** API de **Gemini** mediante enrutamiento por OpenRouter o API directa.

---

## 2. Estructura Importante del Repo
El árbol de directorios y archivos de MATIZA está estructurado del siguiente modo:
* **`/src/pages/`**: Contiene la lógica de renderizado público y administrativo de Astro.
  * [index.astro](file:///home/ubuntu/workspace/projects/newnews/src/pages/index.astro): Portada pública con feed, "Confusómetro" y Código Deontológico.
  * [interceptor.astro](file:///home/ubuntu/workspace/projects/newnews/src/pages/interceptor.astro): Buzón de reportes ciudadanos y detección de claims.
  * [actualidad.astro](file:///home/ubuntu/workspace/projects/newnews/src/pages/actualidad.astro): Feed general de noticias y desmentidos.
  * [admin.astro](file:///home/ubuntu/workspace/projects/newnews/src/pages/admin.astro): Panel de administración interactivo neón/cyberpunk que integra colas de radar y logs en vivo.
  * [api/report.js](file:///home/ubuntu/workspace/projects/newnews/src/pages/api/report.js): Endpoint para procesamiento de reportes y envío por streaming (NDJSON).
  * [api/run-job.js](file:///home/ubuntu/workspace/projects/newnews/src/pages/api/run-job.js): Ejecutor de tareas/scripts del backend desde la web.
* **`/scripts/`**: Automatizaciones y orquestaciones del swarm de Hermes.
  * [hermes-cron.js](file:///home/ubuntu/workspace/projects/newnews/scripts/hermes-cron.js): Orquestador del flujo del robot de compilación y llamada al pipeline de IA.
  * [radar-cron.js](file:///home/ubuntu/workspace/projects/newnews/scripts/radar-cron.js): Monitor de RSS, Reddit, Telegram y redes sociales con Playwright e Instaloader.
  * [ai-pipeline.js](file:///home/ubuntu/workspace/projects/newnews/scripts/ai-pipeline.js): Conectores con modelos de lenguaje para el contraste de claims.
  * [sync.js](file:///home/ubuntu/workspace/projects/newnews/scripts/sync.js): Script de swap atómico de directorios `dist` para evitar caídas del servidor en PM2.
* **`/scripts/matiza-engine/`**: Pasos lógicos del pipeline de procesamiento modular actual (desglose de 00 a 12).
* **`/data/`**: Base de datos SQLite (`matiza.db` / `newnews.db`) y logs persistentes (`logs/pipeline.log`).
* **`/guia/`**: Plan conceptual del portal segmentado por fases.

---

## 3. Archivos Críticos que NO Conviene Tocas
Se deben extremar precauciones con los siguientes archivos:
* [sync.js](file:///home/ubuntu/workspace/projects/newnews/scripts/sync.js) y [hermes-cron.js](file:///home/ubuntu/workspace/projects/newnews/scripts/hermes-cron.js): Controlan el intercambio atómico `renameSync` de la compilación de Astro (`dist_temp` -> `dist`). Cualquier alteración de rutas o nombres puede dejar el portal inoperativo en producción bajo PM2.
* [migrate.js](file:///home/ubuntu/workspace/projects/newnews/scripts/migrate.js): Script de base que inicializa y altera el esquema SQLite. Modificar esquemas de forma ad-hoc sin migración formal corromperá los datos existentes.
* [admin.astro](file:///home/ubuntu/workspace/projects/newnews/src/pages/admin.astro): Centraliza en 93KB toda la interfaz y llamadas reactivas del panel de moderación, por lo que una refactorización descuidada podría romper los paneles de logs o aprobaciones rápidas.

---

## 4. Motor Actual de Noticias/IA y sus Problemas
El motor actual está distribuido entre `ai-pipeline.js` y el módulo `/scripts/matiza-engine/`.
* **Problemas Identificados:**
  1. **Agotamiento de cuota de API / Coste:** Si el radar captura ruido comercial o debates sin impacto, las llamadas continuas a la API de inferencia saturan el presupuesto y los rate limits.
  2. **Bloqueos de red al scrapear:** Redes como X, Instagram y TikTok imponen bloqueos drásticos a las IPs procedentes de Oracle Cloud u otros centros de datos públicos.
  3. **Fallos en scripts CLI:** Se detectaron previamente problemas en llamadas por parámetros de temperatura no soportados (`invalid choice: '0.2'`) o discrepancia en el número de parámetros de sentencias SQL (`INSERT INTO articles`).

---

## 5. Admin Actual y sus Problemas
* **Estructura:** El archivo `admin.astro` está sobrecargado con lógica de backend (ejecución de jobs mediante `/api/run-job/` y lectura de terminal con `/api/admin/pipeline-logs/`).
* **Problemas Identificados:**
  * **Falta de modularidad:** Toda la UI del dashboard, cola de aprobación, listado de fuentes, terminal y configuración se encuentra en una sola plantilla de Astro.
  * **Gestión de concurrencia:** Ejecutar crons manuales desde el admin web puede colisionar con la base de datos SQLite si el servidor intenta escribir a la vez, arrojando excepciones del tipo `SQLITE_BUSY: database is locked`.

---

## 6. Dónde Encaja Matiza Engine
El motor se integrará en las siguientes áreas sin romper la arquitectura existente:
* **Lógica del motor:** Mantener y refinar la modularidad en [/scripts/matiza-engine/](file:///home/ubuntu/workspace/projects/newnews/scripts/matiza-engine).
* **Definición de reglas y contratos:** Los esquemas JSON de intercambio se ubicarán en `guia/contracts/` para validar cada fase.
* **Panel de Control ampliado:** La administración y cola de aprobación rápida encaja de forma nativa extendiendo el panel en `/src/pages/admin.astro` mediante componentes independientes importados desde `/src/components/admin/` para aliviar el tamaño del archivo principal.

---

## 7. Riesgos de Romper la Web al Evolucionarla
1. **Descuadre del Swap Atómico:** Errores de compilación en Astro (por TypeScript o lints de imports) impedirán que `sync.js` genere `dist_temp/dist/server/entry.mjs`, lo que interrumpirá el despliegue del cron de compilación y tumbará PM2.
2. **Exposición de Credenciales:** Inclusión de claves de API de OpenRouter o Gemini en componentes cliente de React o Astro.
3. **Corrupción en SQLite:** Sincronización inoportuna de la base de datos de producción mediante Syncthing. La base de datos debe permanecer centralizada y aislada mediante enlace simbólico tal como se describe en el `README.md`.

---

## 8. Plan de Fases Recomendado
El desarrollo seguirá el orden establecido en la guía:
* **Fase 0 (Actual):** Auditoría e informe de solo lectura.
* **Fase 1:** Estructura segura aislada del motor.
* **Fase 2:** Definición de contratos JSON para las entradas/salidas.
* **Fase 3:** Hot Topics y Verticales Vivos.
* **Fase 4:** Relevance Router y Caché Semántica para filtrar ruido.
* **Fase 5:** Pipeline de Verificación completo con evidencias contrastadas.
* **Fase 6:** Panel de aprobación rápida y edición de artículos.
* **Fase 7:** Integración con Radar y Buzón de Usuarios.
* **Fases 8 a 10:** Política, JudicialCheck y Corrupción.
* **Fase 11:** UX pública y Home Portal Joven.
* **Fase 12:** Orquestación final de crons de Hermes.
* **Fases 13 a 17:** Incorporación del módulo **MATIZA Live Agentic** (audio streaming, transcripción y alertas en vivo).

---

## 9. STOP: No avanzar sin aprobación de AETHER
Quedo a la espera de la revisión de este informe y la autorización explícita para comenzar la **Fase 1 — Estructura segura aislada** y configurar el entorno de trabajo.
