# MATIZA MAINTENANCE RUNBOOK — MANUAL DE MANTENIMIENTO Y SALUD

Este documento define la operativa periódica para garantizar la salud de la base de datos, reintentar tareas colgadas y mantener la conectividad del runner local con la base de datos.

---

## 1. Operaciones de Limpieza y Recuperación

### Liberar trabajos colgados (Lease expired)
- Si un runner reclama un trabajo pero se detiene o apaga a mitad del análisis:
  - El trabajo quedará con `status = 'claimed'` indefinidamente.
  - El Schedule de mantenimiento local comprobará la cola y detectará trabajos donde:
    `status = 'claimed' AND lease_expires_at < datetime('now')`
  - Restaurará estos trabajos a `status = 'queued'` e incrementará la cuenta de intentos (`attempts`).

### Control de intentos máximos (Max attempts)
- Si un trabajo falla de forma continuada (ej. por errores permanentes en la URL):
  - Al superar `attempts >= max_attempts` (por defecto 3), el mantenimiento cambiará su estado a `failed` de forma permanente para no saturar la cola.
  - Registrará en `error_code` el motivo del descarte.

---

## 2. Ejecución Periódica (Schedule 4)
Se ejecuta periódicamente en el IDE de Antigravity para ejecutar la limpieza de la cola local de forma transparente:
```sql
-- Recuperar leases caducados
UPDATE verification_jobs
SET status = 'queued',
    claimed_by = NULL,
    lease_expires_at = NULL,
    progress_phase = 'Reencolado por timeout'
WHERE status = 'claimed' AND lease_expires_at < datetime('now');

-- Marcar fallidos crónicos
UPDATE verification_jobs
SET status = 'failed',
    error_code = 'ERR_MAX_ATTEMPTS_EXCEEDED',
    error_message = 'Se superaron los 3 intentos máximos de procesamiento'
WHERE status = 'queued' AND attempts >= max_attempts;
```
