/**
 * clean-and-rebuild.js
 * Elimina TODOS los artículos mockeados y fuentes de fact-checkers.
 * Conserva: topics, parties, policy_measures, promise_tracking, asset_declarations, radar_sources.
 * Los artículos se reconstruirán solo a partir del radar real.
 */
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const dbPath = process.env.SQLITE_DB_PATH || path.resolve('data/matiza.db');

if (!fs.existsSync(dbPath)) {
  console.error(`❌ La base de datos no existe en ${dbPath}.`);
  process.exit(1);
}

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON;');

console.log('[Clean] === LIMPIEZA TOTAL DE DATOS MOCKEADOS ===');
console.log('[Clean] Base de datos:', dbPath);

// 1. Contar antes
const beforeArticles = db.prepare('SELECT COUNT(*) as c FROM articles').get().c;
const beforeSources = db.prepare('SELECT COUNT(*) as c FROM sources').get().c;
const beforeScraped = db.prepare('SELECT COUNT(*) as c FROM scraped_items').get().c;
const beforeSocial = db.prepare('SELECT COUNT(*) as c FROM social_posts').get().c;
const beforeReviews = db.prepare('SELECT COUNT(*) as c FROM reviews').get().c;
const beforeAiLogs = db.prepare('SELECT COUNT(*) as c FROM ai_logs').get().c;

console.log(`[Clean] Estado ANTES:`);
console.log(`  - Artículos: ${beforeArticles}`);
console.log(`  - Fuentes: ${beforeSources}`);
console.log(`  - Scraped Items: ${beforeScraped}`);
console.log(`  - Social Posts: ${beforeSocial}`);
console.log(`  - Reviews: ${beforeReviews}`);
console.log(`  - AI Logs: ${beforeAiLogs}`);

// 2. Borrar artículos, fuentes, social posts, reviews, ai_logs (todo lo generado/mockeado)
// sources se borra en cascada al borrar articles gracias a ON DELETE CASCADE
db.exec('DELETE FROM reviews;');
db.exec('DELETE FROM social_posts;');
db.exec('DELETE FROM ai_logs;');
db.exec('DELETE FROM sources;');
db.exec('DELETE FROM articles;');
db.exec('DELETE FROM scraped_items;');

console.log('[Clean] ✅ Borrados: articles, sources, scraped_items, social_posts, reviews, ai_logs.');

// 3. Verificar conservación de datos legítimos
const topics = db.prepare('SELECT COUNT(*) as c FROM topics').get().c;
const parties = db.prepare('SELECT COUNT(*) as c FROM parties').get().c;
const measures = db.prepare('SELECT COUNT(*) as c FROM policy_measures').get().c;
const promises = db.prepare('SELECT COUNT(*) as c FROM promise_tracking').get().c;
const assets = db.prepare('SELECT COUNT(*) as c FROM asset_declarations').get().c;
const radarSources = db.prepare('SELECT COUNT(*) as c FROM radar_sources').get().c;

console.log(`[Clean] Estado DESPUÉS (datos conservados):`);
console.log(`  - Topics: ${topics}`);
console.log(`  - Partidos: ${parties}`);
console.log(`  - Medidas Electorales: ${measures}`);
console.log(`  - Seguimiento Promesas: ${promises}`);
console.log(`  - Bienes Declarados: ${assets}`);
console.log(`  - Fuentes del Radar: ${radarSources}`);

// 4. Crear tabla official_sources si no existe
db.exec(`
  CREATE TABLE IF NOT EXISTS official_sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    institution TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    is_primary INTEGER DEFAULT 1,
    status TEXT DEFAULT 'activo',
    created_at TEXT NOT NULL
  );
`);

