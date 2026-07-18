import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.resolve('data/matiza.db');

async function run() {
  console.log('[Antigravity Radar] Iniciando escaneo de tendencias y redes sociales...');
  
  try {
    // 1. Escanear feed RSS público de noticias de España para recopilar candidatos fácticos reales
    const rssUrl = 'https://www.rtve.es/api/noticias/rss/general.xml';
    console.log(`[Antigravity Radar] Consultando feed RSS: ${rssUrl}`);
    
    let items = [];
    try {
      const res = await fetch(rssUrl);
      const xml = await res.text();
      
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(xml)) !== null) {
        const content = match[1];
        const title = content.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] || content.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
        const desc = content.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] || content.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '';
        const link = content.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
        if (title.trim()) {
          items.push({ 
            title: title.trim().replace(/&quot;/g, '"').replace(/&amp;/g, '&'), 
            summary: desc.trim().replace(/&quot;/g, '"').replace(/&amp;/g, '&'), 
            link: link.trim() 
          });
        }
      }
      console.log(`[Antigravity Radar] Obtenidas ${items.length} noticias recientes del RSS.`);
    } catch (e) {
      console.warn(`[Antigravity Radar] No se pudo obtener el feed RSS (Modo Offline o Fallo Red): ${e.message}`);
    }

    const db = new DatabaseSync(dbPath);
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA journal_mode = WAL;');

    // Guardar candidatos nuevos en la tabla topic_candidates
    if (items.length > 0) {
      const insertCandidate = db.prepare(`
        INSERT OR IGNORE INTO topic_candidates (id, title, summary, source_url, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'pendiente', datetime('now'), datetime('now'))
      `);
      for (const item of items.slice(0, 10)) {
        const hash = Buffer.from(item.title).toString('hex').slice(0, 12);
        const id = `cand-rss-${hash}`;
        insertCandidate.run(id, item.title, item.summary, item.link);
      }
    }

    // 2. Buscar candidatos pendientes en la tabla topic_candidates
    const candidates = db.prepare(`
      SELECT * FROM topic_candidates
      WHERE status = 'pendiente'
      ORDER BY created_at DESC
      LIMIT 3
    `).all();

    if (!candidates.length) {
      console.log('[Antigravity Radar] No hay nuevos candidatos pendientes en topic_candidates para verificar.');
      db.close();
      return;
    }

    console.log(`[Antigravity Radar] Encolando ${candidates.length} candidatos del radar en verification_jobs...`);

    const insertJob = db.prepare(`
      INSERT INTO verification_jobs (id, job_type, input_url, input_text, priority, status, created_at, updated_at)
      VALUES (?, 'social_radar_candidate', ?, ?, 'normal', 'queued', datetime('now'), datetime('now'))
    `);

    const updateCandidate = db.prepare(`
      UPDATE topic_candidates
      SET status = 'procesado', updated_at = datetime('now')
      WHERE id = ?
    `);

    for (const cand of candidates) {
      const jobId = `job-radar-${cand.id.slice(-6)}-${Date.now().toString().slice(-4)}`;
      const textToVerify = `¿Es real o un bulo lo siguiente?: ${cand.title}. Contexto de debate social: ${cand.summary}`;

      insertJob.run(jobId, cand.source_url || '', textToVerify);
      updateCandidate.run(cand.id);
      
      console.log(`  -> Encolado candidato ${cand.id} en job ${jobId}`);
    }

    db.close();
    console.log('[Antigravity Radar] Finalizado el encolamiento de candidatos del radar.');

  } catch (err) {
    console.error('[Antigravity Radar] ERROR en el radar programado:', err.message);
  }
}

run();
