import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const dbPath = process.env.SQLITE_DB_PATH || path.resolve('data/matiza.db');
console.log(`[Migration] Conectando y creando base de datos SQLite en: ${dbPath}`);

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);

// Habilitar claves foráneas
db.exec('PRAGMA foreign_keys = ON;');

// Tabla themes (NUEVA: Categorías temáticas de primer nivel)
db.exec(`
  CREATE TABLE IF NOT EXISTS themes (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    orden INTEGER DEFAULT 0
  );
`);

// Tabla topics (Cabeceras de Temas / Expedientes)
db.exec(`
  CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    theme_id TEXT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    header_summary TEXT,
    verdict_summary TEXT,
    confidence TEXT,
    status TEXT DEFAULT 'activo',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(theme_id) REFERENCES themes(id) ON DELETE SET NULL
  );
`);

// Tabla articles (Noticias / Desmentidos de Claims)
db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    topic_id TEXT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    claim TEXT,
    origin_platform TEXT,
    origin_url TEXT,
    origin_summary TEXT,
    category TEXT NOT NULL,
    verdict TEXT NOT NULL,
    confidence TEXT,
    summary TEXT,
    explanation TEXT,
    what_is_true TEXT,
    what_is_false TEXT,
    what_lacks_context TEXT,
    what_is_not_proven TEXT,
    status TEXT DEFAULT 'borrador',
    human_review_required INTEGER DEFAULT 1,
    published_at TEXT,
    origin_date TEXT,
    multimedia_url TEXT,
    multimedia_type TEXT,
    trick_used TEXT,
    matiza_score INTEGER DEFAULT 0,
    emoji_tag TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(topic_id) REFERENCES topics(id) ON DELETE SET NULL
  );
`);

try {
  db.exec("ALTER TABLE articles ADD COLUMN origin_date TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE articles ADD COLUMN multimedia_url TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE articles ADD COLUMN multimedia_type TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE articles ADD COLUMN trick_used TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE articles ADD COLUMN matiza_score INTEGER DEFAULT 0;");
} catch (e) {}
try {
  db.exec("ALTER TABLE articles ADD COLUMN emoji_tag TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE articles ADD COLUMN infographic_svg TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE articles ADD COLUMN infographic_parts TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE articles ADD COLUMN related_ids TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE topics ADD COLUMN theme_id TEXT;");
} catch (e) {}

// Tabla sources (Fuentes originales de los desmentidos)
db.exec(`
  CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    article_id TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    source_type TEXT,
    authority_level TEXT,
    quote_or_summary TEXT,
    date_accessed TEXT,
    FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE
  );
`);

// Tabla scraped_items (Radar de items sospechosos)
db.exec(`
  CREATE TABLE IF NOT EXISTS scraped_items (
    id TEXT PRIMARY KEY,
    platform TEXT,
    url TEXT,
    text TEXT,
    author_public_name TEXT,
    metrics_json TEXT,
    detected_claim TEXT,
    suggested_topic TEXT,
    virality_score REAL DEFAULT 0.0,
    risk_score REAL DEFAULT 0.0,
    status TEXT DEFAULT 'pendiente',
    origin_date TEXT,
    created_at TEXT NOT NULL
  );
`);

try {
  db.exec("ALTER TABLE scraped_items ADD COLUMN origin_date TEXT;");
} catch (e) {
  // Columna ya existe
}

// Tabla social_posts (Formateado para RRSS)
db.exec(`
  CREATE TABLE IF NOT EXISTS social_posts (
    id TEXT PRIMARY KEY,
    article_id TEXT,
    platform TEXT NOT NULL,
    format TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'borrador',
    scheduled_at TEXT,
    published_at TEXT,
    external_id TEXT,
    FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE SET NULL
  );
`);

// Tabla reviews (Historial de aprobaciones de editores)
db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    article_id TEXT NOT NULL,
    reviewer TEXT NOT NULL,
    checklist_json TEXT,
    status TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE
  );
`);

