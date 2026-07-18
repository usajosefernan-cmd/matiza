import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

console.log('🔄 Ejecutando build de Astro y swap atómico en VPS...');

try {
  // 1. Compilar Astro a dist_temp
  execSync('npx astro build --outDir dist_temp', { stdio: 'inherit', env: process.env });
  
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
  
  console.log('✅ Swap completado con éxito.');
} catch (err) {
  console.error('❌ Falló la compilación o el swap en la VPS:', err.message);
  process.exit(1);
}
