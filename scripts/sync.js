import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║ ⚡ MATIZA: INICIANDO PIPELINE DE SINCRONIZACIÓN ⚡  ║');
console.log('╚══════════════════════════════════════════════════════╝');

function runCommand(command, description) {
  console.log(`\n🔹 [PROCESO] ${description}...`);
  console.log(`$ ${command}`);
  try {
    execSync(command, { stdio: 'inherit', env: process.env });
    console.log(`✅ [EXITO] ${description} completado.`);
    return true;
  } catch (error) {
    console.error(`❌ [ERROR] ${description} falló.`);
    console.error(error.message);
    return false;
  }
}

// La sincronización en producción sólo ejecuta la compilación atómica de Astro para mantener la web fresca
// El radar de redes y el pipeline de IA corren en sus propios crons independientes de fondo.

// 3. Ejecutar Build de Astro usando swap atómico para evitar caídas de servidor
console.log(`\n🔹 [PROCESO] Reconstruyendo Portal Estático (Astro Build Atómico)...`);
let buildSuccess = false;
try {
  const buildEnv = { ...process.env };
  if (process.platform === 'linux') {
    buildEnv.SQLITE_DB_PATH = '/home/ubuntu/db/matiza/matiza.db';
  }
  execSync('npx astro build --outDir dist_temp', { stdio: 'inherit', env: buildEnv });
  
  const distPath = path.resolve('dist');
  const tempPath = path.resolve('dist_temp');
  const backupPath = path.resolve('dist_backup');
  
  if (fs.existsSync(backupPath)) {
    fs.rmSync(backupPath, { recursive: true, force: true });
  }
  
  if (fs.existsSync(distPath)) {
    fs.renameSync(distPath, backupPath);
  }
  
  // Si Astro compiló a un subdirectorio dist_temp/dist, usamos ese subdirectorio para el swap
  const finalTempPath = fs.existsSync(path.join(tempPath, 'dist')) ? path.join(tempPath, 'dist') : tempPath;
  fs.renameSync(finalTempPath, distPath);
  
  // Limpiar cualquier residuo de dist_temp
  if (fs.existsSync(tempPath)) {
    fs.rmSync(tempPath, { recursive: true, force: true });
  }
  
  if (fs.existsSync(backupPath)) {
    fs.rmSync(backupPath, { recursive: true, force: true });
  }
  
  // Recargar el proceso PM2 de Astro en producción para evitar crashes
  try {
    execSync('pm2 reload matiza', { stdio: 'ignore' });
    console.log(`🔄 [PM2] Servidor matiza recargado correctamente.`);
  } catch (e) {
    // Ignorar si PM2 no está disponible (ej. en local)
  }
  
  console.log(`\n✅ [EXITO] Reconstruyendo Portal Estático (Astro Build Atómico) completado.`);
  buildSuccess = true;
} catch (error) {
  console.error(`❌ [ERROR] Reconstruyendo Portal Estático (Astro Build Atómico) falló.`);
  console.error(error.message);
}

if (!buildSuccess) {
  console.error('⚠️ El build de Astro ha fallado. Revisa los errores del compilador.');
  process.exit(1);
}

console.log('\n========================================================');
console.log('🎉 ¡Sincronización y Reconstrucción Completada con Éxito!');
console.log('========================================================');
process.exit(0);
