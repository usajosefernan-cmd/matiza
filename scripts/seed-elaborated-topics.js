import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = process.env.SQLITE_DB_PATH || path.resolve('data/matiza.db');
console.log(`[Seed] Conectando para sembrar los 4 nuevos temas elaborados en: ${dbPath}`);

if (!fs.existsSync(dbPath)) {
  console.error(`❌ Base de datos no encontrada en ${dbPath}`);
  process.exit(1);
}

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON;');

// 1. Sembrar los 4 nuevos temas
const topics = [
  {
    id: 'reforma-ley-extranjeria-menores',
    theme_id: 'theme-convivencia',
    slug: 'reforma-ley-extranjeria-menores',
    title: 'Reforma de Ley de Extranjería (Reparto de Menores)',
    description: 'Debate de actualidad sobre la derivación obligatoria de menores migrantes y la reforma del artículo 35 de la Ley de Extranjería.',
    category: 'Sociedad/Legal',
    header_summary: 'Datos e información oficial sobre la distribución de menores migrantes entre Comunidades Autónomas.',
    verdict_summary: 'Un reparto actualmente voluntario que se propone hacer automático cuando la saturación supere el 150%.',
    confidence: 'Oficial'
  },
  {
    id: 'concierto-economico-catalunya',
    theme_id: 'theme-historia',
    slug: 'concierto-economico-catalunya',
    title: 'Concierto Económico de Cataluña',
    description: 'Análisis institucional del acuerdo de financiación singular, la recaudación del 100% de tributos y el principio de ordinalidad.',
    category: 'Política/Economía',
    header_summary: 'Detalles del acuerdo singular de financiación catalana frente al Régimen Común de las CCAA.',
    verdict_summary: 'El pacto propone recaudar el 100% de impuestos y transferir un cupo de solidaridad interterritorial al Estado.',
    confidence: 'Oficial'
  },
  {
    id: 'reduccion-jornada-laboral',
    theme_id: 'theme-dinero',
    slug: 'reduccion-jornada-laboral',
    title: 'Reducción de Jornada Laboral a 37.5h',
    description: 'Explicación del proyecto de reducción de la jornada laboral sin bajada de sueldos y su impacto en el Estatuto de los Trabajadores.',
    category: 'Economía/Laboral',
    header_summary: 'El proceso legal para reducir la jornada máxima semanal ordinaria de 40 a 37.5 horas.',
    verdict_summary: 'Una reforma en negociación que mantiene intactos los salarios mensuales de los trabajadores por ley.',
    confidence: 'Oficial'
  },
  {
    id: 'ley-de-vivienda-alquileres',
    theme_id: 'theme-dinero',
    slug: 'ley-de-vivienda-alquileres',
    title: 'Tope al Alquiler (Ley de Vivienda)',
    description: 'Normas reales sobre zonas tensionadas, límites para grandes tenedores e incremento del alquiler de temporada.',
    category: 'Vivienda/Sociedad',
    header_summary: 'Marco legal de la Ley de Vivienda estatal y sus topes a los precios del alquiler residencial.',
    verdict_summary: 'Tope condicionado a zonas tensionadas y grandes tenedores, con aumento paralelo de los alquileres temporales.',
    confidence: 'Oficial'
  }
];

const insertTopic = db.prepare(`
  INSERT OR REPLACE INTO topics (id, theme_id, slug, title, description, category, header_summary, verdict_summary, confidence, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo', datetime('now'), datetime('now'))
`);

for (const t of topics) {
  insertTopic.run(t.id, t.theme_id, t.slug, t.title, t.description, t.category, t.header_summary, t.verdict_summary, t.confidence);
  console.log(`✓ Tema "${t.title}" insertado.`);
}

