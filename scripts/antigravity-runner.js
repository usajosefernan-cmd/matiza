import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { analyzeUrl } from './check-url.js';
import { buildInfographic } from './infographic-system.js';

const dbPath = path.resolve('data/matiza.db');
const scratchDir = path.resolve('scratch');

if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

async function run() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === '--claim') {
    await handleClaim();
  } else if (command === '--persist') {
    const jobId = args[1];
    if (!jobId) {
      console.error('[Antigravity Runner] ERROR: Se requiere el ID de trabajo para persistir.');
      process.exit(1);
    }
    await handlePersist(jobId);
  } else {
    // Modo de compatibilidad si se ejecuta sin argumentos (intenta reclamar)
    await handleClaim();
  }
}

async function handleClaim() {
  console.log('[Antigravity Runner] Buscando trabajos en cola...');
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  const job = db.prepare(`
    SELECT * FROM verification_jobs
    WHERE status = 'queued' OR (status = 'claimed' AND lease_expires_at < datetime('now'))
    ORDER BY 
      CASE priority 
        WHEN 'emergency' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'normal' THEN 3 
        WHEN 'low' THEN 4 
        ELSE 5 
      END ASC,
      created_at ASC
    LIMIT 1
  `).get();

  if (!job) {
    console.log('[Antigravity Runner] No hay trabajos pendientes en cola.');
    db.close();
    return;
  }

  const jobId = job.id;
  console.log(`[Antigravity Runner] Reclamando trabajo ${jobId} (${job.job_type})...`);

  const nowStr = new Date().toISOString();
  const leaseExpiresStr = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min lease

  const claimResult = db.prepare(`
    UPDATE verification_jobs
    SET status = 'claimed',
        claimed_by = 'antigravity-local-main',
        lease_expires_at = ?,
        started_at = ?,
        progress_phase = 'Analizando metadatos de origen',
        progress_percent = 10,
        attempts = attempts + 1,
        updated_at = ?
    WHERE id = ? AND (status = 'queued' OR lease_expires_at < datetime('now'))
  `).run(leaseExpiresStr, nowStr, nowStr, jobId);

  if (claimResult.changes === 0) {
    console.log('[Antigravity Runner] El trabajo fue reclamado por otro proceso.');
    db.close();
    return;
  }

  db.close();

  try {
    const inputUrl = job.input_url || '';
    const inputText = job.input_text || '';
    let platform = 'Web Report';
    let title = '';
    let description = '';
    let originalImageUrl = null;
    let views = 0;

    if (inputUrl) {
      try {
        const analysis = await analyzeUrl(inputUrl);
        platform = analysis.platform || platform;
        title = analysis.title || '';
        description = analysis.description || '';
        originalImageUrl = analysis.imageUrl || null;
        if (typeof analysis.views === 'number') {
          views = analysis.views;
        } else if (typeof analysis.views === 'string') {
          const matched = analysis.views.match(/\d+/);
          if (matched) views = parseInt(matched[0]);
        }
      } catch (e) {
        console.warn('[Antigravity Runner] Error analizando URL:', e.message);
      }
    }

    const cleanClaim = inputText.trim() || title || `Enlace de ${platform} reportado por el público.`;

    const requestData = {
      jobId,
      inputUrl,
      inputText,
      platform,
      title,
      description,
      originalImageUrl,
      views,
      cleanClaim,
      created_at: nowStr
    };

    const requestPath = path.join(scratchDir, `ia_request_${jobId}.json`);
    fs.writeFileSync(requestPath, JSON.stringify(requestData, null, 2), 'utf-8');

    // Actualizar progreso a espera de IA de Antigravity
    const dbUpdate = new DatabaseSync(dbPath);
    dbUpdate.prepare(`
      UPDATE verification_jobs
      SET status = 'processing',
          progress_phase = 'Esperando inferencia local de Antigravity',
          progress_percent = 30,
          updated_at = ?
      WHERE id = ?
    `).run(new Date().toISOString(), jobId);
    dbUpdate.close();

    console.log(`[Antigravity Request Created] ${requestPath}`);

  } catch (error) {
    console.error(`[Antigravity Runner] ERROR en claim del trabajo ${jobId}:`, error.message);
    markJobFailed(jobId, error.message);
  }
}

