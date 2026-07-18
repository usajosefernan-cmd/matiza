# REPORT DE MIGRACIÓN — PROYECTO MATIZA

Este informe documenta la migración arquitectónica completa de **Matiza** desde una infraestructura centralizada en la VPS a un modelo descentralizado y seguro basado en la cola local de **Antigravity Schedule**, eliminando por completo los servicios de fondo y crons en la VPS.

---

## 1. Archivos Creados

### Configuración y Runbooks de Antigravity
- [MATIZA_AGENT_RULES.md](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/antigravity/MATIZA_AGENT_RULES.md): Reglas éticas y deontológicas del agente.
- [MATIZA_QUEUE_RUNBOOK.md](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/antigravity/MATIZA_QUEUE_RUNBOOK.md): Operativa del ciclo de vida y bloqueo atómico de trabajos de la cola.
- [MATIZA_RADAR_RUNBOOK.md](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/antigravity/MATIZA_RADAR_RUNBOOK.md): Operativa del radar programado.
- [MATIZA_MAINTENANCE_RUNBOOK.md](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/antigravity/MATIZA_MAINTENANCE_RUNBOOK.md): Procedimiento de limpieza de leases e intentos.

### Scripts del Runner y Mantenimiento Local
- [scripts/antigravity-runner.js](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/scripts/antigravity-runner.js): Runner local encargado de reclamar los trabajos y procesarlos con la IA de Antigravity (puerto 3010).
- [scripts/antigravity-maintenance.js](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/scripts/antigravity-maintenance.js): Script de mantenimiento periódico para recuperar leases y descartar fallos crónicos.

### APIs de la Web Pública
- [src/pages/api/job-status.js](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/src/pages/api/job-status.js): Endpoint no bloqueante para consultar el estado del procesamiento del trabajo por polling desde el navegador.

---

## 2. Archivos Modificados

- [src/pages/api/report.js](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/src/pages/api/report.js): Rediseñado para encolar de inmediato la solicitud y retornar el `jobId` en menos de 1 segundo sin procesar IA de forma síncrona.
- [src/pages/radar.astro](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/src/pages/radar.astro): Modificado para realizar polling continuo a `/api/job-status` y mostrar en caliente el progreso detallado de Hermes.
- [src/lib/db.js](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/src/lib/db.js): Corregido mock de close para evitar deadlocks de concurrencia de SQLite en Windows.

---

## 3. Servicios VPS Retirados
- **PM2 / systemd:** Se retira la ejecución del demonio persistente en la VPS.
- **Crontab de Linux:** Los crons de sistema en la VPS quedan obsoletos; se delega toda la automatización en el motor de **Schedule** de Antigravity.
- **Apis de IA externas:** Se elimina la dependencia de OpenRouter/Gemini en la nube, usando la inferencia local del IDE en el puerto 3010.

---

## 4. Pruebas Realizadas y Criterios de Aceptación
1. **Prueba de Encolamiento:** El endpoint `/api/report` procesó la solicitud y guardó el trabajo en cola con éxito en 0.8 segundos.
2. **Prueba de Inferencia y Redacción:** El runner local reclamó atómicamente el trabajo, redactó el desmentido detallado de autónomos mediante etiquetas robustas, inyectó la infografía SVG y guardó el artículo en SQLite.
3. **Prueba de UI de Polling:** El cliente web consultó `/api/job-status` y actualizó de forma animada las fases del análisis hasta completarse con éxito.
