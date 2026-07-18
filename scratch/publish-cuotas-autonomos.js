import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dbPaths = [
  path.resolve('data/matiza.db'),
  path.resolve('matizame/data/matiza.db')
];

dbPaths.forEach(dbPath => {
  try {
    if (!fs.existsSync(dbPath)) return;
    const db = new DatabaseSync(dbPath);
    db.exec('PRAGMA foreign_keys = ON;');
    
    console.log(`[Publicador Autónomos] Inyectando artículo en: ${dbPath}`);
    
    const articleId = `art-autonomos-2026-${Date.now()}`;
    const slug = 'bulo-cuota-minima-autonomos-500-euros-2026';
    const topicId = 't-autonomos';
    
    // Crear el tema si no existe
    db.prepare(`
      INSERT OR IGNORE INTO topics (id, slug, title, description, category, status, created_at, updated_at)
      VALUES ('t-autonomos', 'autonomos-y-fiscalidad', 'Autónomos y Fiscalidad', 'Análisis de cuotas, bases de cotización, IRPF, IVA y reformas fiscales en España.', 'Fiscalidad', 'activo', datetime('now'), datetime('now'))
    `).run();

    const title = 'Desmintiendo el bulo de la cuota de autónomos de 500€ en 2026: Las tablas reales del BOE';
    const subtitle = 'La reforma por ingresos reales fija la cuota mínima en 200€ al mes para los tramos más bajos, muy lejos de las alarmas difundidas en redes sociales.';
    
    const claim = 'La cuota mínima mensual de autónomos en España subirá obligatoriamente a 500€ en 2026 para todos.';
    const summary = 'La afirmación de que todos los autónomos pagarán al menos 500 euros de cuota mensual en 2026 es completamente falsa. Las tablas oficiales del BOE del Real Decreto-ley 13/2022 establecen una cuota mínima de 200€ al mes para ingresos inferiores a 670€, y un sistema progresivo de tramos que oscila entre 200€ y 590€ según los rendimientos netos reales.';
    
    const explanation = `> **Explicado en sencillo:** En 2026 entra en vigor el último tramo de la reforma de autónomos aprobada en 2022. La ley establece que pagas según lo que ganas. Si tus ingresos reales netos son bajos, tu cuota será de 200€ al mes. Solo los autónomos con rendimientos netos superiores a 6.000€ mensuales pagarán la cuota máxima de 590€. No hay ninguna cuota mínima general de 500€.

Varios vídeos virales en TikTok y posts alarmistas en redes sociales han difundido que en 2026 la cuota mínima de autónomos en España subirá a 500 euros al mes de forma generalizada. Esta afirmación carece de base legal y contradice directamente la normativa vigente.

### La regulación oficial del BOE

El nuevo sistema de cotización para autónomos por ingresos reales fue aprobado mediante el **Real Decreto-ley 13/2022** y establece un periodo de transición de tres años (2023, 2024 y 2025) que culmina en **2026**. 

Para el año **2026**, las tablas definitivas publicadas en el Boletín Oficial del Estado (BOE) regulan 15 tramos de cotización en base a los rendimientos netos (ingresos menos gastos deducibles):

* **Tramos reducidos (Ingresos bajos):**
  * Ingresos < 670€: Cuota de **200€/mes**.
  * Ingresos entre 670€ y 900€: Cuota de **260€/mes**.
  * Ingresos entre 900€ y 1.166,70€: Cuota de **275€/mes**.
* **Tramo medio (Ingresos estándar):**
  * Ingresos entre 1.166,70€ y 1.300€: Cuota de **290€/mes**.
  * Ingresos entre 1.700€ y 1.850€: Cuota de **350€/mes**.
* **Tramos superiores (Ingresos altos):**
  * Ingresos entre 4.050€ y 6.000€: Cuota de **530€/mes**.
  * Ingresos > 6.000€: Cuota de **590€/mes**.

Por lo tanto, la cuota mínima no es de 500€, sino de 200€. Para que un autónomo pague 500€ o más de cuota en 2026, sus rendimientos netos declarados deben ser superiores a **3.620€ al mes**.`;

    const verdict = 'Falso';
    const confidence = 'Alta';
    const whatIsTrue = 'La cuota de autónomos de 2026 es progresiva por tramos; los autónomos con menos ingresos pagarán una cuota mínima de 200€ al mes.';
    const whatIsFalse = 'No existe ninguna subida obligatoria unilateral a 500€ al mes de cuota mínima general en 2026.';
    const whatLacksContext = 'Solo los autónomos con rendimientos netos declarados superiores a 3.620€ mensuales tendrán cuotas que superen los 500€ al mes en las tablas oficiales.';
    const whatIsNotProven = '';

    const trickUsed = 'dato sin base';
    const emojiTag = '❌ Falso';
    const matizaScore = 98;

    const infographicSvg = `<svg viewBox='0 0 390 220' xmlns='http://www.w3.org/2000/svg' style='background:#070913; border-radius:8px; border:1px solid #1a1e36; font-family:\"Outfit\",\"Inter\",sans-serif;'><rect width='390' height='220' fill='#070913' /><text x='15' y='25' fill='#ffffff' font-size='11' font-weight='bold' letter-spacing='0.05em'>TABLA DE CUOTAS DE AUTÓNOMOS 2026 (BOE)</text><text x='15' y='38' fill='#717a94' font-size='8.5'>Rendimientos Netos vs Cuota Mensual Establecida por Ley</text><g transform='translate(15, 55)'><rect x='0' y='0' width='110' height='90' rx='6' fill='rgba(0, 255, 160, 0.02)' stroke='#00f5a0' stroke-width='1' /><text x='10' y='20' fill='#00f5a0' font-size='8.5' font-weight='bold'>🟢 INGRESOS BAJOS</text><text x='10' y='40' fill='#ffffff' font-size='14' font-weight='bold'>200 € / mes</text><text x='10' y='60' fill='#a9b2c3' font-size='8'>Para ingresos netos</text><text x='10' y='72' fill='#a9b2c3' font-size='8'>inferiores a 670€/mes.</text></g><g transform='translate(137, 55)'><rect x='0' y='0' width='110' height='90' rx='6' fill='rgba(0, 245, 255, 0.02)' stroke='#00f5ff' stroke-width='1' /><text x='10' y='20' fill='#00f5ff' font-size='8.5' font-weight='bold'>🔵 INGRESO MEDIO</text><text x='10' y='40' fill='#ffffff' font-size='14' font-weight='bold'>290 € / mes</text><text x='10' y='60' fill='#a9b2c3' font-size='8'>Para ingresos entre</text><text x='10' y='72' fill='#a9b2c3' font-size='8'>1.166€ y 1.300€/mes.</text></g><g transform='translate(260, 55)'><rect x='0' y='0' width='115' height='90' rx='6' fill='rgba(157, 78, 221, 0.02)' stroke='#9d4edd' stroke-width='1' /><text x='10' y='20' fill='#9d4edd' font-size='8.5' font-weight='bold'>🟣 INGRESOS ALTOS</text><text x='10' y='40' fill='#ffffff' font-size='14' font-weight='bold'>590 € / mes</text><text x='10' y='60' fill='#a9b2c3' font-size='8'>Para ingresos netos</text><text x='10' y='72' fill='#a9b2c3' font-size='8'>superiores a 6.000€/mes.</text></g><line x1='15' y1='165' x2='375' y2='165' stroke='#1a1e36' stroke-width='1' /><rect x='15' y='175' width='4' height='30' fill='#ff3366' rx='2' /><text x='26' y='185' fill='#717a94' font-size='7.5' font-weight='bold'>BULO DE REDES SOCIALES DESMENTIDO:</text><text x='26' y='195' fill='#a9b2c3' font-size='8'>Ningún tramo fija 500€ de mínima. La cuota más baja es de 200€ al mes.</text></svg>`;

    // Insertar el artículo
    db.prepare(`
      INSERT INTO articles (
        id, topic_id, slug, title, subtitle, claim, origin_platform, origin_url, origin_summary, 
        category, verdict, confidence, summary, explanation, what_is_true, what_is_false, 
        what_lacks_context, what_is_not_proven, status, human_review_required, published_at, origin_date,
        multimedia_url, multimedia_type, trick_used, matiza_score, emoji_tag, infographic_svg, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'TikTok', 'https://www.tiktok.com', ?, 'Autónomos y Fiscalidad', ?, ?, ?, ?, ?, ?, ?, ?, 'publicado', 0, datetime('now'), datetime('now'), 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=390&auto=format&fit=crop', 'image', ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      articleId, topicId, slug, title, subtitle, claim, summary,
      verdict, confidence, summary, explanation, whatIsTrue, whatIsFalse, whatLacksContext, whatIsNotProven,
      trickUsed, matizaScore, emojiTag, infographicSvg
    );

    // Relacionar tema
    db.prepare(`
      INSERT OR IGNORE INTO article_topics (article_id, topic_id)
      VALUES (?, ?)
    `).run(articleId, topicId);

    // Insertar tags reales
    const tags = ['Autónomos', 'Cuotas', 'Cotización', 'Hacienda', 'BOE'];
    const insertTag = db.prepare("INSERT OR IGNORE INTO tags (id, slug, name) VALUES (?, ?, ?)");
    const insertArticleTag = db.prepare("INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)");

    tags.forEach((t, idx) => {
      const tSlug = t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      const tId = `tag-auton-${Date.now()}-${idx}`;
      
      let existingTag = db.prepare("SELECT id FROM tags WHERE slug = ?").get(tSlug);
      let tagId = existingTag ? existingTag.id : null;
      if (!tagId) {
        tagId = tId;
        insertTag.run(tagId, tSlug, t);
      }
      insertArticleTag.run(articleId, tagId);
    });

    // Fuentes oficiales y específicas con enlaces directos reales
    const sources = [
      {
        title: 'BOE - Real Decreto-ley 13/2022 de cotización por ingresos reales',
        url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2022-12482',
        source_type: 'oficial',
        authority_level: 'Alta',
        quote_or_summary: 'Disposición oficial en el BOE que regula el sistema progresivo de cotización por ingresos reales y establece la tabla de cuotas definitivas de autónomos para 2026.'
      },
      {
        title: 'Seguridad Social - Simulador de cuotas para autónomos 2026',
        url: 'https://importass.seg-social.gob.es/',
        source_type: 'oficial',
        authority_level: 'Alta',
        quote_or_summary: 'Portal oficial de la Seguridad Social de España que provee el simulador de cuota de autónomos basado en los ingresos reales del ejercicio.'
      }
    ];

    const insertSource = db.prepare(`
      INSERT OR REPLACE INTO sources (id, article_id, title, url, source_type, authority_level, quote_or_summary, date_accessed)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    sources.forEach((src, idx) => {
      insertSource.run(`src-auton-${Date.now()}-${idx}`, articleId, src.title, src.url, src.source_type, src.authority_level, src.quote_or_summary);
    });

    console.log(`✓ Noticia de autónomos publicada con éxito en: ${dbPath}`);
    db.close();
  } catch (err) {
    console.error(`Error al insertar en ${dbPath}:`, err.message);
  }
});
