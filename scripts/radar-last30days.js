import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

const dbPath = process.env.SQLITE_DB_PATH || path.resolve('data/matiza.db');

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║ 📡 MATIZA: RADAR OPEN-SOURCE (LAST30DAYS) 📡       ║');
console.log('╚══════════════════════════════════════════════════════╝');

// Palabras clave de actualidad para buscar en redes sociales
const interestingKeywords = [
  'impuestos España', 'ley okupa España', 'caso koldo mascarillas',
  'pensiones sostenibilidad España', 'migrantes frontera canarias',
  'inflación cesta compra España', 'fijos discontinuos desempleo'
];

// Mapeo de términos a temas del portal
function getSuggestedTopic(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('okupa') || t.includes('vivienda') || t.includes('alquiler')) return 'Vivienda y Okupación';
  if (t.includes('koldo') || t.includes('ábalos') || t.includes('mascarilla') || t.includes('corrupción')) return 'Caso Koldo y Contratos';
  if (t.includes('migra') || /\bmena\w*\b/i.test(t) || t.includes('frontera') || t.includes('extranjer')) return 'Inmigración y Fronteras';
  if (t.includes('impues') || t.includes('hacienda') || t.includes('fiscal') || t.includes('ahorro')) return 'Impuestos y Cuotas';
  if (/\bparo\b/i.test(t) || t.includes('empleo') || t.includes('trabaj') || t.includes('fijo')) return 'Desempleo y Fijos Discontinuos';
  if (t.includes('precio') || t.includes('inflac') || t.includes('cesta') || t.includes('súper')) return 'Precios e Inflación';
  if (t.includes('pension') || t.includes('jubila') || t.includes('seguridad social')) return 'Pensiones y Jubilación';
  return 'General';
}

// Determinar el score de riesgo del tema
function getRiskScore(topic) {
  if (topic === 'Inmigración y Fronteras' || topic === 'Caso Koldo y Contratos') return 8.5;
  if (topic === 'Vivienda y Okupación' || topic === 'Impuestos y Cuotas') return 7.5;
  return 6.0;
}



