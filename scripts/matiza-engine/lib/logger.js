// logger.js - MATIZA Engine Logger
import fs from 'node:fs';
import path from 'node:path';

const LOG_DIR = path.resolve('data/logs/matiza-engine');

export function logPhase({ phase, inputId, success, result = {}, warnings = [], errors = [], durationMs = 0, costEstimate = 0 }) {
  const timestamp = new Date().toISOString();
  
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }

  const logEntry = {
    timestamp,
    phase,
    inputId,
    success,
    result,
    warnings,
    errors,
    durationMs,
    costEstimate
  };

  const line = JSON.stringify(logEntry) + '\n';
  
  // Escribir en log consolidado
  fs.appendFileSync(path.join(LOG_DIR, 'pipeline.log'), line, 'utf-8');
  
  // Escribir log específico de la fase
  fs.appendFileSync(path.join(LOG_DIR, `${phase}.log`), line, 'utf-8');

  // Imprimir en consola de forma formateada y limpia
  const statusColor = success ? '\x1b[32m[OK]\x1b[0m' : '\x1b[31m[ERROR]\x1b[0m';
  console.log(`${timestamp} ${statusColor} Fase: ${phase} | Item: ${inputId} | Duración: ${durationMs}ms | Coste: $${costEstimate}`);
  
  if (warnings.length > 0) {
    console.warn(`   ⚠️  Warnings:`, warnings);
  }
  if (errors.length > 0) {
    console.error(`   ❌ Errors:`, errors);
  }
}
