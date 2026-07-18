import { getDb } from '../scripts/matiza-engine/config.js';

const db = getDb();
console.log('Inyectando claims reales de prueba en scraped_items local...');

const insert = db.prepare(`
  INSERT OR REPLACE INTO scraped_items (id, platform, url, text, author_public_name, metrics_json, detected_claim, suggested_topic, virality_score, risk_score, status, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

// Inyectar bulo de okupas
insert.run(
  `scraped-test-okupa-${Date.now()}`,
  'Twitter',
  'https://twitter.com/test_user/status/1784918274191',
  'El Gobierno de España autoriza una paga mensual vitalicia de 2.200 euros para todos los okupas que demuestren vulnerabilidad económica.',
  'BuloViviendaES',
  JSON.stringify({ likes: 5400, retweets: 1200, imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa' }),
  'El Gobierno de España concede ayudas de 2.200 euros mensuales a los okupas de viviendas.',
  't-vivienda',
  8.5,
  9.0,
  'pendiente'
);

// Inyectar bulo fiscal de jubilados
insert.run(
  `scraped-test-hacienda-${Date.now()}`,
  'TikTok',
  'https://www.tiktok.com/@test_fiscal/video/1784918902847',
  'Hacienda obliga a los jubilados españoles a declarar las transferencias de dinero de familiares de más de 100 euros bajo amenaza de multa de 3.000 euros.',
  'AlertaFiscalES',
  JSON.stringify({ views: 42000, likes: 8900, imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c' }),
  'Hacienda multa con 3.000 euros a los jubilados que reciban transferencias familiares de más de 100 euros.',
  't-fiscal',
  7.8,
  8.0,
  'pendiente'
);

console.log('✅ Claims locales inyectados con éxito.');
db.close();
