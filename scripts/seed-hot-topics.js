import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = process.env.SQLITE_DB_PATH || import.meta.env.SQLITE_DB_PATH || path.resolve('data/matiza.db');
console.log(`[Seed] Insertando nuevos temas calientes en: ${dbPath}`);

if (!fs.existsSync(dbPath)) {
  console.error(`❌ Base de datos no encontrada en ${dbPath}`);
  process.exit(1);
}

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON;');

const topicsToSeed = [
  {
    id: 'ley-de-amnistia-y-proces',
    slug: 'ley-de-amnistia-y-proces',
    title: 'Ley de Amnistía y Procés',
    description: 'Contexto legal e imparcial sobre el alcance jurídico, constitucionalidad y resoluciones judiciales de la amnistía en España.',
    category: 'Política/Legal',
    header_summary: 'Análisis explicativo sobre la Ley Orgánica de amnistía para la normalización institucional en Cataluña.',
    verdict_summary: 'Una norma excepcional aprobada por las Cortes cuya constitucionalidad está bajo la revisión de los tribunales.',
    confidence: 'Oficial'
  },
  {
    id: 'ley-solo-si-es-si',
    slug: 'ley-solo-si-es-si',
    title: 'Ley del Solo Sí es Sí',
    description: 'Normativa real sobre el consentimiento afirmativo explícito, la fusión de abuso y agresión sexual, y la revisión penal retroactiva.',
    category: 'Sociedad/Penal',
    header_summary: 'Guía práctica e imparcial sobre la Ley Orgánica de garantía integral de la libertad sexual.',
    verdict_summary: 'Una reforma que elimina la distinción de abuso y agresión y cuya rebaja transitoria de condenas se debe al artículo 2.2 del Código Penal.',
    confidence: 'Oficial'
  }
];

const insertTopic = db.prepare(`
  INSERT OR IGNORE INTO topics (id, slug, title, description, category, header_summary, verdict_summary, confidence, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'activo', datetime('now'), datetime('now'))
`);

for (const topic of topicsToSeed) {
  insertTopic.run(topic.id, topic.slug, topic.title, topic.description, topic.category, topic.header_summary, topic.verdict_summary, topic.confidence);
  console.log(`✓ Tema "${topic.title}" verificado/insertado.`);
}

db.close();
console.log('[Seed] Sembrado de nuevos temas completado.');
