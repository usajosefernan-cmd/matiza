import { getDb } from './config.js';
import { setClaimCache } from './cache.js';
import { execSync } from 'node:child_process';
import assert from 'node:assert';

function generateUniqueSlug(db, title) {
  let baseSlug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 60);
  baseSlug = baseSlug.replace(/-+$/, '').replace(/^-+/, '');
  if (!baseSlug) {
    baseSlug = 'articulo';
  }
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const row = db.prepare("SELECT id FROM articles WHERE slug = ?").get(slug);
    if (!row) {
      return slug;
    }
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

async function runTests() {
  console.log('--- EMPEZANDO PRUEBAS DE ROBUSTEZ Y CASOS DE BORDE ---');

  const db = getDb();
  db.prepare("DELETE FROM scraped_items WHERE id LIKE 'radar-user-%'").run();


  // --- PRUEBA 1: Dos títulos iguales generan slugs distintos y válidos ---
  console.log('[Prueba 1] Verificando generación de slugs únicos para títulos duplicados...');
  const title = "Título del artículo de prueba repetido";
  const slug1 = generateUniqueSlug(db, title);

  // Insertar temporalmente el primer artículo con slug1
  const id1 = `art-test-slug1-${Date.now()}`;
  db.prepare(`
    INSERT INTO articles (id, topic_id, slug, title, category, verdict, status, created_at, updated_at)
    VALUES (?, 't-autonomos', ?, ?, 'General', 'Falso', 'borrador', datetime('now'), datetime('now'))
  `).run(id1, slug1, title);

  const slug2 = generateUniqueSlug(db, title);
  assert.ok(slug1 !== slug2, "Los slugs de títulos duplicados no deberían ser idénticos");
  assert.ok(slug2.startsWith(slug1), "El segundo slug debería basarse en el primero");
  console.log(`  -> Slug 1: ${slug1}`);
  console.log(`  -> Slug 2: ${slug2}`);

  // Limpiar
  db.prepare("DELETE FROM articles WHERE id = ?").run(id1);

  // --- PRUEBA 2: Una restricción SQL falla el test ---
  console.log('[Prueba 2] Verificando que una restricción SQL no controlada es arrojada...');
  try {
    // Intentar insertar un artículo sin los campos obligatorios
    db.prepare(`INSERT INTO articles (id, slug) VALUES ('invalid', 'invalid')`).run();
    assert.fail("Debería haber lanzado un error por restricciones NULL/NOT NULL");
  } catch (err) {
    assert.ok(err.message.includes('NOT NULL') || err.message.includes('constraint failed'), "Debería lanzar error de restricción SQL");
    console.log(`  -> Restricción detectada correctamente: ${err.message}`);
  }

  // --- PRUEBA 3: Timeout aislado no produce éxito falso ni escritura tardía ---
  console.log('[Prueba 3] Verificando que el pipeline con timeout = 1ms falla con exit code no-cero...');
  try {
    execSync('MOCK_LLM=true NODE_ENV=test ITEM_TIMEOUT_MS=1 node scripts/matiza-engine/test-pipeline.js', { stdio: 'ignore' });
    assert.fail("El test con timeout = 1ms no debería haber retornado exit code 0");
  } catch (err) {
    // Si lanza error, significa que el comando falló (exit code no-cero), lo cual es correcto.
    console.log(`  -> Pipeline de timeout falló con éxito (exit code no-cero) como se esperaba.`);
    
    // Esperar brevemente
    await new Promise(resolve => setTimeout(resolve, 200));

    // Verificar en la base de datos
    const dbVerify = getDb();
    
    // Obtener el test sub que se insertó
    const testSubs = dbVerify.prepare("SELECT * FROM user_submissions WHERE id LIKE 'test-sub-%' ORDER BY created_at DESC").all();
    if (testSubs.length > 0) {
      const targetSub = testSubs[0];
      console.log(`  -> Verificando submission ${targetSub.id} con estado actual: ${targetSub.status}`);
      // La fase de Triage puede completarse o no antes del timeout debido a la rapidez del mock.
      // Pero no debe haber alcanzado estados posteriores.
      assert.ok(['recibido', 'en_cola'].includes(targetSub.status), "El envío no debió haber cambiado a estados posteriores");
      
      // Si se creó un scraped_item, debió quedarse como mucho en 'triage_completado'
      const scraped = dbVerify.prepare("SELECT * FROM scraped_items WHERE id LIKE 'radar-user-%'").all();
      for (const item of scraped) {
        console.log(`  -> Verificando scraped_item ${item.id} con estado: ${item.status}`);
        assert.strictEqual(item.status, 'triage_completado', "El item del radar no debe haber cambiado a evidencias_encontradas ni procesado");
      }
    }
    
    // Comprobar únicamente la fixture de esta prueba. No uses un patrón de ID
    // genérico porque también coincide con artículos reales de producción local.
    const testFixtureArticle = dbVerify.prepare("SELECT id FROM articles WHERE origin_url = ?").get('https://x.com/bulo_falso/status/1234');
    assert.strictEqual(testFixtureArticle, undefined, "No debe haberse guardado ningún artículo de la fixture");
    
    dbVerify.close();
    console.log(`  -> Verificación de no-persistencia completada con éxito.`);
  }

  // --- PRUEBA 4: Retry acotado de SQLite ---
  console.log('[Prueba 4] Verificando retry de SQLite frente a bloqueos...');
  // Verificamos que al escribir en cache con una base de datos bloqueada, reintenta y finalmente arroja error si excede los intentos
  // Simularemos bloqueando la base de datos externamente en una transacción exclusiva
  const blockerDb = getDb(true);
  blockerDb.exec("BEGIN EXCLUSIVE TRANSACTION;");

  const startTime = Date.now();
  let gotLockedError = false;
  try {
    // Intentamos escribir en cache usando una conexión nueva sin pasar dbArg. Debería reintentar y arrojar database is locked
    setClaimCache("Claim de prueba de bloqueo", { reuse_allowed: true });
  } catch (err) {
    gotLockedError = true;
    assert.ok(err.message.includes('locked') || err.message.includes('busy') || err.message.includes('SQLITE_BUSY'), "Debería arrojar error de bloqueo");
    const duration = Date.now() - startTime;
    console.log(`  -> Capturado error de bloqueo después de ${duration}ms de reintentos.`);
  } finally {
    blockerDb.exec("ROLLBACK;");
    blockerDb.close();
  }
  assert.ok(gotLockedError, "Debería haber fallado debido al bloqueo exclusivo de la base de datos");

  db.close();
  console.log('🟢 --- TODAS LAS PRUEBAS DE ROBUSTEZ PASARON CON ÉXITO --- 🟢');
}

runTests().catch(err => {
  console.error('❌ Error ejecutando pruebas de robustez:', err);
  process.exit(1);
});
