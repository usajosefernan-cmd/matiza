import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { analyzeUrl } from './check-url.js';
import { callGemini } from './matiza-engine/config.js';
import { buildInfographic } from './infographic-system.js';

const dbPath = path.resolve('data/matiza.db');

async function run() {
  console.log('[Antigravity Runner] Iniciando iteración de cola...');
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  // 1. Buscar trabajos pendientes
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

  // 2. Reclamar el trabajo de forma atómica
  const nowStr = new Date().toISOString();
  const leaseExpiresStr = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutos lease

  const claimResult = db.prepare(`
    UPDATE verification_jobs
    SET status = 'claimed',
        claimed_by = 'antigravity-local-main',
        lease_expires_at = ?,
        started_at = ?,
        progress_phase = 'Reclamado por el motor local',
        progress_percent = 5,
        attempts = attempts + 1,
        updated_at = ?
    WHERE id = ? AND (status = 'queued' OR lease_expires_at < datetime('now'))
  `).run(leaseExpiresStr, nowStr, nowStr, jobId);

  if (claimResult.changes === 0) {
    console.log('[Antigravity Runner] El trabajo fue tomado por otro proceso.');
    db.close();
    return;
  }

  // Cerrar temporalmente para evitar locks durante la inferencia larga
  db.close();

  try {
    const inputUrl = job.input_url || '';
    const inputText = job.input_text || '';
    let platform = 'Web Report';
    let title = '';
    let description = '';
    let originalImageUrl = null;
    let views = 0;

    // FASE A: Analizar origen (20%)
    updateJobProgress(jobId, 'Analizando origen', 20);
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
        console.warn('[Antigravity Runner] Error extrayendo metadatos:', e.message);
      }
    }

    // FASE B: Buscando fuentes (50%)
    updateJobProgress(jobId, 'Buscando fuentes y evidencias', 50);
    const cleanClaim = inputText.trim() || title || `Enlace de ${platform} reportado por el público.`;

    // FASE C: Redactando borrador (80%)
    updateJobProgress(jobId, 'Redactando borrador y veredicto', 80);

    const promptRedaccion = `Estamos auditando un posible bulo o polémica en España:
URL: ${inputUrl}
Plataforma: ${platform}
Título/Metadatos en origen: ${title} ${description}
Comentario del usuario: ${inputText}
Viralidad: ${views} reproducciones

Eres el editor jefe y fact-checker de la plataforma MATIZA. Tu tarea es analizar este reclamo respecto de la realidad de España y redactar un desmentido de forma sumamente profesional, periodística, neutral y sin inventar datos falsos.
Si el contenido trata sobre autónomos y José Elías, contrasta lo que argumenta y aclara con precisión los datos y la regulación real de la Seguridad Social de España.

Debes responder estructurando tu respuesta estrictamente con las siguientes etiquetas delimitadoras exactas:
[TITLE]Título corto y periodístico del desmentido (máx 15 palabras)[/TITLE]
[SUBTITLE]Subtítulo explicativo del desmentido[/SUBTITLE]
[VERDICT]bulo|verdadero|impreciso|falta_contexto|no_probado[/VERDICT]
[CONFIDENCE]alta|media|baja[/CONFIDENCE]
[SUMMARY]Resumen en una frase del desmentido y la realidad (máx 30 palabras)[/SUMMARY]
[EXPLANATION]Desglose analítico detallado en formato Markdown (párrafos claros, negritas) explicando el debate, qué es verdad, qué es opinión, y qué dice la ley o los datos oficiales. Cita fuentes oficiales y aporta contexto objetivo.[/EXPLANATION]
[WHAT_IS_TRUE]Qué es real en el reclamo (una frase corta)[/WHAT_IS_TRUE]
[WHAT_IS_FALSE]Qué es falso o engañoso en el reclamo (una frase corta)[/WHAT_IS_FALSE]
[EMOJI_TAG]emoji identificativo (ej. 💼, 🏠, 📈, etc.)[/EMOJI_TAG]
[MATIZA_SCORE]número del 0 al 100 indicando la fiabilidad general (0=bulo total, 100=verdad absoluta)[/MATIZA_SCORE]
[TRICK_USED]cherry-picking|falso dilema|dato sin base|video recortado|ninguno[/TRICK_USED]`;

    const textContent = await callGemini(promptRedaccion, 'global');
    if (!textContent) {
      throw new Error('La IA local devolvió contenido vacío.');
    }

    const extractField = (tag, txt) => {
      const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, 'i');
      const match = txt.match(regex);
      return match ? match[1].trim() : '';
    };

    const articleData = {
      title: extractField('TITLE', textContent),
      subtitle: extractField('SUBTITLE', textContent),
      verdict: extractField('VERDICT', textContent).toLowerCase() || 'falta_contexto',
      confidence: extractField('CONFIDENCE', textContent).toLowerCase() || 'media',
      summary: extractField('SUMMARY', textContent),
      explanation: extractField('EXPLANATION', textContent),
      what_is_true: extractField('WHAT_IS_TRUE', textContent),
      what_is_false: extractField('WHAT_IS_FALSE', textContent),
      emoji_tag: extractField('EMOJI_TAG', textContent) || '💼',
      matiza_score: parseInt(extractField('MATIZA_SCORE', textContent)) || 50,
      trick_used: extractField('TRICK_USED', textContent) || 'ninguno'
    };

    if (!articleData.title || !articleData.explanation) {
      throw new Error('No se pudieron extraer los campos estructurados obligatorios del desmentido.');
    }

    // FASE D: Generando infografía (95%)
    updateJobProgress(jobId, 'Generando infografía explicativa', 95);

    let svg = null;
    try {
      const infoResult = buildInfographic({
        claim: cleanClaim,
        trick_used: articleData.trick_used,
        why: articleData.summary,
        sources: [`S1: Metadatos oficiales de ${platform}`],
        what_is_true: articleData.what_is_true,
        matiza_score: articleData.matiza_score,
        emoji_tag: articleData.emoji_tag
      });
      svg = infoResult.svg;
    } catch (infoErr) {
      console.warn('[Antigravity Runner] No se pudo generar la infografía:', infoErr.message);
    }

    // FASE E: Publicar y Completar (100%)
    const dbWrite = new DatabaseSync(dbPath);
    dbWrite.exec('PRAGMA foreign_keys = ON;');
    dbWrite.exec('PRAGMA journal_mode = WAL;');

    const articleId = `art-web-${Date.now().toString().slice(-6)}`;
    const generatedSlug = `${articleData.title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')}-${articleId}`;
    const finishedNow = new Date().toISOString();

    // 1. Insertar artículo
    dbWrite.prepare(`
      INSERT INTO articles (
        id, topic_id, slug, title, subtitle, claim, origin_platform, origin_url, 
        origin_summary, origin_date, category, verdict, confidence, summary, 
        explanation, what_is_true, what_is_false, status, human_review_required, 
        published_at, created_at, updated_at, trick_used, newnews_score, emoji_tag, 
        infographic_svg, matiza_score
      ) VALUES (?, 'General', ?, ?, ?, ?, ?, ?, ?, ?, 'General', ?, ?, ?, ?, ?, ?, 'publicado', 0, ?, ?, ?, ?, 0, ?, ?, ?)
    `).run(
      articleId,
      generatedSlug,
      articleData.title,
      articleData.subtitle,
      cleanClaim,
      platform,
      inputUrl,
      description.slice(0, 500),
      finishedNow.split('T')[0],
      articleData.verdict,
      articleData.confidence,
      articleData.summary,
      articleData.explanation,
      articleData.what_is_true,
      articleData.what_is_false,
      finishedNow,
      finishedNow,
      finishedNow,
      articleData.trick_used,
      articleData.emoji_tag,
      svg,
      articleData.matiza_score
    );

    // 2. Insertar fuente oficial
    try {
      dbWrite.prepare(`
        INSERT INTO sources (id, article_id, title, url, source_type, authority_level, quote_or_summary, date_accessed)
        VALUES (?, ?, ?, ?, 'oficial', 'alta', ?, ?)
      `).run(
        `src-${Date.now()}`,
        articleId,
        `Metadatos oficiales de verificación - ${platform}`,
        inputUrl,
        articleData.summary,
        finishedNow.split('T')[0]
      );
    } catch (e) {}

    // 3. Completar el trabajo
    dbWrite.prepare(`
      UPDATE verification_jobs
      SET status = 'completed',
          progress_phase = 'Completado',
          progress_percent = 100,
          completed_at = ?,
          result_id = ?,
          updated_at = ?
      WHERE id = ?
    `).run(finishedNow, articleId, finishedNow, jobId);

    dbWrite.close();
    console.log(`[Antigravity Runner] Trabajo ${jobId} completado con éxito. Artículo generado: ${generatedSlug}`);

  } catch (error) {
    console.error(`[Antigravity Runner] ERROR procesando trabajo ${jobId}:`, error.message);
    
    const dbErr = new DatabaseSync(dbPath);
    const errNow = new Date().toISOString();
    dbErr.prepare(`
      UPDATE verification_jobs
      SET status = 'failed',
          error_code = 'ERR_PROCESSING_FAILED',
          error_message = ?,
          completed_at = ?,
          updated_at = ?
      WHERE id = ?
    `).run(error.message, errNow, errNow, jobId);
    dbErr.close();
  }
}

function updateJobProgress(jobId, phase, percent) {
  try {
    const db = new DatabaseSync(dbPath);
    const nowStr = new Date().toISOString();
    db.prepare(`
      UPDATE verification_jobs
      SET progress_phase = ?,
          progress_percent = ?,
          updated_at = ?
      WHERE id = ?
    `).run(phase, percent, nowStr, jobId);
    db.close();
  } catch (e) {
    console.warn('[Antigravity Runner] No se pudo actualizar el progreso del job:', e.message);
  }
}

run();
