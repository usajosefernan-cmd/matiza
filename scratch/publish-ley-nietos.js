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
    
    console.log(`[Publicador Nietos] Inyectando artículo en: ${dbPath}`);
    
    const articleId = `art-ley-nietos-${Date.now()}`;
    const slug = 'ley-nietos-censo-electoral-irregularidad-jec';
    const topicId = 't-politica';
    
    // Crear el tema si no existe
    db.prepare(`
      INSERT OR IGNORE INTO topics (id, slug, title, description, category, status, created_at, updated_at)
      VALUES ('t-politica', 'leyes-y-politica', 'Leyes y Política', 'Análisis de reformas de leyes, partidos, instituciones del Estado y procesos electorales.', 'Política', 'activo', datetime('now'), datetime('now'))
    `).run();

    const title = 'El debate sobre la Ley de Nietos y el censo electoral: ¿Hay irregularidades en el voto exterior?';
    const subtitle = 'Cuatro vocales de la Junta Electoral Central suscriben un voto discrepante criticando la ampliación de la nacionalidad, mientras la mayoría ratifica la validez del censo.';
    
    const claim = 'Vocales de la Junta Electoral Central denuncian un incremento irregular y pucherazo en el censo electoral por la Ley de Nietos.';
    const summary = 'El debate sobre el incremento del censo electoral debido a la Ley de Nietos no se fundamenta en un fraude demostrado, sino en una discrepancia técnico-jurídica: cuatro vocales de la JEC sostienen que la Instrucción de Justicia de 2022 amplía las nacionalidades más allá de la ley, mientras que la mayoría del organismo declara que no tiene competencia para anular concesiones de nacionalidad.';
    
    const explanation = `> **Explicado en sencillo:** Es verdad que cuatro vocales de la Junta Electoral Central (JEC) han firmado una queja advirtiendo de que el censo de votantes en el extranjero sube de forma "irregular". Pero no es un fraude electoral o "pucherazo" demostrado, sino un debate técnico sobre si el Ministerio de Justicia dio facilidades de más para obtener la nacionalidad española en 2022.

El debate en torno a la "Ley de Nietos" (la disposición adicional octava de la Ley de Memoria Democrática) y su impacto en el Censo Electoral de Residentes Ausentes (CERA) ha regresado al primer plano político debido a un voto particular en el seno del organismo electoral:

* **La queja de los cuatro vocales:** Cuatro miembros de la JEC (incluidos magistrados del Tribunal Supremo) firmaron un voto discrepante afirmando que el censo ha crecido de forma "irregular". Argumentan que la **Instrucción de Nacionalidad de octubre de 2022** dictada por el Ministerio de Justicia flexibilizó el acceso a la nacionalidad por encima de los límites fijados por la propia ley de memoria.
* **La resolución de la JEC:** La mayoría de la Junta Electoral desestimó la denuncia y ratificó la vigencia del censo CERA. Sostienen que la JEC carece de competencias para revisar o anular la concesión de nacionalidades otorgadas por los consulados, debiendo limitarse al ámbito estrictamente electoral. Cualquier impugnación sobre la validez del reglamento de nacionalidades corresponde a la jurisdicción contencioso-administrativa ordinaria.
* **¿Existe pucherazo o fraude?:** No se han presentado pruebas de manipulación electoral ni fraude sistemático en el censo. Las inscripciones son la consecuencia directa de ciudadanos descendientes de españoles que han obtenido la nacionalidad conforme a los cauces consulares vigentes de la instrucción de 2022.

Por tanto, el claim de un incremento irregular bajo sospecha de pucherazo **falta al contexto**: se trata de una discrepancia técnica sobre el alcance legal del reglamento de concesión de nacionalidades, no de un fraude de votos.`;

    const verdict = 'Falta contexto';
    const confidence = 'Alta';
    const whatIsTrue = 'Cuatro vocales de la JEC formularon un voto particular discrepante criticando la instrucción de nacionalidades de 2022.';
    const whatIsFalse = 'No hay ninguna prueba de fraude electoral, manipulación del censo CERA ni pucherazo sistemático en el procedimiento de inscripción.';
    const whatLacksContext = 'La polémica radica en una controversia jurídica sobre si el Ministerio de Justicia flexibilizó los supuestos de la Ley de Memoria Democrática mediante una instrucción ministerial de rango menor.';
    const whatIsNotProven = '';

    const trickUsed = 'cherry-picking';
    const emojiTag = '🧊 Falta contexto';
    const matizaScore = 55;

    const infographicSvg = `<svg viewBox='0 0 390 220' xmlns='http://www.w3.org/2000/svg' style='background:#070913; border-radius:8px; border:1px solid #1a1e36; font-family:\"Outfit\",\"Inter\",sans-serif;'><rect width='390' height='220' fill='#070913' /><text x='15' y='25' fill='#ffffff' font-size='11' font-weight='bold' letter-spacing='0.05em'>ANÁLISIS: LEY DE NIETOS Y CENSO ELECTORAL</text><text x='15' y='38' fill='#717a94' font-size='8.5'>Estructura del conflicto en la Junta Electoral Central (JEC)</text><g transform='translate(15, 55)'><rect x='0' y='0' width='170' height='90' rx='6' fill='rgba(255, 183, 3, 0.02)' stroke='#ffb703' stroke-width='1' /><text x='10' y='20' fill='#ffb703' font-size='9' font-weight='bold'>⚠️ VOTO PARTICULAR DISCREPANTE</text><text x='10' y='38' fill='#ffffff' font-size='10' font-weight='bold'>CRÍTICA A LA INSTRUCCIÓN</text><text x='10' y='55' fill='#a9b2c3' font-size='8'>Sostienen que la Instrucción</text><text x='10' y='67' fill='#a9b2c3' font-size='8'>de 2022 amplía la concesión</text><text x='10' y='79' fill='#a9b2c3' font-size='8'>de nacionalidad más de la ley.</text></g><g transform='translate(205, 55)'><rect x='0' y='0' width='170' height='90' rx='6' fill='rgba(0, 255, 196, 0.02)' stroke='#00ffc4' stroke-width='1' /><text x='10' y='20' fill='#00ffc4' font-size='9' font-weight='bold'>✓ RESOLUCIÓN JEC (Mayoría)</text><text x='10' y='38' fill='#ffffff' font-size='10' font-weight='bold'>SIN COMPETENCIA FISCAL</text><text x='10' y='55' fill='#a9b2c3' font-size='8'>La JEC no puede anular las</text><text x='10' y='67' fill='#a9b2c3' font-size='8'>concesiones de nacionalidad.</text><text x='10' y='79' fill='#a9b2c3' font-size='8'>El censo CERA sigue vigente.</text></g><line x1='15' y1='165' x2='375' y2='165' stroke='#1a1e36' stroke-width='1' /><rect x='15' y='175' width='4' height='30' fill='#ffb703' rx='2' /><text x='26' y='185' fill='#717a94' font-size='7.5' font-weight='bold'>SITUACIÓN REGISTRAL:</text><text x='26' y='195' fill='#a9b2c3' font-size='8'>No hay prueba de fraude; la discrepancia es legal-administrativa.</text></svg>`;

    // Insertar el artículo
    db.prepare(`
      INSERT INTO articles (
        id, topic_id, slug, title, subtitle, claim, origin_platform, origin_url, origin_summary, 
        category, verdict, confidence, summary, explanation, what_is_true, what_is_false, 
        what_lacks_context, what_is_not_proven, status, human_review_required, published_at, origin_date,
        multimedia_url, multimedia_type, trick_used, matiza_score, emoji_tag, infographic_svg, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'Prensa', 'https://okdiario.com', ?, 'Política y Censo', ?, ?, ?, ?, ?, ?, ?, ?, 'publicado', 0, datetime('now'), datetime('now'), 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=390&auto=format&fit=crop', 'image', ?, ?, ?, ?, datetime('now'), datetime('now'))
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
    const tags = ['Censo Electoral', 'Ley de Nietos', 'Junta Electoral', 'Nacionalidad', 'BOE'];
    const insertTag = db.prepare("INSERT OR IGNORE INTO tags (id, slug, name) VALUES (?, ?, ?)");
    const insertArticleTag = db.prepare("INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)");

    tags.forEach((t, idx) => {
      const tSlug = t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      const tId = `tag-niet-${Date.now()}-${idx}`;
      
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
        title: 'BOE - Ley 20/2022, de 19 de octubre, de Memoria Democrática',
        url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-17099',
        source_type: 'oficial',
        authority_level: 'Alta',
        quote_or_summary: 'Disposición adicional octava que regula los supuestos extraordinarios para la adquisición de la nacionalidad española por descendientes.'
      },
      {
        title: 'BOE - Instrucción de 25 de octubre de 2022 de la Dirección General de Seguridad Jurídica y Fe Pública',
        url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2022-17470',
        source_type: 'oficial',
        authority_level: 'Alta',
        quote_or_summary: 'Norma de desarrollo de la Ley de Memoria Democrática que detalla los criterios de tramitación de nacionalidad en los consulados.'
      },
      {
        title: 'Junta Electoral Central (JEC) - Resoluciones y Acuerdos de censo',
        url: 'https://www.juntaelectoralcentral.es',
        source_type: 'oficial',
        authority_level: 'Alta',
        quote_or_summary: 'Acuerdo de rechazo a la paralización cautelar del censo CERA y declaración de falta de competencia para revisar concesiones de nacionalidad.'
      }
    ];

    const insertSource = db.prepare(`
      INSERT OR REPLACE INTO sources (id, article_id, title, url, source_type, authority_level, quote_or_summary, date_accessed)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    sources.forEach((src, idx) => {
      insertSource.run(`src-niet-${Date.now()}-${idx}`, articleId, src.title, src.url, src.source_type, src.authority_level, src.quote_or_summary);
    });

    // Marcar como procesado el scraped_item original si existe
    db.prepare("UPDATE scraped_items SET status = 'procesado' WHERE text LIKE '%Nietos%' OR detected_claim LIKE '%Nietos%'").run();

    console.log(`✓ Noticia de Ley de Nietos publicada con éxito en: ${dbPath}`);
    db.close();
  } catch (err) {
    console.error(`Error al insertar en ${dbPath}:`, err.message);
  }
});
