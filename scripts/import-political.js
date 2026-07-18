import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const dbPath = process.env.SQLITE_DB_PATH || path.resolve('data/matiza.db');
const seedPath = path.resolve('data/seeds/political_data.json');

console.log(`[Importer] Conectando a la DB en ${dbPath}...`);
if (!fs.existsSync(dbPath)) {
  console.error(`❌ La base de datos no existe en ${dbPath}. Por favor ejecuta scripts/migrate.js primero.`);
  process.exit(1);
}

if (!fs.existsSync(seedPath)) {
  console.error(`❌ El archivo de semillas no existe en ${seedPath}.`);
  process.exit(1);
}

const db = new DatabaseSync(dbPath);
// Habilitar claves foráneas
db.exec('PRAGMA foreign_keys = ON;');

try {
  const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  console.log('[Importer] Semillas leídas exitosamente. Comenzando inserciones...');

  // 1. Inserción de topics
  if (seedData.topics && seedData.topics.length > 0) {
    const insertTopic = db.prepare(`
      INSERT OR REPLACE INTO topics (id, theme_id, slug, title, description, category, header_summary, verdict_summary, confidence, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    
    seedData.topics.forEach(t => {
      let themeId = t.theme_id || null;
      if (!themeId) {
        const tid = t.id;
        if (tid === 't-menas') themeId = 'theme-convivencia';
        else if (tid === 't-vivienda') themeId = 'theme-dinero';
        else if (tid === 't-economia') themeId = 'theme-dinero';
        else if (tid === 't-impuestos') themeId = 'theme-dinero';
      }
      insertTopic.run(t.id, themeId, t.slug, t.title, t.description, t.category, t.header_summary, t.verdict_summary, t.confidence, t.status || 'activo');
    });
    console.log(`  -> ${seedData.topics.length} temas importados.`);
  }

  // 2. Inserción de articles y sources desactivada (evitar datos mockeados o hardcodeados)
  console.log('  -> Omisión de artículos y fuentes hardcodeados (desactivados en semillas).');

  // 4. Inserción de parties
  if (seedData.parties && seedData.parties.length > 0) {
    const insertParty = db.prepare(`
      INSERT OR REPLACE INTO parties (id, slug, name, ideology_summary, official_website, logo_url, current_leader, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    seedData.parties.forEach(p => {
      insertParty.run(p.id, p.slug, p.name, p.ideology_summary, p.official_website, p.logo_url, p.current_leader);
    });
    console.log(`  -> ${seedData.parties.length} partidos políticos importados.`);
  }

  // 5. Inserción de electoral_programs
  if (seedData.electoral_programs && seedData.electoral_programs.length > 0) {
    const insertProgram = db.prepare(`
      INSERT OR REPLACE INTO electoral_programs (id, party_id, election_name, election_date, program_url, source_file_path, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    seedData.electoral_programs.forEach(ep => {
      insertProgram.run(ep.id, ep.party_id, ep.election_name, ep.election_date, ep.program_url, ep.source_file_path, ep.status || 'activo');
    });
    console.log(`  -> ${seedData.electoral_programs.length} programas electorales importados.`);
  }

  // 6. Inserción de policy_measures
  if (seedData.policy_measures && seedData.policy_measures.length > 0) {
    const insertMeasure = db.prepare(`
      INSERT OR REPLACE INTO policy_measures (id, program_id, party_id, area, title, original_text, plain_language_summary, possible_impact, target_groups, source_page, confidence, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    seedData.policy_measures.forEach(pm => {
      insertMeasure.run(
        pm.id,
        pm.program_id,
        pm.party_id,
        pm.area,
        pm.title,
        pm.original_text,
        pm.plain_language_summary,
        pm.possible_impact,
        pm.target_groups,
        pm.source_page || null,
        pm.confidence
      );
    });
    console.log(`  -> ${seedData.policy_measures.length} medidas de programas importadas.`);
  }

  // 7. Inserción de promise_tracking
  if (seedData.promise_tracking && seedData.promise_tracking.length > 0) {
    const insertPromise = db.prepare(`
      INSERT OR REPLACE INTO promise_tracking (id, party_id, measure_id, promise_text, government_level, was_in_government, action_taken, evidence_url, evidence_summary, status, notes, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    seedData.promise_tracking.forEach(pt => {
      insertPromise.run(
        pt.id,
        pt.party_id,
        pt.measure_id || null,
        pt.promise_text,
        pt.government_level,
        pt.was_in_government || 0,
        pt.action_taken,
        pt.evidence_url,
        pt.evidence_summary,
        pt.status || 'prometido',
        pt.notes
      );
    });
    console.log(`  -> ${seedData.promise_tracking.length} promesas de seguimiento importadas.`);
  }

  // 8. Inserción de asset_declarations
  if (seedData.asset_declarations && seedData.asset_declarations.length > 0) {
    const insertAsset = db.prepare(`
      INSERT OR REPLACE INTO asset_declarations (id, party_id, person_name, role, source_url, declared_assets_summary, declared_debts_summary, date_declared, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    seedData.asset_declarations.forEach(ad => {
      insertAsset.run(
        ad.id,
        ad.party_id,
        ad.person_name,
        ad.role,
        ad.source_url,
        ad.declared_assets_summary,
        ad.declared_debts_summary,
        ad.date_declared,
        ad.notes
      );
    });
    console.log(`  -> ${seedData.asset_declarations.length} declaraciones de bienes importadas.`);
  }

  console.log('✅ Importación de semillas completada con éxito.');
} catch (err) {
  console.error('❌ Error importando datos semilla:', err.message || err);
} finally {
  db.close();
}