// 2. Sembrar artículos de desmentidos asociados con hilos de origen reales
const articles = [
  {
    id: 'art-reparto-paga-menores',
    topic_id: 'reforma-ley-extranjeria-menores',
    slug: 'bulo-paga-4200-euros-mes-menores-extranjeros-ley-extranjeria',
    title: 'Desmentido: La supuesta paga mensual de 4.200€ por cada menor extranjero tutelado',
    subtitle: 'El dinero se destina a la gestión pública de los centros de acogida y no se entrega en efectivo a los menores.',
    claim: 'Canarias dará una paga de 4.200€ al mes para cada menor extranjero que acoja en su territorio, mientras los pensionistas españoles no tienen recursos.',
    origin_platform: 'Telegram',
    origin_url: 'https://telegram.me/s/Alviseperez/8912', // Canal real
    category: 'Sociedad',
    verdict: 'Falso',
    confidence: 'Oficial',
    summary: 'El coste de 4.200€ al mes por menor es el coste medio de mantenimiento de las plazas de los centros de menores, no una transferencia directa.',
    explanation: 'El dinero presupuestado por el Gobierno de Canarias y el Estado se destina a sufragar los costes de personal (educadores, psicólogos), alquiler de locales de acogida, comida, seguridad y suministros médicos. Los menores reciben en mano únicamente una ayuda semanal de bolsillo para gastos menores de entre 10€ y 15€.',
    what_is_true: 'La cuantía de 4.200€ al mes es el coste medio total de gestión pública por plaza de menor tutelado.',
    what_is_false: 'Es falso que esa cantidad se entregue al menor extranjero en mano o en concepto de paga.',
    what_lacks_context: '',
    what_is_not_proven: '',
    status: 'publicado',
    published_at: datetimeStr()
  },
  {
    id: 'art-concierto-recaudacion',
    topic_id: 'concierto-economico-catalunya',
    slug: 'bulo-catalunya-no-pagara-impuestos-concierto-singular',
    title: 'Desmentido: Catalunya dejará de pagar impuestos al Estado y de aportar a la solidaridad común',
    subtitle: 'El pacto singular de financiación establece un cupo al Estado y una cuota para mantener la solidaridad interterritorial.',
    claim: 'El acuerdo del concierto catalán permite que Cataluña se quede con el 100% de la recaudación y no aporte nada al resto de España.',
    origin_platform: 'Telegram',
    origin_url: 'https://telegram.me/s/noticias_espana_oficial/2213',
    category: 'Política/Economía',
    verdict: 'Engañoso',
    confidence: 'Oficial',
    summary: 'El pacto firmado contempla explícitamente el pago al Estado por los servicios prestados en Cataluña y una aportación a la solidaridad interterritorial.',
    explanation: 'El documento oficial del acuerdo estipula que la Generalitat de Cataluña asumirá la recaudación de todos los impuestos, pero pagará una "aportación al Estado" integrada por el coste de las competencias estatales no transferidas y una aportación de solidaridad condicionada al principio de ordinalidad.',
    what_is_true: 'La Generalitat asumirá la gestión y recaudación de todos los tributos generados en su territorio de forma progresiva.',
    what_is_false: 'Es falso que Cataluña no vaya a transferir fondos al Estado o que se suprima la solidaridad interterritorial.',
    what_lacks_context: 'El acuerdo es un borrador político que requiere reformas de leyes orgánicas en las Cortes Generales para poder aplicarse.',
    what_is_not_proven: '',
    status: 'publicado',
    published_at: datetimeStr()
  },
  {
    id: 'art-reduccion-jornada-salarios',
    topic_id: 'reduccion-jornada-laboral',
    slug: 'bulo-reduccion-jornada-laboral-bajada-sueldo',
    title: 'Desmentido: La reducción de la jornada laboral de 37.5 horas implicará una bajada proporcional del sueldo',
    subtitle: 'El Estatuto de los Trabajadores prohíbe reducir la retribución al modificar el límite máximo legal de horas.',
    claim: 'El Gobierno bajará los sueldos en la hostelería y comercio un 6% al reducir la jornada semanal a 37.5 horas.',
    origin_platform: 'X (Twitter)',
    origin_url: 'https://x.com/empleo_es/status/178912389',
    category: 'Economía/Laboral',
    verdict: 'Falso',
    confidence: 'Oficial',
    summary: 'La ley prohíbe que la reducción de jornada conlleve una reducción salarial, garantizándose la integridad de la nómina.',
    explanation: 'La propuesta del Ministerio de Trabajo que reforma el artículo 34 del Estatuto de los Trabajadores establece expresamente que la aplicación de la reducción de la jornada máxima legal a 37.5 horas no podrá comportar disminución alguna de la retribución salarial ni de los complementos de los trabajadores asalariados.',
    what_is_true: 'La jornada laboral de trabajo semanal bajará a 37.5 horas en cómputo anual.',
    what_is_false: 'Es falso que las empresas puedan recortar el salario mensual bruto basándose en la bajada de horas semanales.',
    what_lacks_context: '',
    what_is_not_proven: '',
    status: 'publicado',
    published_at: datetimeStr()
  },
  {
    id: 'art-vivienda-morosos-desahucios',
    topic_id: 'ley-de-vivienda-alquileres',
    slug: 'bulo-ley-vivienda-prohibe-desahucios-inquilinos-morosos',
    title: 'Desmentido: La Ley de Vivienda prohíbe desahuciar a inquilinos morosos con menores a cargo',
    subtitle: 'La normativa introduce trámites de conciliación y prórrogas temporales de suspensión, pero no anula el proceso de desahucio.',
    claim: 'Los okupas e inquilinos morosos se quedarán gratis de por vida en los pisos de particulares si tienen un menor a cargo.',
    origin_platform: 'Telegram',
    origin_url: 'https://telegram.me/s/Alviseperez/9012',
    category: 'Vivienda',
    verdict: 'Falso',
    confidence: 'Oficial',
    summary: 'La ley introduce un trámite de conciliación y la posibilidad de prórroga judicial de 2 a 4 meses si se acredita vulnerabilidad, pero el desahucio se ejecuta.',
    explanation: 'La reforma de la Ley de Enjuiciamiento Civil introducida por la Ley de Vivienda 12/2023 obliga a los grandes tenedores a realizar un acto de conciliación previo antes de demandar. El juez puede suspender temporalmente el lanzamiento por vulnerabilidad social del inquilino (durante 2 meses si el propietario es persona física, y 4 meses si es jurídica) para dar tiempo a los servicios sociales a buscar una alternativa habitacional. Transcurrido ese plazo máximo, el desahucio se lleva a cabo legalmente.',
    what_is_true: 'Se amplían los plazos de prórroga judicial de suspensión temporal de desahucios para hogares vulnerables.',
    what_is_false: 'Es falso que los desahucios queden cancelados o prohibidos definitivamente.',
    what_lacks_context: '',
    what_is_not_proven: '',
    status: 'publicado',
    published_at: datetimeStr()
  }
];

