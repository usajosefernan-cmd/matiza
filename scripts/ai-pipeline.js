import { getDb } from './matiza-engine/config.js';
import { detectHotTopics } from './matiza-engine/00-hot-topics-cron.js';
import { evaluateRelevance } from './matiza-engine/01-relevance-gate.js';
import { routeSemanticContent } from './matiza-engine/02-semantic-router.js';
import { planSourceStrategy } from './matiza-engine/03-source-strategy-planner.js';
import { filterNoise } from './matiza-engine/04-noise-filter.js';
import { extractClaim } from './matiza-engine/05-claim-extractor.js';
import { findEvidence } from './matiza-engine/06-evidence-finder.js';
import { verifyClaim } from './matiza-engine/07-verifier.js';
import { writeArticle } from './matiza-engine/08-article-writer.js';
import { checkQuality } from './matiza-engine/09-quality-gate.js';
import { queueForReview } from './matiza-engine/10-review-queue.js';
import { writeSocialPosts } from './matiza-engine/11-social-writer.js';
import { getClaimCache, setClaimCache } from './matiza-engine/cache.js';
import { getOrCapturePostImage } from './screenshot-helper.js';

import fs from 'node:fs';
import path from 'node:path';

// Parsear argumentos de fase y de item específico
const args = process.argv.slice(2);
const phaseArg = args.find(arg => arg.startsWith('--phase='));
const phase = phaseArg ? phaseArg.split('=')[1] : null;

const itemIdArg = args.find(arg => arg.startsWith('--item-id='));
const itemId = itemIdArg ? itemIdArg.split('=')[1] : null;

// Telemetría del Pipeline de IA
const telemetry = {
  phases: [],
  startTime: Date.now()
};

function recordPhase(phaseId, name, durationMs, provider = 'N/A', model = 'N/A', status = 'SUCCESS') {
  telemetry.phases.push({
    id: phaseId,
    name: name,
    durationMs: durationMs,
    provider: provider || 'N/A',
    model: model || 'N/A',
    status: status
  });
}

function printTelemetryReport() {
  const totalTimeSec = ((Date.now() - telemetry.startTime) / 1000).toFixed(2);
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║ 📊 INFORME DE TELEMETRÍA Y RENDIMIENTO DEL PIPELINE DE IA MATIZA       ║');
  console.log(`║    Tiempo de Ejecución Total: ${totalTimeSec} segundos`.padEnd(76) + '║');
  console.log('╠═══════════════════════════════════════════════════════════════════════════╣');
  console.log('║ FASE / AGENTE              │ TIEMPO  │ PROVEEDOR   │ MODELO FISICO        ║');
  console.log('╠═══════════════════════════════════════════════════════════════════════════╣');
  
  const maxMs = Math.max(...telemetry.phases.map(p => p.durationMs), 1);
  
  telemetry.phases.forEach(p => {
    const timeStr = (p.durationMs / 1000).toFixed(2) + 's';
    const phaseLabel = p.name.substring(0, 26).padEnd(26);
    const timeLabel = timeStr.padStart(7);
    const provLabel = p.provider.substring(0, 11).padEnd(11);
    const modelLabel = p.model.substring(0, 20).padEnd(20);
    
    // Barra proporcional
    const barLength = Math.round((p.durationMs / maxMs) * 10);
    const barStr = '█'.repeat(barLength) + '▒'.repeat(10 - barLength);
    
    console.log(`║ ${phaseLabel} │ ${timeLabel} │ ${provLabel} │ ${modelLabel} ║`);
  });
  
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');
}

// Cargar estado de piloto automático (autopilot) desde pipeline_config.json
let autopilot = false;
try {
  const configPath = path.resolve('pipeline_config.json');
  if (fs.existsSync(configPath)) {
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    autopilot = !!cfg.global?.autopilot;
  }
} catch (e) {
  console.error('[Pipeline config] No se pudo leer autopilot:', e.message);
}

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║ 🤖 MATIZA: PIPELINE DE INTELIGENCIA ARTIFICIAL MODULAR 🤖 ║');
if (phase) {
  console.log(`║      FASE SELECCIONADA: ${phase.toUpperCase().padEnd(28)} ║`);
} else {
  console.log('║      FASE SELECCIONADA: CICLO COMPLETO               ║');
}
console.log('╚══════════════════════════════════════════════════════╝');

