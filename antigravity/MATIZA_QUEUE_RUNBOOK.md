# MATIZA QUEUE RUNBOOK — MANUAL DE TRABAJO DE LA COLA

Este documento define el flujo operativo que debe seguir el runner local al procesar los trabajos de verificación pendientes en la tabla `verification_jobs`.

---

## 1. Ciclo de Vida del Trabajo
```text
[ queued ] -> (Runner reclama) -> [ claimed ] -> [ running ] -> [ completed ] o [ failed ]
```

---

## 2. Instrucciones para la Ejecución Local
Cada vez que el Schedule de Antigravity levanta el runner local:

### Paso 1: Consultar la Cola
- Consultar los trabajos en la base de datos `data/matiza.db` que cumplan con alguna de las siguientes condiciones:
  1. `status = 'queued'`
  2. `status = 'claimed'` y `lease_expires_at < datetime('now')` (bloqueos caducados).
- Ordenar por prioridad descendentemente (`emergency` > `high` > `normal` > `low`) y antigüedad (`created_at` asc).

### Paso 2: Reclamar el Trabajo (Lease locking atómico)
- Para evitar que otros runners o hilos procesen el mismo trabajo concurrentemente:
  ```sql
  UPDATE verification_jobs
  SET status = 'claimed',
      claimed_by = 'antigravity-local-main',
      lease_expires_at = datetime('now', '+5 minutes'),
      started_at = datetime('now'),
      attempts = attempts + 1
  WHERE id = ? AND (status = 'queued' OR lease_expires_at < datetime('now'));
  ```
- Si la consulta de actualización afectó a `changes = 1`, proceder. Si no, significa que otro hilo ya lo reclamó.

### Paso 3: Ejecutar el Motor
- Cambiar el estado a `running` y actualizar la fase de progreso.
- Extraer metadatos de la URL del post.
- Enviar el prompt estructurado con las etiquetas delimitadoras al puerto `3010` de la IA local de Antigravity.
- Generar la infografía SVG correspondiente.
- Registrar el artículo resultante en la base de datos local `data/matiza.db` con estado `publicado` (para ver en portada de inmediato).

### Paso 4: Finalización del Trabajo
- Si se completa con éxito:
  ```sql
  UPDATE verification_jobs
  SET status = 'completed',
      progress_phase = 'Finalizado',
      progress_percent = 100,
      completed_at = datetime('now'),
      result_id = ?
  WHERE id = ?;
  ```
- Si ocurre un error fatal no controlado:
  ```sql
  UPDATE verification_jobs
  SET status = 'failed',
      error_message = ?,
      completed_at = datetime('now')
  WHERE id = ?;
  ```
- Asegurar que la base de datos se cierra y libera limpiamente al finalizar la iteración.