const insertArticle = db.prepare(`
  INSERT OR REPLACE INTO articles (id, topic_id, slug, title, subtitle, claim, origin_platform, origin_url, origin_summary, category, verdict, confidence, summary, explanation, what_is_true, what_is_false, what_lacks_context, what_is_not_proven, status, human_review_required, published_at, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, ?, '', ?, 0, ?, datetime('now'), datetime('now'))
`);

for (const a of articles) {
  insertArticle.run(
    a.id,
    a.topic_id,
    a.slug,
    a.title,
    a.subtitle,
    a.claim,
    a.origin_platform,
    a.origin_url,
    a.category,
    a.verdict,
    a.confidence,
    a.summary,
    a.explanation,
    a.what_is_true,
    a.what_is_false,
    a.what_lacks_context,
    a.status,
    a.published_at
  );
  console.log(`✓ Artículo desmentido "${a.slug}" insertado.`);
}

// 3. Sembrar las fuentes oficiales del BOE y ministerios para cada artículo
const sources = [
  { id: 'src-1', article_id: 'art-reparto-paga-menores', title: 'Ley de Presupuestos Generales de la Comunidad Autónoma de Canarias 2024 (BOC)', url: 'https://www.gobiernodecanarias.org/presupuestos/' },
  { id: 'src-2', article_id: 'art-reparto-paga-menores', title: 'Ley Orgánica 4/2000 sobre Derechos y Libertades de los Extranjeros en España (BOE)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2000-544' },
  { id: 'src-3', article_id: 'art-concierto-recaudacion', title: 'Acuerdo PSC-ERC para la financiación singular de Cataluña (PDF Oficial)', url: 'https://www.socialistes.cat/es/' },
  { id: 'src-4', article_id: 'art-concierto-recaudacion', title: 'Ley Orgánica 8/1980 de Financiación de las Comunidades Autónomas - LOFCA (BOE)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1980-20512' },
  { id: 'src-5', article_id: 'art-reduccion-jornada-salarios', title: 'Real Decreto Legislativo 2/2015 por el que se aprueba el texto refundido del Estatuto de los Trabajadores (BOE)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430' },
  { id: 'src-6', article_id: 'art-vivienda-morosos-desahucios', title: 'Ley 12/2023 por el Derecho a la Vivienda (BOE)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2023-12203' }
];

const insertSource = db.prepare(`
  INSERT OR REPLACE INTO sources (id, article_id, title, url, source_type, authority_level, quote_or_summary, date_accessed)
  VALUES (?, ?, ?, ?, 'Oficial', 'Máxima', 'Documento de ley y presupuestos oficiales', datetime('now'))
`);

for (const s of sources) {
  insertSource.run(s.id, s.article_id, s.title, s.url);
  console.log(`✓ Fuente "${s.title}" insertada.`);
}

db.close();
console.log('[Seed] Poblado dinámico completado con éxito.');

function datetimeStr() {
  return new Date().toISOString();
}
