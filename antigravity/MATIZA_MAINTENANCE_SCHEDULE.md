# INSTRUCCIONES DEL SCHEDULE DE MANTENIMIENTO (MATIZA_MAINTENANCE_SCHEDULE)

Este Schedule se ejecuta cada 10 minutos para auditar la salud de la base de datos de Matiza, limpiar leases huérfanos y mantener la integridad del sistema.

## 🔄 FLUJO DE OPERACIÓN DE ANTIGRAVITY

1. **Limpieza e Integridad**: Ejecuta el script determinista de Node para realizar la recolección de basura del pipeline y liberar leases:
   ```powershell
   node scripts/antigravity-maintenance.js
   ```
2. **Auditoría de Estados**:
   - Comprueba que no existan trabajos marcados como `processing` cuya marca de tiempo sea superior a 15 minutos en el pasado. En caso de haberlos, los devuelve al estado `queued` para reintento.
3. **Métricas y Reporte**: Registra el estado de salud en la tabla de logs del sistema de Antigravity.