// Tabla pipeline_runs (Historial de ejecuciones y telemetría de Hermes)
db.exec(`
  CREATE TABLE IF NOT EXISTS pipeline_runs (
    id TEXT PRIMARY KEY,
    started_at TEXT NOT NULL,
    duration_sec REAL NOT NULL,
    claims_scraped INTEGER NOT NULL,
    claims_processed INTEGER NOT NULL,
    articles_published INTEGER NOT NULL,
    telemetry_json TEXT NOT NULL
  );
`);

// Tabla parties (Partidos Políticos)
db.exec(`
  CREATE TABLE IF NOT EXISTS parties (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    ideology_summary TEXT,
    official_website TEXT,
    logo_url TEXT,
    current_leader TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

// Tabla electoral_programs (Programas electorales de partidos)
db.exec(`
  CREATE TABLE IF NOT EXISTS electoral_programs (
    id TEXT PRIMARY KEY,
    party_id TEXT NOT NULL,
    election_name TEXT NOT NULL,
    election_date TEXT NOT NULL,
    program_url TEXT,
    source_file_path TEXT,
    status TEXT DEFAULT 'activo',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(party_id) REFERENCES parties(id) ON DELETE CASCADE
  );
`);

// Tabla policy_measures (Medidas desglosadas por áreas de programas)
db.exec(`
  CREATE TABLE IF NOT EXISTS policy_measures (
    id TEXT PRIMARY KEY,
    program_id TEXT NOT NULL,
    party_id TEXT NOT NULL,
    area TEXT NOT NULL,
    title TEXT NOT NULL,
    original_text TEXT,
    plain_language_summary TEXT NOT NULL,
    possible_impact TEXT,
    target_groups TEXT,
    source_page INTEGER,
    confidence TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(program_id) REFERENCES electoral_programs(id) ON DELETE CASCADE,
    FOREIGN KEY(party_id) REFERENCES parties(id) ON DELETE CASCADE
  );
`);

// Tabla promise_tracking (Seguimiento de promesas)
db.exec(`
  CREATE TABLE IF NOT EXISTS promise_tracking (
    id TEXT PRIMARY KEY,
    party_id TEXT NOT NULL,
    measure_id TEXT,
    promise_text TEXT NOT NULL,
    government_level TEXT,
    was_in_government INTEGER DEFAULT 0,
    action_taken TEXT,
    evidence_url TEXT,
    evidence_summary TEXT,
    status TEXT DEFAULT 'prometido',
    notes TEXT,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(party_id) REFERENCES parties(id) ON DELETE CASCADE,
    FOREIGN KEY(measure_id) REFERENCES policy_measures(id) ON DELETE SET NULL
  );
`);

// Tabla asset_declarations (Bienes declarados)
db.exec(`
  CREATE TABLE IF NOT EXISTS asset_declarations (
    id TEXT PRIMARY KEY,
    party_id TEXT NOT NULL,
    person_name TEXT NOT NULL,
    role TEXT NOT NULL,
    source_url TEXT,
    declared_assets_summary TEXT,
    declared_debts_summary TEXT,
    date_declared TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(party_id) REFERENCES parties(id) ON DELETE CASCADE
  );
`);

// Tabla ai_logs (Historial de tokens y costes de LLMs)
db.exec(`
  CREATE TABLE IF NOT EXISTS ai_logs (
    id TEXT PRIMARY KEY,
    task TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    tokens INTEGER DEFAULT 0,
    cost_estimate REAL DEFAULT 0.0,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

// Tabla radar_sources (Fuentes dinámicas de monitorización para el radar)
db.exec(`
  CREATE TABLE IF NOT EXISTS radar_sources (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL,
    name TEXT NOT NULL,
    url_or_id TEXT NOT NULL,
    status TEXT DEFAULT 'activo',
    created_at TEXT NOT NULL
  );
`);

// Tabla verification_logs (Registro completo de búsquedas manuales de usuarios e IA)
db.exec(`
  CREATE TABLE IF NOT EXISTS verification_logs (
    id TEXT PRIMARY KEY,
    query_text TEXT NOT NULL,
    ip_address TEXT,
    status TEXT NOT NULL,
    verdict TEXT,
    scraped_metadata_json TEXT,
    execution_log TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

// Tabla user_submissions (Envios y triage de usuarios en /radar)
db.exec(`
  CREATE TABLE IF NOT EXISTS user_submissions (
    id TEXT PRIMARY KEY,
    submitted_url TEXT,
    submitted_text TEXT,
    detected_claim TEXT,
    suggested_topic_id TEXT,
    virality_status TEXT,
    relevance_score REAL DEFAULT 0.0,
    status TEXT DEFAULT 'recibido',
    reason TEXT,
    created_at TEXT NOT NULL
  );
`);

// Tabla topic_cache (Cache semantica de temas y fuentes)
db.exec(`
  CREATE TABLE IF NOT EXISTS topic_cache (
    topic_id TEXT PRIMARY KEY,
    canonical_summary TEXT,
    trusted_sources_json TEXT,
    recurring_confusions_json TEXT,
    known_claims_json TEXT,
    source_strategy_json TEXT,
    last_updated TEXT NOT NULL
  );
`);

// Tabla claim_cache (Historico de desmentidos para reutilizacion directa)
db.exec(`
  CREATE TABLE IF NOT EXISTS claim_cache (
    normalized_claim_hash TEXT PRIMARY KEY,
    similar_claims_json TEXT,
    previous_verdict TEXT,
    previous_sources_json TEXT,
    previous_article_id TEXT,
    reuse_allowed INTEGER DEFAULT 1,
    last_seen TEXT NOT NULL
  );
`);

// Tabla source_strategy_cache (Estrategias de fuentes por area semantica)
db.exec(`
  CREATE TABLE IF NOT EXISTS source_strategy_cache (
    semantic_area TEXT PRIMARY KEY,
    source_types_json TEXT,
    preferred_sources_json TEXT,
    validation_rules_json TEXT,
    last_successful_use TEXT NOT NULL
  );
`);

// Tabla article_topics (Relación muchos-a-múltiples temas/expedientes)
db.exec(`
  CREATE TABLE IF NOT EXISTS article_topics (
    article_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    PRIMARY KEY (article_id, topic_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
  );
`);

// Tabla tags (NUEVA: Etiquetas dinámicas transversales)
db.exec(`
  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
  );
`);

// Tabla article_tags (NUEVA: Relación N:M artículo <-> tag)
db.exec(`
  CREATE TABLE IF NOT EXISTS article_tags (
    article_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );
`);

// Sembrar los 6 temas principales (Categorías de primer nivel)
console.log('[Migration] Sembrando temas principales...');
const insertTheme = db.prepare(`
  INSERT OR IGNORE INTO themes (id, slug, name, orden)
  VALUES (?, ?, ?, ?)
`);

const initialThemes = [
  { id: 'theme-dinero', slug: 'tu-dinero-y-hacienda', name: 'Tu Dinero y Hacienda', orden: 1 },
  { id: 'theme-convivencia', slug: 'convivencia-y-servicios', name: 'Convivencia y Servicios', orden: 2 },
  { id: 'theme-salud', slug: 'salud-publica', name: 'Salud Pública', orden: 3 },
  { id: 'theme-historia', slug: 'historia-y-territorio', name: 'Historia y Territorio', orden: 4 },
  { id: 'theme-justicia', slug: 'justicia-y-corrupcion', name: 'Justicia y Corrupción', orden: 5 },
  { id: 'theme-desinformacion', slug: 'desinformacion-y-bulos', name: 'Desinformación y Bulos', orden: 6 }
];

for (const th of initialThemes) {
  insertTheme.run(th.id, th.slug, th.name, th.orden);
}

// Sembrar fuentes del radar iniciales si no hay ninguna o añadir las que falten
console.log('[Migration] Sembrando y actualizando fuentes del radar (RSS, Reddit, Telegram)...');
const insertSource = db.prepare(`
  INSERT OR IGNORE INTO radar_sources (id, platform, name, url_or_id, status, created_at)
  VALUES (?, ?, ?, ?, 'activo', datetime('now'))
`);

const initialSources = [
  { id: 'source-rss-gt-es', platform: 'RSS', name: 'Google Trends ES', url_or_id: 'https://trends.google.es/trends/trendingsearches/daily/rss?geo=ES' },
  { id: 'source-rss-mn-pt', platform: 'RSS', name: 'Menéame Portada', url_or_id: 'https://www.meneame.net/rss' },
  { id: 'source-rss-mn-ac', platform: 'RSS', name: 'Menéame Activas', url_or_id: 'https://www.meneame.net/rss?status=active' },
  { id: 'source-rss-em-es', platform: 'RSS', name: 'El Mundo España', url_or_id: 'https://www.elmundo.es/rss/portada.xml' },
  { id: 'source-rss-ep-na', platform: 'RSS', name: 'El País Nacional', url_or_id: 'https://ep00.epimg.net/rss/elpais/portada.xml' },
  { id: 'source-rss-abc-es', platform: 'RSS', name: 'ABC España', url_or_id: 'https://www.abc.es/rss/2.0/espana/' },
  { id: 'source-rss-ok', platform: 'RSS', name: 'OkDiario', url_or_id: 'https://okdiario.com/feed' },
  { id: 'source-rss-ed', platform: 'RSS', name: 'El Debate', url_or_id: 'https://www.eldebate.com/feed/index.xml' },
  { id: 'source-rss-to', platform: 'RSS', name: 'The Objective', url_or_id: 'https://theobjective.com/feed/' },
  { id: 'source-rss-gaceta', platform: 'RSS', name: 'La Gaceta', url_or_id: 'https://gaceta.es/feed/' },
  { id: 'source-rss-ld', platform: 'RSS', name: 'Libertad Digital', url_or_id: 'https://www.libertaddigital.com/rss/' },
  { id: 'source-rss-vp', platform: 'RSS', name: 'Vozpópuli', url_or_id: 'https://www.vozpopuli.com/rss/' },
  { id: 'source-rss-lv', platform: 'RSS', name: 'La Vanguardia', url_or_id: 'https://www.lavanguardia.com/rss/home.xml' },
  { id: 'source-rss-ec', platform: 'RSS', name: 'El Confidencial', url_or_id: 'https://rss.elconfidencial.com/espana/' },
  { id: 'source-rss-ed-es', platform: 'RSS', name: 'eldiario.es', url_or_id: 'https://www.eldiario.es/rss/' },
  { id: 'source-rss-hp', platform: 'RSS', name: 'HuffPost España', url_or_id: 'https://www.huffingtonpost.es/feeds/index.xml' },
  { id: 'source-rss-20m', platform: 'RSS', name: '20Minutos', url_or_id: 'https://www.20minutos.es/rss/' },
  { id: 'source-rss-lr', platform: 'RSS', name: 'La Razón', url_or_id: 'https://www.larazon.es/rss/portada.xml' },
  { id: 'source-rss-pb', platform: 'RSS', name: 'Público', url_or_id: 'https://www.publico.es/rss/' },
  { id: 'source-rss-rtve', platform: 'RSS', name: 'RTVE Noticias', url_or_id: 'https://www.rtve.es/rss/temas_noticias.xml' },
  { id: 'source-rss-eurp', platform: 'RSS', name: 'Europa Press', url_or_id: 'https://www.europapress.es/rss/rss.aspx' },
  { id: 'source-rss-sm', platform: 'RSS', name: 'Servimedia', url_or_id: 'https://www.servimedia.es/rss' },
  { id: 'source-rss-efe', platform: 'RSS', name: 'Agencia EFE', url_or_id: 'https://www.efe.com/feed/' },
  { id: 'source-reddit-sp', platform: 'Reddit', name: 'Reddit SpainPolitics', url_or_id: 'https://www.reddit.com/r/spainpolitics/hot.json?limit=25' },
  { id: 'source-reddit-es', platform: 'Reddit', name: 'Reddit España', url_or_id: 'https://www.reddit.com/r/es/hot.json?limit=25' },
  { id: 'source-tg-noticias-es', platform: 'Telegram', name: 'Noticias España Oficial', url_or_id: 'noticias_espana_oficial' }
];

for (const src of initialSources) {
  insertSource.run(src.id, src.platform, src.name, src.url_or_id);
}

console.log('[Migration] Base de datos e índices creados exitosamente.');
db.close();
