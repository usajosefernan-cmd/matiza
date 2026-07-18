import { getDb } from './config.js';

const db = getDb();

const mvpTopics = [
  {
    id: 't-vivienda',
    slug: 'vivienda-y-okupacion',
    title: 'Vivienda en España',
    category: 'Vivienda y vida imposible',
    description: 'Análisis de alquileres, compraventa de pisos, fondos de inversión, okupación, alquiler turístico y políticas habitacionales en España.'
  },
  {
    id: 't-migracion',
    slug: 'inmigracion-y-convivencia',
    title: 'Inmigración, MENAS y convivencia',
    category: 'Inmigración, MENAS y convivencia',
    description: 'Análisis de criminalidad, ayudas públicas, empleo, integración, control fronterizo y verificación de narrativas contra colectivos vulnerables.'
  },
  {
    id: 't-economia',
    slug: 'economia-espanola',
    title: 'Economía española: ¿va bien o mal?',
    category: 'Economía real de España',
    description: 'Estadísticas del paro, evolución de la deuda, inflación, salarios, productividad, impuestos e informes del INE y el Banco de España.'
  },
  {
    id: 't-franco',
    slug: 'franquismo-y-memoria-historica',
    title: 'Franquismo y nostalgia histórica',
    category: 'Historia y memoria',
    description: 'Desmentidos y datos sobre la Segunda República, el Franquismo, la Transición, la ley de Memoria Democrática y nostalgia histórica viral.'
  },
  {
    id: 't-koldo',
    slug: 'corrupcion-y-promesas-politicas',
    title: 'Corrupción y promesas políticas',
    category: 'Corrupción y transparencia',
    description: 'Auditoría de subvenciones, contratos públicos, financiación de partidos políticos, patrimonio de cargos públicos y puertas giratorias.'
  },
  {
    id: 't-sanidad',
    slug: 'sanidad-publica',
    title: 'Sanidad pública',
    category: 'Sanidad pública y listas de espera',
    description: 'Datos oficiales sobre listas de espera en consultas y cirugías, privatizaciones de servicios, gasto sanitario y gestión autonómica.'
  },
  {
    id: 't-justicia',
    slug: 'justicia-imputado-condenado',
    title: 'Justicia: investigado, imputado, condenado',
    category: 'Justicia y acusaciones públicas',
    description: 'Auditoría de causas judiciales virales. Clarificación del estado procesal real: denunciado, investigado, imputado o condenado en firme.'
  },
  {
    id: 't-consumo',
    slug: 'consumo-viral-productos-milagro',
    title: 'Consumo viral: promos, salud y productos milagro',
    category: 'Consumo, salud y promociones virales',
    description: 'Análisis de publicidad encubierta de influencers, productos milagro (detox, colágeno), cosmética con claims médicos y alertas de la AEMPS.'
  },
  {
    id: 't-ciberestafas',
    slug: 'ciberestafas-y-dinero-facil',
    title: 'Ciberestafas y dinero fácil',
    category: 'Seguridad, delincuencia y ciberestafas',
    description: 'Verificación de estafas en redes sociales, phishing financiero, bots de inversión fraudulenta, cursos de trading y promesas de dinero fácil.'
  },
  {
    id: 't-cataluna',
    slug: 'cataluna-y-convivencia-territorial',
    title: 'Cataluña, independencia y memoria de ETA',
    category: 'Cataluña y independentismo',
    description: 'Verificación de afirmaciones relativas a la amnistía, financiación singular, transferencias de competencias, convivencia y debates sobre el terrorismo histórico.'
  }
];

console.log('[Seed MVP Topics] Actualizando la tabla topics con los 10 primeros temas de la guía...');

const insertOrReplaceTopic = db.prepare(`
  INSERT OR REPLACE INTO topics (id, slug, title, description, category, verdict_summary, confidence, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, '', 'Alta', 'activo', datetime('now'), datetime('now'))
`);

mvpTopics.forEach(topic => {
  insertOrReplaceTopic.run(topic.id, topic.slug, topic.title, topic.description, topic.category);
  console.log(`  ✓ Tema "${topic.title}" registrado con ID: ${topic.id}`);
});

db.close();
console.log('[Seed MVP Topics] Finalizado con éxito.');