async function handlePersist(jobId) {
  console.log(`[Antigravity Runner] Iniciando persistencia de resultados del trabajo ${jobId}...`);
  const responsePath = path.join(scratchDir, `ia_response_${jobId}.json`);
  const requestPath = path.join(scratchDir, `ia_request_${jobId}.json`);

  if (!fs.existsSync(responsePath)) {
    console.error(`[Antigravity Runner] ERROR: No existe el archivo de respuesta: ${responsePath}`);
    process.exit(1);
  }

  let responseData;
  try {
    responseData = JSON.parse(fs.readFileSync(responsePath, 'utf-8'));
  } catch (err) {
    console.error('[Antigravity Runner] ERROR parseando JSON de respuesta:', err.message);
    process.exit(1);
  }

  let requestData = {};
  if (fs.existsSync(requestPath)) {
    try {
      requestData = JSON.parse(fs.readFileSync(requestPath, 'utf-8'));
    } catch (e) {}
  }

  try {
    const claim = responseData.claim || requestData.cleanClaim || 'Declaración en redes.';
    const title = responseData.title;
    const subtitle = responseData.subtitle;
    const verdict = (responseData.verdict || 'falta_contexto').toLowerCase();
    const confidence = (responseData.confidence || 'media').toLowerCase();
    const summary = responseData.summary;
    const explanation = responseData.explanation;
    const what_is_true = responseData.what_is_true;
    const what_is_false = responseData.what_is_false;
    const emoji_tag = responseData.emoji_tag || '💼';
    const matiza_score = parseInt(responseData.matiza_score) || 50;
    const trick_used = responseData.trick_used || 'ninguno';

    if (!title || !explanation) {
      throw new Error('La respuesta de la IA no contiene los campos estructurados obligatorios (title o explanation).');
    }

    // Generar infografía
    let svg = null;
    try {
      const infoResult = buildInfographic({
        claim,
        trick_used,
        why: summary,
        sources: [`S1: Metadatos oficiales de ${requestData.platform || 'Redes'}`],
        what_is_true,
        matiza_score,
        emoji_tag
      });
      svg = infoResult.svg;
    } catch (infoErr) {
      console.warn('[Antigravity Runner] No se pudo generar la infografía:', infoErr.message);
    }

    const db = new DatabaseSync(dbPath);
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA journal_mode = WAL;');

    const articleId = `art-web-${Date.now().toString().slice(-6)}`;
    const generatedSlug = `${title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')}-${articleId}`;
    const finishedNow = new Date().toISOString();

    // 1. Insertar artículo (con estado human_review para moderación)
    db.prepare(`
      INSERT INTO articles (
        id, topic_id, slug, title, subtitle, claim, origin_platform, origin_url, 
        origin_summary, origin_date, category, verdict, confidence, summary, 
        explanation, what_is_true, what_is_false, status, human_review_required, 
        published_at, created_at, updated_at, trick_used, newnews_score, emoji_tag, 
        infographic_svg, matiza_score
      ) VALUES (?, 'General', ?, ?, ?, ?, ?, ?, ?, ?, 'General', ?, ?, ?, ?, ?, ?, 'human_review', 1, ?, ?, ?, ?, 0, ?, ?, ?)
    `).run(
      articleId,
      generatedSlug,
      title,
      subtitle,
      claim,
      requestData.platform || 'Web',
      requestData.inputUrl || '',
      requestData.cleanClaim || '',
      finishedNow.split('T')[0],
      verdict,
      confidence,
      summary,
      explanation,
      what_is_true,
      what_is_false,
      finishedNow,
      finishedNow,
      finishedNow,
      trick_used,
      emoji_tag,
      svg,
      matiza_score
    );

    // 2. Insertar fuente
    try {
      db.prepare(`
        INSERT INTO sources (id, article_id, title, url, source_type, authority_level, quote_or_summary, date_accessed)
        VALUES (?, ?, ?, ?, 'oficial', 'alta', ?, ?)
      `).run(
        `src-${Date.now()}`,
        articleId,
        `Metadatos oficiales de verificación - ${requestData.platform || 'Web'}`,
        requestData.inputUrl || '',
        summary,
        finishedNow.split('T')[0]
      );
    } catch (e) {}

    // 3. Completar el trabajo
    db.prepare(`
      UPDATE verification_jobs
      SET status = 'completed',
          progress_phase = 'Completado',
          progress_percent = 100,
          completed_at = ?,
          result_id = ?,
          updated_at = ?
      WHERE id = ?
    `).run(finishedNow, articleId, finishedNow, jobId);

    db.close();

    // Eliminar archivos JSON temporales
    try {
      if (fs.existsSync(responsePath)) fs.unlinkSync(responsePath);
      if (fs.existsSync(requestPath)) fs.unlinkSync(requestPath);
    } catch (e) {}

    console.log(`[Antigravity Runner] Persistencia completada con éxito. Artículo generado en moderación: ${generatedSlug}`);

  } catch (err) {
    console.error('[Antigravity Runner] ERROR persistiendo desmentido:', err.message);
    markJobFailed(jobId, err.message);
  }
}

function markJobFailed(jobId, errorMessage) {
  try {
    const db = new DatabaseSync(dbPath);
    const errNow = new Date().toISOString();
    db.prepare(`
      UPDATE verification_jobs
      SET status = 'failed',
          error_code = 'ERR_PROCESSING_FAILED',
          error_message = ?,
          completed_at = ?,
          updated_at = ?
      WHERE id = ?
    `).run(errorMessage, errNow, errNow, jobId);
    db.close();
  } catch (e) {
    console.warn('[Antigravity Runner] No se pudo marcar el trabajo como fallido:', e.message);
  }
}

run();