// 5. Poblar catálogo de fuentes oficiales primarias verificadas
const countOfficialSources = db.prepare("SELECT COUNT(*) as c FROM official_sources").get().c;
if (countOfficialSources === 0) {
  console.log('[Clean] Insertando catálogo de fuentes oficiales primarias...');
  const insertOfficial = db.prepare(`
    INSERT OR IGNORE INTO official_sources (id, name, institution, url, category, description, is_primary, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, 'activo', datetime('now'))
  `);

  const officialSources = [
    // Legislación y Normativa
    { id: 'of-boe', name: 'Boletín Oficial del Estado', institution: 'BOE', url: 'https://www.boe.es', category: 'Legislación', description: 'Diario oficial donde se publican leyes, reales decretos, órdenes ministeriales y sentencias del TC.' },
    { id: 'of-congreso', name: 'Congreso de los Diputados', institution: 'Congreso', url: 'https://www.congreso.es', category: 'Legislación', description: 'Portal con iniciativas legislativas, proposiciones de ley, preguntas parlamentarias y diarios de sesiones.' },
    { id: 'of-senado', name: 'Senado de España', institution: 'Senado', url: 'https://www.senado.es', category: 'Legislación', description: 'Cámara alta: enmiendas, vetos legislativos y comisiones territoriales.' },

    // Estadísticas y Datos
    { id: 'of-ine', name: 'Instituto Nacional de Estadística', institution: 'INE', url: 'https://www.ine.es', category: 'Estadísticas', description: 'EPA, IPC, PIB, Contabilidad Nacional, datos demográficos y encuestas de hogares.' },
    { id: 'of-eurostat', name: 'Eurostat', institution: 'UE', url: 'https://ec.europa.eu/eurostat', category: 'Estadísticas', description: 'Estadísticas armonizadas de la Unión Europea para comparación internacional.' },
    { id: 'of-bde', name: 'Banco de España', institution: 'BdE', url: 'https://www.bde.es', category: 'Estadísticas', description: 'Deuda pública, balanza de pagos, tipos de interés, informe de estabilidad financiera.' },

    // Empleo y Seguridad Social
    { id: 'of-sepe', name: 'Servicio Público de Empleo Estatal', institution: 'SEPE', url: 'https://www.sepe.es', category: 'Empleo', description: 'Paro registrado mensual, prestaciones por desempleo, estadísticas de contratos.' },
    { id: 'of-seg-social', name: 'Seguridad Social', institution: 'TGSS', url: 'https://www.seg-social.es', category: 'Empleo', description: 'Afiliaciones, cotizaciones de autónomos, pensiones, cuotas por tramos de ingresos reales.' },
    { id: 'of-mites', name: 'Ministerio de Trabajo', institution: 'MITES', url: 'https://www.mites.gob.es', category: 'Empleo', description: 'Legislación laboral vigente, Estatuto de los Trabajadores, convenios colectivos.' },

    // Justicia y Fiscalía
    { id: 'of-poder-judicial', name: 'Consejo General del Poder Judicial', institution: 'CGPJ', url: 'https://www.poderjudicial.es', category: 'Justicia', description: 'Jurisprudencia, estadísticas judiciales, datos de litigiosidad, sentencias del TS.' },
    { id: 'of-fiscalia', name: 'Fiscalía General del Estado', institution: 'FGE', url: 'https://www.fiscal.es', category: 'Justicia', description: 'Memorias anuales, instrucciones, circulares y datos de criminalidad.' },
    { id: 'of-tc', name: 'Tribunal Constitucional', institution: 'TC', url: 'https://www.tribunalconstitucional.es', category: 'Justicia', description: 'Sentencias constitucionales, recursos de inconstitucionalidad, autos y providencias.' },

    // Hacienda y Fiscalidad
    { id: 'of-aeat', name: 'Agencia Tributaria', institution: 'AEAT', url: 'https://sede.agenciatributaria.gob.es', category: 'Fiscalidad', description: 'Tramos del IRPF, estadísticas tributarias, recaudación, normativa fiscal vigente.' },
    { id: 'of-airef', name: 'Autoridad Independiente de Responsabilidad Fiscal', institution: 'AIReF', url: 'https://www.airef.es', category: 'Fiscalidad', description: 'Evaluaciones de gasto público, opiniones sobre presupuestos, sostenibilidad de la deuda.' },

    // Interior y Seguridad
    { id: 'of-interior', name: 'Ministerio del Interior', institution: 'Interior', url: 'https://www.interior.gob.es', category: 'Seguridad', description: 'Anuario estadístico, balance de criminalidad, instrucciones policiales, datos de inmigración.' },
    { id: 'of-policia', name: 'Portal de Estadísticas de Criminalidad', institution: 'Policía/GC', url: 'https://estadisticasdecriminalidad.ses.mir.es', category: 'Seguridad', description: 'Datos desagregados de infracciones penales por tipo, comunidad y periodo.' },

    // Transparencia
    { id: 'of-transparencia', name: 'Portal de Transparencia', institution: 'Transparencia', url: 'https://transparencia.gob.es', category: 'Transparencia', description: 'Contratos públicos, subvenciones, retribuciones de altos cargos, presupuestos ejecutados.' },
    { id: 'of-congreso-bienes', name: 'Registro de Bienes y Actividades del Congreso', institution: 'Congreso', url: 'https://www.congreso.es/web/app/registro-bienes', category: 'Transparencia', description: 'Declaraciones patrimoniales de diputados y senadores.' },

    // Migración
    { id: 'of-inclusion', name: 'Ministerio de Inclusión y Seguridad Social', institution: 'Inclusión', url: 'https://www.inclusion.gob.es', category: 'Migración', description: 'Datos de extranjería, autorizaciones de residencia y trabajo, asilo.' },
    { id: 'of-observatorio-migraciones', name: 'Observatorio Permanente de la Inmigración', institution: 'OPI', url: 'https://extranjeros.inclusion.gob.es/es/ObservatorioPermanenteInmigracion/', category: 'Migración', description: 'Anuario de inmigración, informes estadísticos, flujos migratorios.' },
  ];

  for (const src of officialSources) {
    insertOfficial.run(src.id, src.name, src.institution, src.url, src.category, src.description);
  }
  console.log(`[Clean] ✅ Insertadas ${officialSources.length} fuentes oficiales primarias.`);
}

db.close();
console.log('[Clean] === LIMPIEZA COMPLETADA ===');
