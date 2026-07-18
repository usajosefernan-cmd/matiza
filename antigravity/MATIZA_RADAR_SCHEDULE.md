# INSTRUCCIONES DEL SCHEDULE DEL RADAR SOCIAL (MATIZA_RADAR_SCHEDULE)

Este Schedule se ejecuta cada 30 minutos para buscar tendencias de desinformación virales en redes sociales y feeds RSS en España, y encolarlas de forma inteligente para que el Schedule de la cola de verificación las procese de forma secuencial.

## 🔄 FLUJO DE OPERACIÓN DE ANTIGRAVITY

1. **Rastreo Determinista**: Ejecuta el script determinista de Node para rastrear redes y feeds e insertar candidatos potenciales:
   ```powershell
   node scripts/antigravity-radar.js
   ```
2. **Evaluación de Ruido y Triage**:
   - Para cada candidato, el agente de Antigravity investiga la viralidad y relevancia fáctica del tema de forma nativa.
   - Si el tema carece de trascendencia, impacto social o es spam, se descarta marcándolo como archivado.
3. **Encolamiento**:
   - Los candidatos válidos y confirmados se insertan en la tabla `verification_jobs` con estado `'queued'` y prioridad calculada según la viralidad del tema.
4. **Finalización**: Registra el recuento de nuevos candidatos y finaliza la tarea.