// Función de similitud Jaccard para deduplicación léxica
function getJaccardSimilarity(str1, str2) {
  const clean = (s) => new Set((s || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3));
  const s1 = clean(str1);
  const s2 = clean(str2);
  if (s1.size === 0 || s2.size === 0) return 0;
  const intersection = new Set([...s1].filter(x => s2.has(x)));
  const union = new Set([...s1, ...s2]);
  return intersection.size / union.size;
}

async function runPipeline() {
  const db = getDb();
  let claimsScrapedCount = 0;
  let articlesPublishedCount = 0;

  // FASE 00: Hot Topics (Sólo en ciclo completo o fase de triage/00)
  if (!phase || phase === 'triage' || phase === '00') {
    try {
      console.log('\n--- PASO 00: Hot Topics Cron ---');
      const tStart = Date.now();
      await detectHotTopics();
      const duration = Date.now() - tStart;
      const tel = global.lastInferenceTelemetry || { provider: 'freellmapi', model: 'auto' };
      recordPhase('00', 'Hot Topics Radar', duration, tel.provider, tel.model, 'SUCCESS');
    } catch (err) {
      console.error('[Pipeline IA] Fallo en la fase 00 (Hot Topics):', err.message);
      recordPhase('00', 'Hot Topics Radar', 0, 'N/A', 'N/A', 'FAILED');
    }
  }

  // ==========================================
  // FLUJO: TRIAGE (Noise Filter, Relevance Gate)
  // ==========================================
  if (!phase || ['triage', '01', '04', '05'].includes(phase)) {
    console.log('\n--- PIPELINE: TRIAGE Y FILTRADO DE SPAM ---');
    const tStartTriage = Date.now();
    const pendingSubmissions = db.prepare("SELECT * FROM user_submissions WHERE status = 'recibido'").all();
    const pendingScraped = itemId 
      ? db.prepare("SELECT * FROM scraped_items WHERE id = ?").all(itemId)
      : db.prepare("SELECT * FROM scraped_items WHERE status IN ('pendiente', 'procesando', 'triage_completado')").all();

    claimsScrapedCount = pendingSubmissions.length + pendingScraped.length;
    console.log(`[Triage] Envios de usuarios: ${pendingSubmissions.length} en cola.`);
    console.log(`[Triage] Claims del radar: ${pendingScraped.length} en cola.`);

    const updateSubmissionStatus = db.prepare("UPDATE user_submissions SET status = ?, reason = ?, relevance_score = ? WHERE id = ?");
    const updateScrapedStatus = db.prepare("UPDATE scraped_items SET status = ?, risk_score = ?, virality_score = ? WHERE id = ?");

    // Triage de envíos de usuarios en paralelo
    if (pendingSubmissions.length > 0) {
      console.log(`[Triage] 🚀 Lanzando ${pendingSubmissions.length} agentes de Triage de Usuarios en paralelo...`);
      const userTriagePromises = pendingSubmissions.map(async (sub, idx) => {
        const agentId = idx + 1;
        const textToAnalyze = sub.submitted_text || sub.submitted_url || '';
        console.log(`  -> [Agente Triage Usuario #${agentId}] Procesando envío ID ${sub.id}...`);
        try {
          const noise = await filterNoise(textToAnalyze, 'Usuario');
          if (noise.is_noise) {
            updateSubmissionStatus.run('descartado_por_baja_relevancia', noise.noise_reason, 1.0, sub.id);
            console.log(`  -> [Agente Triage Usuario #${agentId}] Descartado por ruido: ${noise.noise_reason}`);
            return;
          }
          const relevance = await evaluateRelevance(textToAnalyze, 'Usuario');
          if (!relevance.should_process) {
            updateSubmissionStatus.run('monitorizando', relevance.reason, relevance.public_interest_score, sub.id);
            console.log(`  -> [Agente Triage Usuario #${agentId}] Puesto en monitoreo: ${relevance.reason}`);
            return;
          }
          const claimData = await extractClaim(textToAnalyze);
          const radarId = `radar-user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          db.prepare(`
            INSERT INTO scraped_items (id, platform, url, text, author_public_name, metrics_json, detected_claim, suggested_topic, virality_score, risk_score, status, created_at)
            VALUES (?, 'Usuario', ?, ?, 'Usuario Anónimo', '{}', ?, 'General', ?, ?, 'triage_completado', datetime('now'))
          `).run(radarId, sub.submitted_url || null, textToAnalyze, claimData.detected_claim, relevance.virality_score || 5.0, relevance.harm_score || 5.0);

          updateSubmissionStatus.run('en_cola', 'Aprobado en triage automático e insertado en la cola del radar.', relevance.public_interest_score, sub.id);
          console.log(`  ✅ [Agente Triage Usuario #${agentId}] Triage superado y guardado: "${claimData.detected_claim}"`);
        } catch (e) {
          console.error(`  ❌ [Agente Triage Usuario #${agentId}] Error:`, e.message);
        }
      });
      await Promise.all(userTriagePromises);
      console.log(`[Triage] ✅ Todos los agentes de Triage de Usuarios han finalizado.`);
    }

    // Triage de claims del radar en paralelo
    if (pendingScraped.length > 0) {
      console.log(`[Triage] 🚀 Lanzando ${pendingScraped.length} agentes de Triage del Radar en paralelo...`);
      const scrapedTriagePromises = pendingScraped.map(async (item, idx) => {
        const agentId = idx + 1;
        const textToProcess = item.text || item.detected_claim || '';
        console.log(`  -> [Agente Triage Radar #${agentId}] Evaluando item ID ${item.id} (${item.platform})...`);
        try {
          const isRequestedManual = (itemId !== null && item.id === itemId) || item.platform === 'Manual' || item.platform === 'Usuario';
          
          let isNoise = false;
          let shouldProcess = true;
          let harmScore = 5.0;
          let viralityScore = item.virality_score || 5.0;
          
          if (!isRequestedManual) {
            // Pre-filtro local de keywords de entretenimiento/deportes
            const textLower = textToProcess.toLowerCase();
            const forbiddenKeywords = [
              'fútbol', 'futbol', 'eurocopa', 'copa américa', 'copa america', 'real madrid', 'barcelona',
              'fc barcelona', 'mbappé', 'mbappe', 'messi', 'ronaldo', 'partido', 'vs', 'contra', 'juego',
              'canción', 'película', 'cine', 'concierto', 'música', 'tenis', 'alcaraz', 'nadal', 'fórmula 1', 'f1',
              'liga', 'champions', 'fichaje', 'entrenamiento'
            ];
            const hasForbidden = forbiddenKeywords.some(kw => textLower.includes(kw));
            if (hasForbidden) {
              updateScrapedStatus.run('ruido', 0.0, item.virality_score, item.id);
              console.log(`  -> [Agente Triage Radar #${agentId}] Descartado localmente (palabra prohibida)`);
              return;
            }

            const noise = await filterNoise(textToProcess, item.platform);
            if (noise.is_noise) {
              updateScrapedStatus.run('ruido', 0.0, item.virality_score, item.id);
              console.log(`  -> [Agente Triage Radar #${agentId}] Descartado por ruido: ${noise.noise_reason}`);
              return;
            }
            const metrics = JSON.parse(item.metrics_json || '{}');
            metrics.score = item.virality_score * 10;
            const relevance = await evaluateRelevance(textToProcess, item.platform, metrics);
            shouldProcess = relevance.should_process;
            harmScore = relevance.harm_score;
            viralityScore = relevance.virality_score;
            if (!shouldProcess) {
              updateScrapedStatus.run('descartado_por_baja_relevancia', harmScore, viralityScore, item.id);
              console.log(`  -> [Agente Triage Radar #${agentId}] Descartado por baja relevancia: ${relevance.reason}`);
              return;
            }
          } else {
            console.log(`  ⚡ [Agente Triage Radar #${agentId}] Triage Override para item solicitado`);
          }
          
          // Comprobar duplicación de claim con artículos existentes
          const claimData = await extractClaim(textToProcess);
          const claimToVerify = claimData.detected_claim || item.detected_claim;

          const existingArticles = db.prepare("SELECT id, claim, title FROM articles").all();
          let isDuplicate = false;
          for (const art of existingArticles) {
            if (getJaccardSimilarity(claimToVerify, art.claim) > 0.45 || getJaccardSimilarity(claimToVerify, art.title) > 0.45) {
              isDuplicate = true;
              break;
            }
          }
          if (isDuplicate) {
            updateScrapedStatus.run('procesado', harmScore, viralityScore, item.id);
            console.log(`  -> [Agente Triage Radar #${agentId}] Duplicado omitido: "${claimToVerify}"`);
            return;
          }

          // Si supera triage, marcar como triage_completado
          updateScrapedStatus.run('triage_completado', harmScore, viralityScore, item.id);
          console.log(`  ✅ [Agente Triage Radar #${agentId}] Triage superado: "${claimToVerify}"`);
        } catch (e) {
          console.error(`  ❌ [Agente Triage Radar #${agentId}] Error:`, e.message);
        }
      });
      await Promise.all(scrapedTriagePromises);
      console.log(`[Triage] ✅ Todos los agentes de Triage del Radar han finalizado.`);
    }
    const durationTriage = Date.now() - tStartTriage;
    const tel = global.lastInferenceTelemetry || { provider: 'freellmapi', model: 'auto' };
    recordPhase('01/04/05', 'Triage y Ruido', durationTriage, tel.provider, tel.model, 'SUCCESS');
  }

  // ==========================================
  // FLUJO: BUSCAR EVIDENCIAS (Semantic Router, Strategy Planner, Evidence Finder)
  // ==========================================
  if (!phase || ['evidence', '02', '03', '06'].includes(phase)) {
    console.log('\n--- PIPELINE: BÚSQUEDA DE EVIDENCIAS Y FACT-CHECKING ---');
    const tStartEvidence = Date.now();
    const pendingTriage = itemId
      ? db.prepare("SELECT * FROM scraped_items WHERE id = ?").all(itemId)
      : db.prepare("SELECT * FROM scraped_items WHERE status IN ('triage_completado', 'evidencias_encontradas')").all();
    console.log(`[Evidence Finder] Claims listos para buscar evidencias: ${pendingTriage.length}`);

    const updateScrapedStatus = db.prepare("UPDATE scraped_items SET status = ?, metrics_json = ? WHERE id = ?");

    if (pendingTriage.length > 0) {
      console.log(`[Evidence Finder] 🚀 Lanzando ${pendingTriage.length} agentes de Búsqueda de Evidencias en paralelo...`);
      const evidencePromises = pendingTriage.map(async (item, idx) => {
        const agentId = idx + 1;
        console.log(`  -> [Agente Evidencias #${agentId}] Buscando para: "${item.detected_claim}"...`);
        try {
          const route = await routeSemanticContent(item.detected_claim, item.suggested_topic);
          const topicId = route.topic_matches && route.topic_matches.length > 0 
            ? route.topic_matches[0].existing_topic_id 
            : (route.topic_match?.existing_topic_id || 't-autonomos');
          
          const allTopics = route.topic_matches && Array.isArray(route.topic_matches)
            ? route.topic_matches.map(tm => tm.existing_topic_id).filter(Boolean)
            : [topicId];

          const sourcePlan = await planSourceStrategy(item.detected_claim, item.suggested_topic, route.claim_type);
          const evidence = await findEvidence(item.detected_claim, topicId, sourcePlan.source_strategy);

          // Guardar las evidencias recolectadas serializadas dentro de metrics_json para que la fase de redacción las use
          const currentMetrics = JSON.parse(item.metrics_json || '{}');
          currentMetrics.collectedEvidence = evidence.sources;
          currentMetrics.topicId = topicId;
          currentMetrics.allTopics = allTopics;

          updateScrapedStatus.run('evidencias_encontradas', JSON.stringify(currentMetrics), item.id);
          console.log(`  ✅ [Agente Evidencias #${agentId}] Guardadas (${evidence.sources.length} fuentes encontradas) para "${item.detected_claim.substring(0, 45)}..."`);
        } catch (e) {
          console.error(`  ❌ [Agente Evidencias #${agentId}] Error:`, e.message);
          updateScrapedStatus.run('error', item.metrics_json, item.id);
        }
      });
      await Promise.all(evidencePromises);
      console.log(`[Evidence Finder] ✅ Todos los agentes de Búsqueda de Evidencias han finalizado.`);
    }
    const durationEvidence = Date.now() - tStartEvidence;
    const tel = global.lastInferenceTelemetry || { provider: 'freellmapi', model: 'auto' };
    recordPhase('02/03/06', 'Router y Evidencias', durationEvidence, tel.provider, tel.model, 'SUCCESS');
  }

  // ==========================================
  // FLUJO: VERIFICAR Y REDACTAR (Verifier, Writer, Quality Gate)
  // ==========================================
  if (!phase || ['write', '07', '08', '09', '10'].includes(phase)) {
    console.log('\n--- PIPELINE: REDACCIÓN DE DESMENTIDOS Y DEONTOLOGÍA ---');
    const tStartWrite = Date.now();
    
    // Si corre en fase aislada, toma las que tienen 'evidencias_encontradas'. 
    // En ciclo completo, también puede tomar 'triage_completado' como fallback si falló el paso anterior.
    const queryStr = (phase && ['07', '08', '09', '10'].includes(phase))
      ? "SELECT * FROM scraped_items WHERE status IN ('evidencias_encontradas', 'procesado')"
      : "SELECT * FROM scraped_items WHERE status IN ('triage_completado', 'evidencias_encontradas')";
    
    const pendingWrite = itemId
      ? db.prepare("SELECT * FROM scraped_items WHERE id = ?").all(itemId)
      : db.prepare(queryStr).all();
    console.log(`[Writer] Claims listos para verificar y redactar: ${pendingWrite.length}`);

    const updateScrapedStatus = db.prepare("UPDATE scraped_items SET status = ? WHERE id = ?");

    if (pendingWrite.length > 0) {
      console.log(`[Writer] 🚀 Lanzando ${pendingWrite.length} agentes de Redacción en paralelo...`);
      const writePromises = pendingWrite.map(async (item, idx) => {
        const agentId = idx + 1;
        console.log(`  -> [Agente Redactor #${agentId}] Verificando y redactando: "${item.detected_claim}"...`);
        try {
          const metrics = JSON.parse(item.metrics_json || '{}');
          
          // Captura visual del post original si la URL está presente y carece de imagen
          if (item.url && (!metrics.imageUrl || metrics.imageUrl.includes('unsplash.com') || metrics.imageUrl.includes('placeholder'))) {
            try {
              console.log(`  [Agente Redactor #${agentId}] URL del debate detectada: ${item.url}. Capturando visualmente...`);
              const capturedPath = await getOrCapturePostImage(item.url, item.id);
              if (capturedPath) {
                metrics.imageUrl = capturedPath;
                item.metrics_json = JSON.stringify(metrics);
                db.prepare("UPDATE scraped_items SET metrics_json = ? WHERE id = ?").run(item.metrics_json, item.id);
                console.log(`  [Agente Redactor #${agentId}] ✅ Captura guardada con éxito en ${capturedPath}`);
              }
            } catch (errCapture) {
              console.error(`  [Agente Redactor #${agentId}] Error intentando capturar la pantalla:`, errCapture.message);
            }
          }

          let sources = metrics.collectedEvidence || [];

          // Si no hay evidencias guardadas previamente, hacer búsqueda rápida de fallback
          if (sources.length === 0) {
            const route = await routeSemanticContent(item.detected_claim, item.suggested_topic);
            const topicId = route.topic_matches && route.topic_matches.length > 0 
              ? route.topic_matches[0].existing_topic_id 
              : (route.topic_match?.existing_topic_id || 't-autonomos');
            
            const allTopics = route.topic_matches && Array.isArray(route.topic_matches)
              ? route.topic_matches.map(tm => tm.existing_topic_id).filter(Boolean)
              : [topicId];

            const sourcePlan = await planSourceStrategy(item.detected_claim, item.suggested_topic, route.claim_type);
            const evidence = await findEvidence(item.detected_claim, topicId, sourcePlan.source_strategy);
            sources = evidence.sources;
            metrics.topicId = topicId;
            metrics.allTopics = allTopics;
          }

          const topicId = metrics.topicId || 't-autonomos';
          const verification = await verifyClaim(item.detected_claim, sources);
          let article = await writeArticle(item.detected_claim, verification, sources);
          
          let quality = await checkQuality(article, verification.verdict);
          if (!quality.passed) {
            console.log(`  ⚠️ [Agente Redactor #${agentId}] Def Defensor del Lector: Re-redactando por fallar control de calidad deontológico...`);
            article = await writeArticle(item.detected_claim, {
              ...verification,
              verdict_reasoning: verification.verdict_reasoning + `\nCORRECCIONES DE CALIDAD REQUERIDAS: ${quality.corrections_required.join('. ')}`
            }, sources);
          }

          // Filtro de Calidad Estricta: Todo en verde obligatorio
          const hasImage = metrics.imageUrl && !metrics.imageUrl.includes('unsplash.com/photo-1541872703-74c5e44368f9') && !metrics.imageUrl.includes('placeholder');
          const hasOriginUrl = !!item.url;
          const hasSources = sources && sources.length > 0;
          const hasData = (verification.what_is_true && verification.what_is_true.trim().length > 15) || (verification.what_is_false && verification.what_is_false.trim().length > 15);
          const isExplanationGood = article.explanation && article.explanation.trim().length > 350;

          if (!hasImage || !hasOriginUrl || !hasSources || !hasData || !isExplanationGood) {
            console.log(`  🛑 [Agente Redactor #${agentId}] [Calidad Estricta] El artículo no tiene todos los indicadores en verde. Se descarta.`);
            console.log(`     - Imagen: ${hasImage ? '🟢 OK' : '🔴 Falta'}`);
            console.log(`     - Enlace Original: ${hasOriginUrl ? '🟢 OK' : '🔴 Falta'}`);
            console.log(`     - Fuentes Oficiales: ${hasSources ? '🟢 OK' : '🔴 Falta'}`);
            console.log(`     - Cifras/Datos: ${hasData ? '🟢 OK' : '🔴 Falta'}`);
            console.log(`     - Redacción: ${isExplanationGood ? '🟢 OK' : '🔴 Insuficiente'}`);
            
            updateScrapedStatus.run('calidad_insuficiente', item.id);
            return;
          }

          // Escribir artículo en base de datos
          const articleId = `art-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const baseSlug = article.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 60);
          let slug = baseSlug;
          const checkSlug = db.prepare("SELECT id FROM articles WHERE slug = ?");
          while (checkSlug.get(slug)) {
            slug = `${baseSlug.substring(0, 50)}-${Math.floor(Math.random() * 1000)}`;
          }
          const category = db.prepare("SELECT category FROM topics WHERE id = ?").get(topicId)?.category || 'General';

          const statusVal = 'publicado';
          const reviewVal = 0;
          const pubAtVal = new Date().toISOString();

          db.prepare(`
            INSERT INTO articles (
              id, topic_id, slug, title, subtitle, claim, origin_platform, origin_url, origin_summary, 
              category, verdict, confidence, summary, explanation, what_is_true, what_is_false, 
              what_lacks_context, what_is_not_proven, status, human_review_required, published_at, origin_date,
              multimedia_url, multimedia_type, trick_used, matiza_score, emoji_tag, infographic_svg, infographic_parts, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          `).run(
            articleId, topicId, slug, article.title, article.subtitle, item.detected_claim,
            item.platform, item.url, item.text, category, verification.verdict, verification.confidence,
            article.summary, article.explanation, verification.what_is_true, verification.what_is_false,
            verification.what_lacks_context, verification.what_is_not_proven,
            statusVal, reviewVal, pubAtVal,
            item.origin_date || new Date().toISOString(), metrics.imageUrl || null, metrics.imageUrl ? 'image' : null,
            article.trick_used || 'dato sin base', article.matiza_score || 50, article.emoji_tag || '🧊 Falta contexto',
            article.infographic_svg || null,
            JSON.stringify(article.infographic_parts || [])
          );

          // Insertar relaciones con múltiples temas/expedientes
          const insertArticleTopic = db.prepare(`
            INSERT OR IGNORE INTO article_topics (article_id, topic_id)
            VALUES (?, ?)
          `);
          insertArticleTopic.run(articleId, topicId);
          
          if (article.tags && Array.isArray(article.tags)) {
            const insertTag = db.prepare(`
              INSERT OR IGNORE INTO tags (id, slug, name)
              VALUES (?, ?, ?)
            `);
            const insertArticleTag = db.prepare(`
              INSERT OR IGNORE INTO article_tags (article_id, tag_id)
              VALUES (?, ?)
            `);

            for (const rawTag of article.tags) {
              if (rawTag && typeof rawTag === 'string' && rawTag.trim()) {
                const name = rawTag.trim();
                const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                
                let existingTag = db.prepare("SELECT id FROM tags WHERE slug = ?").get(slug);
                let tagId;
                if (existingTag) {
                  tagId = existingTag.id;
                } else {
                  tagId = `tag-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                  insertTag.run(tagId, slug, name);
                }
                
                insertArticleTag.run(articleId, tagId);
              }
            }
          }

          // Insertar fuentes
          const insertSource = db.prepare(`
            INSERT OR REPLACE INTO sources (id, article_id, title, url, source_type, authority_level, quote_or_summary, date_accessed)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
          `);
          sources.forEach((src, idx) => {
            insertSource.run(`src-ai-${Date.now()}-${idx}`, articleId, src.title, src.url, src.source_type || 'oficial', src.authority_level || 'Alta', src.quote_or_summary);
          });

          queueForReview(articleId, `Revisión deontológica completada: ${quality.quality_score}/10.`);

          setClaimCache(item.detected_claim, {
            similar_claims: [item.detected_claim],
            previous_verdict: verification.verdict,
            previous_sources: sources,
            previous_article_id: articleId,
            reuse_allowed: true
          });

          updateScrapedStatus.run('procesado', item.id);
          articlesPublishedCount++;
          console.log(`  ✅ [Agente Redactor #${agentId}] Borrador de artículo creado con éxito: "${article.title}"`);
        } catch (e) {
          console.error(`  ❌ [Agente Redactor #${agentId}] Error redactando artículo:`, e.message);
          updateScrapedStatus.run('error', item.id);
        }
      });
      await Promise.all(writePromises);
      console.log(`[Writer] ✅ Todos los agentes de Redacción han finalizado.`);
    }
    const durationWrite = Date.now() - tStartWrite;
    const tel = global.lastInferenceTelemetry || { provider: 'freellmapi', model: 'auto' };
    recordPhase('07/08/09/10', 'Verificador y Redactor', durationWrite, tel.provider, tel.model, 'SUCCESS');
  }

  // ==========================================
  // FLUJO: GENERACIÓN SOCIAL (Twitter, Telegram)
  // ==========================================
  if (!phase || ['social', '11'].includes(phase)) {
    console.log('\n--- PIPELINE: GENERACIÓN DE COPIES REDES SOCIALES ---');
    const tStartSocial = Date.now();
    let pendingSocialArticles;
    if (itemId) {
      pendingSocialArticles = db.prepare(`
        SELECT * FROM articles 
        WHERE claim = (SELECT detected_claim FROM scraped_items WHERE id = ?)
        AND id NOT IN (SELECT DISTINCT article_id FROM social_posts)
      `).all(itemId);
    } else {
      const queryStr = (phase === '11')
        ? "SELECT * FROM articles"
        : "SELECT * FROM articles WHERE id NOT IN (SELECT DISTINCT article_id FROM social_posts)";
      pendingSocialArticles = db.prepare(queryStr).all();
    }
    console.log(`[Social Writer] Artículos para generación de copys de redes: ${pendingSocialArticles.length}`);

    const insertSocialPost = db.prepare(`
      INSERT OR REPLACE INTO social_posts (id, article_id, platform, format, content, status, scheduled_at, published_at)
      VALUES (?, ?, ?, ?, ?, 'programado', datetime('now'), null)
    `);

    if (pendingSocialArticles.length > 0) {
      console.log(`[Social Writer] 🚀 Lanzando ${pendingSocialArticles.length} agentes de Redacción de Redes en paralelo...`);
      const socialPromises = pendingSocialArticles.map(async (art, idx) => {
        const agentId = idx + 1;
        console.log(`  -> [Agente Social #${agentId}] Generando copies para: "${art.title}"...`);
        try {
          const posts = await writeSocialPosts(art.title, art.subtitle, art.verdict, art.claim);
          let postsArray = [];
          if (Array.isArray(posts)) {
            postsArray = posts;
          } else if (posts && typeof posts === 'object') {
            const keyWithArray = Object.keys(posts).find(k => Array.isArray(posts[k]));
            if (keyWithArray) {
              postsArray = posts[keyWithArray];
            }
          }
          postsArray.forEach((post, pIdx) => {
            insertSocialPost.run(`soc-ai-${Date.now()}-${pIdx}`, art.id, post.platform, post.format, post.content);
          });
          console.log(`  ✅ [Agente Social #${agentId}] Copies de Twitter/Telegram creados con éxito para "${art.title.substring(0, 45)}..."`);
        } catch (e) {
          console.error(`  ❌ [Agente Social #${agentId}] Error:`, e.message);
        }
      });
      await Promise.all(socialPromises);
      console.log(`[Social Writer] ✅ Todos los agentes de Redacción de Redes han finalizado.`);
    }
    const durationSocial = Date.now() - tStartSocial;
    const tel = global.lastInferenceTelemetry || { provider: 'freellmapi', model: 'auto' };
    recordPhase('11', 'Social Copies (X/TG)', durationSocial, tel.provider, tel.model, 'SUCCESS');
  }

  // Registrar la ejecución en el historial
  try {
    const durationSec = ((Date.now() - telemetry.startTime) / 1000).toFixed(2);
    const runId = `run-${Date.now()}`;
    const insertRun = db.prepare(`
      INSERT INTO pipeline_runs (id, started_at, duration_sec, claims_scraped, claims_processed, articles_published, telemetry_json)
      VALUES (?, datetime('now'), ?, ?, ?, ?, ?)
    `);
    insertRun.run(
      runId,
      durationSec,
      claimsScrapedCount || 0,
      telemetry.phases.length,
      articlesPublishedCount || 0,
      JSON.stringify(telemetry.phases)
    );
    console.log(`[Telemetry] 📊 Registro de ejecución guardado en el historial: ${runId}`);
  } catch (err) {
    console.error('[Telemetry] Fallo al guardar en pipeline_runs:', err.message);
  }

  db.close();
  printTelemetryReport();
  console.log('\n[Pipeline IA] Finalización limpia de la ejecución.');
}

runPipeline().catch(err => {
  console.error('[Pipeline IA] Error crítico en ejecución:', err);
});
