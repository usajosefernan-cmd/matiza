INSERT OR REPLACE INTO scraped_items (id, platform, url, text, author_public_name, metrics_json, detected_claim, suggested_topic, virality_score, risk_score, status, created_at)
VALUES (
  'scraped-test-okupa-vps-sql',
  'Twitter',
  'https://twitter.com/test_vps/status/17849182',
  'El Gobierno autoriza una paga mensual de 2.200 euros para todos los okupas.',
  'BuloViviendaVPS',
  '{"likes": 5400, "retweets": 1200, "imageUrl": "https://images.unsplash.com/photo-1560518883-ce09059eeffa"}',
  'El Gobierno concede ayudas de 2.200 euros mensuales a los okupas.',
  't-vivienda',
  8.5,
  9.0,
  'pendiente',
  datetime('now')
);
