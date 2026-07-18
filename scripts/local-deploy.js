import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
import { DatabaseSync } from 'node:sqlite';
import { analyzeUrl } from './check-url.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const SQLITE_DB_PATH = process.env.SQLITE_DB_PATH || path.resolve('data/matiza.db');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Falta configurar las variables de entorno de Supabase (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
  process.exit(1);
}

// Cliente con service role para poder escribir sin RLS restrictiva en la cola
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runLocalDeploy() {
  console.log('📡 [Local Deploy] Iniciando sincronización de cola de Supabase...');
  
  try {
    // 1. Obtener reportes pendientes de Supabase
    const { data: queueItems, error } = await supabase
      .from('scraped_items_queue')
      .select('*')
      .eq('status', 'pendiente')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error consultando Supabase: ${error.message}`);
    }

    if (!queueItems || queueItems.length === 0) {
      console.log('🟢 [Local Deploy] No hay reportes pendientes en la cola de Supabase.');
      return;
    }

    console.log(`📦 [Local Deploy] Encontrados ${queueItems.length} reportes pendientes para procesar.`);

    // Conectar a SQLite local
    const db = new DatabaseSync(SQLITE_DB_PATH);
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA journal_mode = WAL;');

    let processedCount = 0;

    for (const item of queueItems) {
      console.log(`\n🔍 [Procesando Reporte] ID: ${item.id} - URL: ${item.url}`);
      
      try {
        // A. Actualizar estado a "procesando" en Supabase
        await supabase
          .from('scraped_items_queue')
          .update({ status: 'procesando', execution_log: 'Iniciando scraping de URL local...' })
          .eq('id', item.id);

        // B. Ejecutar scraping local (check-url)
        console.log('   ├─ Corriendo scraper en origen...');
        const analysis = await analyzeUrl(item.url);
        const platform = analysis.platform || item.platform || 'Web Report';
        const title = analysis.title || '';
        const description = analysis.description || '';
        const originalImageUrl = analysis.imageUrl || null;
        const views = typeof analysis.views === 'number' ? analysis.views : 0;
        const databaseText = analysis.transcript || item.text || title || 'Enlace reportado por el público.';

        // C. Evaluar viralidad e índices en base a views detectados
        let iv = Math.max(2.0, Math.min(10.0, Math.log10(views + 1) * 1.5));
        let ird = 5.0;
        if (title.toLowerCase().includes('bulo') || title.toLowerCase().includes('zasca') || title.toLowerCase().includes('repaso')) {
          ird = 8.0;
        }

        // D. Insertar el item en la tabla local scraped_items de SQLite
        const insertStmt = db.prepare(`
          INSERT OR REPLACE INTO scraped_items (id, platform, url, text, author_public_name, metrics_json, detected_claim, suggested_topic, virality_score, risk_score, status, created_at)
          VALUES (?, ?, ?, ?, 'Público', ?, ?, 'General', ?, ?, 'pendiente', datetime('now'))
        `);
        insertStmt.run(
          item.id, platform, item.url, databaseText,
          JSON.stringify({ declared_views: views, imageUrl: originalImageUrl }),
          title || 'Reporte de la cola pública', iv, ird
        );

        // E. Ejecutar el pipeline de IA para el item ID específico de forma síncrona
        console.log(`   ├─ Ejecutando pipeline de IA para item: ${item.id}...`);
        await supabase
          .from('scraped_items_queue')
          .update({ execution_log: 'Ejecutando pipeline de IA de redacción...' })
          .eq('id', item.id);

        execSync(`node scripts/ai-pipeline.js --item-id=${item.id}`, { stdio: 'inherit' });

        // F. Buscar el artículo generado en la base de datos local SQLite
        console.log('   ├─ Comprobando artículo generado...');
        const createdArticle = db.prepare("SELECT slug, title, status FROM articles WHERE origin_url = ?").get(item.url);

        if (createdArticle) {
          console.log(`   └─ ¡Éxito! Artículo creado: "${createdArticle.title}" (Slug: ${createdArticle.slug})`);
          
          // Actualizar Supabase a "procesado" con las referencias
          await supabase
            .from('scraped_items_queue')
            .update({ 
              status: 'procesado', 
              execution_log: `Completado. Artículo generado con éxito.`,
              result_slug: createdArticle.slug,
              result_title: createdArticle.title
            })
            .eq('id', item.id);
          
          processedCount++;
        } else {
          console.warn('   ⚠️ No se generó ningún artículo en SQLite. El desmentido puede requerir revisión manual.');
          await supabase
            .from('scraped_items_queue')
            .update({ 
              status: 'error', 
              execution_log: 'El pipeline de IA no generó ningún artículo (puede que no cumpliera los estándares de calidad/relevancia mínimos).'
            })
            .eq('id', item.id);
        }
      } catch (errItem) {
        console.error(`   ❌ Error procesando el reporte ${item.id}:`, errItem.message);
        await supabase
          .from('scraped_items_queue')
          .update({ status: 'error', execution_log: `Error: ${errItem.message}` })
          .eq('id', item.id);
      }
    }

    db.close();

    // 2. Si se procesaron reportes nuevos con éxito, recompilar y desplegar
    if (processedCount > 0) {
      console.log('\n🚀 [Local Deploy] Compilando sitio estático (npm run build)...');
      execSync('npm run build', { stdio: 'inherit' });

      console.log('📦 [Local Deploy] Desplegando archivos estáticos...');
      // Intentar desplegar en Cloudflare Pages si la variable está definida
      const CF_PROJECT = process.env.CLOUDFLARE_PROJECT_NAME;
      if (CF_PROJECT) {
        console.log(`   ├─ Desplegando en Cloudflare Pages proyecto: ${CF_PROJECT}`);
        execSync(`npx wrangler pages deploy dist --project-name ${CF_PROJECT}`, { stdio: 'inherit' });
        console.log('   └─ Despliegue completado con éxito.');
      } else if (process.env.VERCEL_PROJECT_ID) {
        console.log('   ├─ Desplegando en Vercel...');
        execSync('npx vercel --prod --yes', { stdio: 'inherit' });
        console.log('   └─ Despliegue completado con éxito.');
      } else {
        console.log('   ⚠️ No se detectó ninguna variable de hosting (CLOUDFLARE_PROJECT_NAME o VERCEL_PROJECT_ID). Los archivos en dist/ se han compilado con éxito pero no se han subido.');
      }
    }

    // 3. Limpieza periódica de registros procesados/error en Supabase (opcional para mantener almacenamiento al mínimo)
    console.log('\n🧹 [Local Deploy] Limpiando reportes antiguos en Supabase...');
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { error: cleanError } = await supabase
      .from('scraped_items_queue')
      .delete()
      .lt('created_at', oneDayAgo)
      .in('status', ['procesado', 'error']);

    if (cleanError) {
      console.warn('   ⚠️ No se pudo realizar la limpieza de reportes antiguos:', cleanError.message);
    } else {
      console.log('   └─ Limpieza de reportes de más de 24 horas completada.');
    }

    console.log('\n🏁 [Local Deploy] Proceso de sincronización completado.');

  } catch (errGlobal) {
    console.error('❌ [Local Deploy] Error global en el proceso de despliegue local:', errGlobal.message);
  }
}

runLocalDeploy();
