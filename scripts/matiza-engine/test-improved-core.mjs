import assert from 'node:assert/strict';
import {
  normalizeText,
  jaccardSimilarity,
  normalizeUrl,
  textFingerprint
} from './lib/text-utils.js';
import { classifyAuthority, dedupeAndRankSources } from './lib/source-ranker.js';
import { clusterItems } from './lib/clustering.js';
import { mapLimit } from './lib/async-pool.js';

assert.equal(normalizeText('¡España,  2026!'), 'espana 2026');
assert.ok(jaccardSimilarity('precio alquiler vivienda Madrid', 'vivienda y alquiler en Madrid') > 0.4);
assert.equal(
  normalizeUrl('https://www.ine.es/dato/?utm_source=x&fbclid=abc'),
  'https://www.ine.es/dato'
);
assert.equal(textFingerprint('Mismo texto'), textFingerprint(' mismo   texto '));
assert.equal(classifyAuthority('https://www.boe.es/buscar/doc.php?id=X').level, 'Máxima');

const ranked = dedupeAndRankSources([
  { title: 'Portada', url: 'https://www.boe.es/', snippet: '' },
  { title: 'Documento oficial vivienda', url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-X', snippet: 'normativa vivienda alquiler' },
  { title: 'Duplicado', url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-X&utm_source=test', snippet: 'normativa vivienda alquiler' }
], 'normativa vivienda alquiler');
assert.equal(ranked.length, 2);
assert.ok(ranked[0].url.includes('diario_boe'));

const clusters = clusterItems([
  { id: 1, text: 'Sube el precio del alquiler y preocupa la vivienda', virality_score: 7, risk_score: 5 },
  { id: 2, text: 'La vivienda y el alquiler vuelven a subir', virality_score: 8, risk_score: 5 },
  { id: 3, text: 'Una final deportiva termina por penaltis', virality_score: 4, risk_score: 1 }
], 0.2);
assert.equal(clusters.length, 2);
assert.equal(clusters[0].items.length, 2);

let active = 0;
let maximum = 0;
const values = await mapLimit([1, 2, 3, 4, 5], 2, async value => {
  active += 1;
  maximum = Math.max(maximum, active);
  await new Promise(resolve => setTimeout(resolve, 10));
  active -= 1;
  return value * 2;
});
assert.deepEqual(values, [2, 4, 6, 8, 10]);
assert.ok(maximum <= 2);

console.log('✓ MATIZA Engine 2: pruebas de núcleo superadas.');
