# INSTRUCCIONES DEL SCHEDULE DE COLA DE VERIFICACIÓN (MATIZA_QUEUE_SCHEDULE)

Este Schedule se ejecuta de forma recurrente cada 1 minuto de fondo en Antigravity para procesar solicitudes de la ciudadanía en la cola de Matiza.

## 🔄 FLUJO DE OPERACIÓN DE ANTIGRAVITY

1. **Reclamo Determinista**: ejecuta el script de Node para extraer y encolar el trabajo pendiente:
   ```powershell
   node scripts/antigravity-runner.js --claim
   ```
2. **Detección de Archivo**: Verifica si se ha generado un archivo de solicitud en `scratch/ia_request_[jobId].json`.
   - Si no hay ningún archivo, finaliza la tarea inmediatamente sin realizar ninguna acción.
3. **Procesamiento de Inferencia y Razonamiento**:
   - Lee el archivo JSON generado.
   - Aplica las instrucciones de `MATIZA_MASTER_INSTRUCTIONS.md`.
   - Investiga y contrasta las afirmaciones de forma nativa.
   - Estructura las conclusiones siguiendo el formato JSON esperado (título, subtítulo, veredicto, explicación detallada en markdown, y fuentes oficiales consultadas).
   - Escribe el JSON final en `scratch/ia_response_[jobId].json` con estado `'human_review'`.
4. **Persistencia en Base de Datos**: Ejecuta el script determinista de Node para consolidar el desmentido en SQLite:
   ```powershell
   node scripts/antigravity-runner.js --persist [jobId]
   ```
5. **Finalización**: Asegura la limpieza de archivos temporales de disco.