async function runRadar() {
  if (!fs.existsSync(dbPath)) {
    console.error(`❌ La base de datos no existe en ${dbPath}. Ejecuta 'npm run db:migrate' primero.`);
    process.exit(1);
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  // Cargar temas/verticales de la DB para generar queries dinámicas
  const dbTopics = db.prepare("SELECT title FROM topics WHERE status = 'activo'").all();
  
  // Función para obtener palabras clave atómicas significativas de un título de tema
  const getAtomicQueries = (title) => {
    const cleaned = title.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // quitar acentos
      .replace(/[^a-z0-9\s]+/g, ' ');
    
    const words = cleaned.split(/\s+/).filter(w => w.length > 2);
    
    // Lista de palabras de parada (stop words) en español y términos genéricos
    const stopWords = new Set([
      'del', 'las', 'los', 'con', 'para', 'por', 'sobre', 'una', 'uno', 'unos', 'unas',
      'mitos', 'leyendas', 'situacion', 'actual', 'percepcion', 'analisis', 'caso'
    ]);
    
    const keywords = words.filter(w => !stopWords.has(w));
    
    // Generar combinaciones atómicas
    if (keywords.length >= 2) {
      return [
        `${keywords[0]} ${keywords[1]} bulo`,
        `${keywords[0]} ${keywords[1]} España`
      ];
    } else if (keywords.length === 1) {
      return [
        `${keywords[0]} España bulo`,
        `${keywords[0]} bulo`
      ];
    }
    
    // Fallback genérico con el primer sustantivo
    return words.length > 0 ? [`${words[0]} bulo`] : [];
  };

  // Generar queries dinámicas
  let searchQueries = dbTopics.flatMap(t => getAtomicQueries(t.title));
  
  // Si no hay verticales cargados, usar las keywords de fallback
  if (searchQueries.length === 0) {
    searchQueries = [
      'impuestos España bulo', 'ley okupa España alarma', 'caso koldo mascarillas',
      'pensiones sostenibilidad España', 'migrantes frontera canarias',
      'inflación cesta compra España', 'fijos discontinuos desempleo'
    ];
  }
  // Limitar para optimizar el run del cron y no saturar la API
  const uniqueQueries = [...new Set(searchQueries)].slice(0, 12);

  const insertScrapedItem = db.prepare(`
    INSERT OR IGNORE INTO scraped_items (id, platform, url, text, author_public_name, metrics_json, detected_claim, suggested_topic, virality_score, risk_score, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', datetime('now'))
  `);

  let itemsToInsert = [];
  
  // Determinar si estamos en Windows para activar el radar Node real (evitar bug SSL de Python)
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    console.log('[Radar Motor] Detectado entorno Windows. Ejecutando radar de red Node real (radar-cron.js)...');
    try {
      execSync('node scripts/radar-cron.js', { stdio: 'inherit', env: process.env });
    } catch (e) {
      console.error('❌ Error ejecutando radar-cron.js:', e.message);
    }
    db.close();
    return;
  } else {
    // Entorno VPS (Linux) - Ejecución real del Scraper
    console.log('[Radar Motor] Detectado entorno VPS Linux. Ejecutando motor de scraping real con last30days...');
    
    // Crear directorio temporal para guardar los JSONs de salida
    const tempDir = path.resolve('data/last30days_temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const scriptPath = '/home/ubuntu/workspace/scrapers/last30days/last30days.py';
    
    for (const keyword of uniqueQueries) {
      try {
        console.log(`\n[*] Buscando en redes sobre: "${keyword}"...`);
        // Ejecutar last30days.py vía python3 con el set completo de fuentes
        const command = `python3 "${scriptPath}" "${keyword}" --search=reddit,youtube,polymarket,web,instagram,tiktok --emit=json --save-dir="${tempDir}" --lookback-days=1`;
        console.log(`$ ${command}`);
        
        execSync(command, { stdio: 'inherit' });

        // Leer el archivo generado. El CLI genera un archivo basado en el slug del tema
        const slug = keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'last30days';
        const jsonPath = path.join(tempDir, `${slug}-raw.json`);

        if (fs.existsSync(jsonPath)) {
          const content = fs.readFileSync(jsonPath, 'utf-8');
          const data = JSON.parse(content);
          
          // Extraer candidatos del JSON
          const candidates = data.ranked_candidates || [];
          console.log(`[Radar Motor] Encontrados ${candidates.length} candidatos en redes para "${keyword}".`);

          for (const cand of candidates) {
            // Mapear el origen y los datos de last30days a scraped_items
            const platform = cand.source || 'Web';
            const link = cand.url || cand.link || '';
            if (!link) continue;

            const title = cand.title || 'Post de redes';
            const description = cand.summary || cand.snippet || cand.description || '';
            const author = cand.author || 'Usuario anónimo';
            const score = cand.score || 0;
            const comments = cand.comments_count || 0;

            itemsToInsert.push({
              platform,
              link,
              title,
              description,
              author,
              score,
              comments
            });
          }
        }
      } catch (err) {
        console.error(`❌ Error ejecutando scraping de last30days para "${keyword}":`, err.message);
      }
    }

    // Limpiar directorio temporal
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (_) {}
  }

  // Insertar los elementos en la base de datos
  let insertedCount = 0;
  for (const item of itemsToInsert) {
    const id = `radar-scraped-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const suggestedTopic = getSuggestedTopic(item.title + ' ' + item.description);
    const riskScore = getRiskScore(suggestedTopic);
    
    // Calcular virality_score (1.0 a 10.0) en base a métricas de la plataforma
    let viralityScore = 2.0; // Bajo impacto por defecto
    
    if (item.platform === 'Reddit') {
      viralityScore = Math.min(10.0, 3.0 + (item.score / 60));
    } else if (item.platform === 'YouTube') {
      const views = item.score || 0; // YouTube suele reportar vistas como score
      viralityScore = Math.min(10.0, 4.0 + (views / 20000));
    } else if (item.platform === 'X') {
      viralityScore = Math.min(10.0, 5.0 + (item.score / 200));
    } else if (item.platform === 'Polymarket') {
      viralityScore = 8.0; // Predicciones de dinero suelen ser virales/alta importancia
    }

    try {
      insertScrapedItem.run(
        id,
        item.platform,
        item.link,
        `${item.title}\n\n${item.description}`,
        item.author,
        JSON.stringify({ score: item.score, comments: item.comments }),
        item.title,
        suggestedTopic,
        viralityScore,
        riskScore
      );
      insertedCount++;
    } catch (dbErr) {
      // Duplicado ignorado (ya que URL es UNIQUE)
    }
  }

  console.log(`\n[Radar Motor] Escaneo completado. Se han insertado ${insertedCount} debates/bucos reales en scraped_items.`);
  db.close();
}

runRadar().catch(err => {
  console.error('[Radar Motor] Error general en el radar:', err);
});
