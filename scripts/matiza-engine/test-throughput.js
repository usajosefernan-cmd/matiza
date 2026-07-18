import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { DatabaseSync } from 'node:sqlite';
import { dbPath } from './config.js';

async function runThroughputTests() {
  console.log('=== INICIANDO PRUEBAS DE THROUGHPUT Y LÍMITES ===');

  // 1. Demostrar "default 40" y "concurrencia máxima 3"
  console.log('[Prueba 1] Verificando default 40 y concurrencia 3 en configuración del Pipeline...');
  
  // Ejecutamos la fase 00 (Hot Topics) con MOCK_LLM=true. Es inofensiva y rápida.
  // No pasamos MAX_ITEMS_PER_CYCLE ni CONCURRENCY_LIMIT en el entorno para verificar los valores por defecto.
  const envClean = { ...process.env };
  delete envClean.MAX_ITEMS_PER_CYCLE;
  delete envClean.CONCURRENCY_LIMIT;
  
  const output = execSync('MOCK_LLM=true node scripts/ai-pipeline.js --phase=00', {
    env: envClean,
    encoding: 'utf-8'
  });
  
  assert.ok(output.includes('Límite de ítems por ciclo (MAX_ITEMS_PER_CYCLE) = 40'), 
    'El valor por defecto de MAX_ITEMS_PER_CYCLE debe ser 40');
  assert.ok(output.includes('Inicializado con límite de concurrencia = 3'), 
    'El valor por defecto de CONCURRENCY_LIMIT debe ser 3');
  console.log('  -> Default 40 y Concurrencia Máxima 3 verificados correctamente en logs.');

  // 2. Demostrar "aislamiento --item-id"
  console.log('[Prueba 2] Verificando aislamiento de --item-id...');
  const dbTempPath = path.resolve('data/test-isolation.db');
  
  // Copiar DB activa
  fs.copyFileSync(dbPath, dbTempPath);
  
  const dbIsolation = new DatabaseSync(dbTempPath);
  // Limpiar
  dbIsolation.exec("DELETE FROM user_submissions;");
  dbIsolation.exec("DELETE FROM scraped_items;");
  dbIsolation.exec("DELETE FROM articles;");
  
  // Insertar dos submissions
  dbIsolation.prepare(`
    INSERT INTO user_submissions (id, submitted_url, submitted_text, detected_claim, suggested_topic_id, virality_status, relevance_score, status, reason, created_at)
    VALUES ('test-item-a', 'https://x.com/a', 'Texto A', 'Claim A', null, 'Pendiente', 0.0, 'recibido', 'Test A', datetime('now'))
  `).run();
  
  dbIsolation.prepare(`
    INSERT INTO user_submissions (id, submitted_url, submitted_text, detected_claim, suggested_topic_id, virality_status, relevance_score, status, reason, created_at)
    VALUES ('test-item-b', 'https://x.com/b', 'Texto B', 'Claim B', null, 'Pendiente', 0.0, 'recibido', 'Test B', datetime('now'))
  `).run();

  // Insertar sus correspondientes scraped_items
  dbIsolation.prepare(`
    INSERT INTO scraped_items (id, platform, url, text, author_public_name, metrics_json, detected_claim, suggested_topic, virality_score, risk_score, status, created_at)
    VALUES ('test-item-a', 'Usuario', 'https://x.com/a', 'Texto A', 'Usuario A', '{}', 'Claim A', 'General', 5.0, 5.0, 'pendiente', datetime('now'))
  `).run();

  dbIsolation.prepare(`
    INSERT INTO scraped_items (id, platform, url, text, author_public_name, metrics_json, detected_claim, suggested_topic, virality_score, risk_score, status, created_at)
    VALUES ('test-item-b', 'Usuario', 'https://x.com/b', 'Texto B', 'Usuario B', '{}', 'Claim B', 'General', 5.0, 5.0, 'pendiente', datetime('now'))
  `).run();
  
  dbIsolation.close();

  // Ejecutar el pipeline para test-item-a
  execSync('MOCK_LLM=true SQLITE_DB_PATH=data/test-isolation.db node scripts/ai-pipeline.js --item-id=test-item-a', {
    stdio: 'ignore'
  });

  // Verificar resultados
  const dbIsolationVerify = new DatabaseSync(dbTempPath);
  const subA = dbIsolationVerify.prepare("SELECT status FROM user_submissions WHERE id = 'test-item-a'").get();
  const subB = dbIsolationVerify.prepare("SELECT status FROM user_submissions WHERE id = 'test-item-b'").get();
  
  assert.ok(subA.status !== 'recibido', 'El item A debió ser procesado y cambiar de estado');
  assert.strictEqual(subB.status, 'recibido', 'El item B NO debió ser procesado');
  
  dbIsolationVerify.close();
  fs.unlinkSync(dbTempPath);
  console.log('  -> Aislamiento de --item-id verificado correctamente (solo se procesó el item especificado).');

  // 3. Demostrar "un ciclo no procesa más de 40"
  console.log('[Prueba 3] Verificando que un ciclo no procesa más de 40 artículos...');
  const dbLimitPath = path.resolve('data/test-limit.db');
  
  // Copiar DB activa
  fs.copyFileSync(dbPath, dbLimitPath);
  
  const dbLimit = new DatabaseSync(dbLimitPath);
  dbLimit.exec("DELETE FROM user_submissions;");
  dbLimit.exec("DELETE FROM scraped_items;");
  dbLimit.exec("DELETE FROM articles;");
  
  // Insertar 45 submissions y 45 scraped_items
  for (let i = 0; i < 45; i++) {
    const id = `test-sub-${i}`;
    dbLimit.prepare(`
      INSERT INTO user_submissions (id, submitted_url, submitted_text, detected_claim, suggested_topic_id, virality_status, relevance_score, status, reason, created_at)
      VALUES (?, ?, ?, ?, null, 'Pendiente', 0.0, 'recibido', 'Test', datetime('now'))
    `).run(id, `https://x.com/test/${i}`, `Texto ${i}`, `Claim ${i}`);

    dbLimit.prepare(`
      INSERT INTO scraped_items (id, platform, url, text, author_public_name, metrics_json, detected_claim, suggested_topic, virality_score, risk_score, status, created_at)
      VALUES (?, 'Usuario', ?, ?, 'Usuario Test', '{}', ?, 'General', 5.0, 5.0, 'pendiente', datetime('now'))
    `).run(id, `https://x.com/test/${i}`, `Texto ${i}`, `Claim ${i}`);
  }
  dbLimit.close();

  // Ejecutar fase triage con MAX_ITEMS_PER_CYCLE=40
  execSync('MOCK_LLM=true SQLITE_DB_PATH=data/test-limit.db node scripts/ai-pipeline.js --phase=triage', {
    stdio: 'ignore'
  });

  // Verificar que exactamente 40 items fueron procesados y 5 quedaron en recibido/pendiente
  const dbLimitVerify = new DatabaseSync(dbLimitPath);
  
  const submissionsProcessed = dbLimitVerify.prepare("SELECT COUNT(*) as cnt FROM user_submissions WHERE status != 'recibido'").get().cnt;
  const submissionsPending = dbLimitVerify.prepare("SELECT COUNT(*) as cnt FROM user_submissions WHERE status = 'recibido'").get().cnt;
  
  assert.strictEqual(submissionsProcessed, 40, 'Se debieron procesar exactamente 40 user_submissions');
  assert.strictEqual(submissionsPending, 5, 'Debieron quedar exactamente 5 user_submissions en estado recibido');
  
  dbLimitVerify.close();
  fs.unlinkSync(dbLimitPath);
  console.log('  -> Límite de ciclo de 40 artículos verificado correctamente (procesados 40 de 45).');

  // 4. Demostrar rendimiento y concurrencia bajo carga (simulación de procesamiento rápido de múltiples elementos)
  console.log('[Prueba 4] Verificando rendimiento y concurrencia bajo carga...');
  const dbLoadPath = path.resolve('data/test-load.db');
  fs.copyFileSync(dbPath, dbLoadPath);
  
  const dbLoad = new DatabaseSync(dbLoadPath);
  dbLoad.exec("DELETE FROM user_submissions;");
  dbLoad.exec("DELETE FROM scraped_items;");
  dbLoad.exec("DELETE FROM articles;");
  
  // Insertar 10 items
  for (let i = 0; i < 10; i++) {
    const id = `test-load-${i}`;
    dbLoad.prepare(`
      INSERT INTO user_submissions (id, submitted_url, submitted_text, detected_claim, suggested_topic_id, virality_status, relevance_score, status, reason, created_at)
      VALUES (?, ?, ?, ?, null, 'Pendiente', 0.0, 'recibido', 'Test Load', datetime('now'))
    `).run(id, `https://x.com/load/${i}`, `Texto Load ${i}`, `Claim Load ${i}`);

    dbLoad.prepare(`
      INSERT INTO scraped_items (id, platform, url, text, author_public_name, metrics_json, detected_claim, suggested_topic, virality_score, risk_score, status, created_at)
      VALUES (?, 'Usuario', ?, ?, 'Usuario Test', '{}', ?, 'General', 5.0, 5.0, 'pendiente', datetime('now'))
    `).run(id, `https://x.com/load/${i}`, `Texto Load ${i}`, `Claim Load ${i}`);
  }
  dbLoad.close();

  // Medir el tiempo de ejecución con MOCK_LLM y concurrencia de 5
  const loadStart = Date.now();
  execSync('MOCK_LLM=true CONCURRENCY_LIMIT=5 SQLITE_DB_PATH=data/test-load.db node scripts/ai-pipeline.js --phase=triage', {
    stdio: 'ignore'
  });
  const loadDuration = Date.now() - loadStart;
  console.log(`  -> Procesados 10 elementos en ${loadDuration}ms con límite de concurrencia = 5.`);
  
  // El tiempo de procesamiento con MOCK_LLM y concurrencia debería ser extremadamente bajo (e.g. < 5000ms)
  assert.ok(loadDuration < 5000, 'El procesamiento de 10 elementos debería completarse en menos de 5 segundos con Mock LLM');
  
  const dbLoadVerify = new DatabaseSync(dbLoadPath);
  const loadedProcessed = dbLoadVerify.prepare("SELECT COUNT(*) as cnt FROM user_submissions WHERE status != 'recibido'").get().cnt;
  assert.strictEqual(loadedProcessed, 10, 'Se debieron procesar los 10 elementos concurrentemente');
  dbLoadVerify.close();
  fs.unlinkSync(dbLoadPath);
  console.log('  -> Rendimiento y concurrencia bajo carga verificados con éxito.');

  console.log('🟢 === TODAS LAS PRUEBAS DE THROUGHPUT PASARON CON ÉXITO === 🟢');
}

runThroughputTests().catch(err => {
  console.error('❌ Error en pruebas de throughput:', err);
  process.exit(1);
});
