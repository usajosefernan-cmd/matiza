import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = path.resolve('data/matiza.db');

// 1. Eliminar fuentes caídas o problemáticas de la base de datos de matizame
if (fs.existsSync(dbPath)) {
  try {
    const db = new DatabaseSync(dbPath);
    console.log(`[Limpieza de Fuentes] Conectado a la base de datos: ${dbPath}`);
    
    // Obtener todas las fuentes activas para verlas
    const activeSources = db.prepare("SELECT * FROM radar_sources WHERE status = 'activo'").all();
    console.log(`Total fuentes activas iniciales: ${activeSources.length}`);

    // Lista de nombres de fuentes a desactivar por dar 404, 403, error de fetch o de formato de fecha
    const sourcesToDeactivate = [
      'La Razón', 'Agencia EFE', 'Google Trends ES', 'Vozpópuli', 
      'Reddit SpainPolitics', 'Reddit España', 'El Debate', 'Público', 
      'El País Nacional', 'Servimedia', 'eldiario.es'
    ];

    let deactivatedCount = 0;
    sourcesToDeactivate.forEach(name => {
      const result = db.prepare("UPDATE radar_sources SET status = 'inactivo' WHERE name LIKE ?").run(`%${name}%`);
      deactivatedCount += result.changes;
    });

    console.log(`✓ Se han desactivado ${deactivatedCount} fuentes obsoletas o defectuosas.`);
    
    // Opcional: mostrar fuentes que quedan activas
    const remaining = db.prepare("SELECT name FROM radar_sources WHERE status = 'activo'").all();
    console.log(`Fuentes activas remanentes (${remaining.length}):`, remaining.map(r => r.name).join(', '));

    db.close();
  } catch (err) {
    console.error('Error al sanear las fuentes en la DB:', err.message);
  }
}

// 2. Borrar archivos duplicados y carpetas obsoletas de la raíz del proyecto para usar solo matiza
const rootItemsToDelete = [
  'data', // carpeta data de la raíz
  'scripts', // carpeta scripts de la raíz
  '.env', // archivo .env de la raíz
  'pipeline_config.json' // archivo pipeline_config de la raíz
];

console.log('\n[Limpieza de Raíz] Eliminando elementos duplicados de la raíz para quedarnos solo con matizame...');
rootItemsToDelete.forEach(item => {
  const itemPath = path.resolve('..', item); // .. sube a la raíz del workspace (newnews/) ya que corremos desde matizame/
  try {
    if (fs.existsSync(itemPath)) {
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        fs.rmSync(itemPath, { recursive: true, force: true });
        console.log(`✓ Carpeta de la raíz eliminada: ${item}`);
      } else {
        fs.unlinkSync(itemPath);
        console.log(`✓ Archivo de la raíz eliminado: ${item}`);
      }
    }
  } catch (err) {
    console.error(`Error al eliminar ${item} de la raíz:`, err.message);
  }
});
