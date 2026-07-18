import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

// Reusar la función de limpieza del script clean-source-emojis.js
const wordReplacements = {
  'POL💡⚙️TICO': 'POLÍTICO',
  'pol💡⚙️tica': 'política',
  'pol💡⚙️ticas': 'políticas',
  'pol💡⚙️tico': 'político',
  'pol💡⚙️ticos': 'políticos',
  'Pol💡⚙️tico': 'Político',
  'Pol💡⚙️ticos': 'Políticos',
  'categor💡⚙️a': 'categoría',
  'categor💡⚙️as': 'categorías',
  'Categor💡⚙️a': 'Categoría',
  'Usurpaci💡⚙️n': 'Usurpación',
  'usurpaci💡⚙️n': 'usurpación',
  'distinci💡⚙️n': 'distinción',
  'jur💡⚙️dica': 'jurídica',
  'jur💡⚙️dico': 'jurídico',
  'jur💡⚙️dicas': 'jurídicas',
  'jur💡⚙️dicos': 'jurídicos',
  'actuaci💡⚙️n': 'actuación',
  'tambi💡⚙️n': 'también',
  'proceder⚙️💡': 'procederá',
  'Fiscal💡⚙️a': 'Fiscalía',
  'fiscal💡⚙️a': 'fiscalía',
  'Tesorer💡⚙️a': 'Tesorería',
  'tesorer💡⚙️a': 'tesorería',
  'acompa💡⚙️ado': 'acompañado',
  'acompa💡⚙️ados': 'acompañados',
  'acompa💡⚙️ada': 'acompañada',
  'acompa💡⚙️adas': 'acompañadas',
  'Art💡⚙️culo': 'Artículo',
  'art💡⚙️culo': 'artículo',
  'art💡⚙️culos': 'artículos',
  'inter💡⚙️s': 'interés',
  'b💡⚙️sico': 'básico',
  'b💡⚙️sica': 'básica',
  'b💡⚙️sicos': 'básicos',
  'b💡⚙️sicas': 'básicas',
  'manutenci💡⚙️n': 'manutención',
  'econ💡⚙️mica': 'económica',
  'econ💡⚙️micas': 'económicas',
  'econ💡⚙️mico': 'económico',
  'econ💡⚙️micos': 'económicos',
  'Comit⚙️💡': 'Comité',
  'Ni💡⚙️o': 'Niño',
  'ni💡⚙️o': 'niño',
  'ni💡⚙️os': 'niños',
  'cient💡⚙️fico': 'científico',
  'cient💡⚙️fica': 'científica',
  'cient💡⚙️ficos': 'científicos',
  'cient💡⚙️ficas': 'científicas',
  'Aut💡⚙️noma': 'Autónoma',
  'aut💡⚙️noma': 'autónoma',
  'Aut💡⚙️nomas': 'Autónomas',
  'aut💡⚙️nomas': 'autónomas',
  'est💡⚙️n': 'están',
  'inserci💡⚙️n': 'inserción',
  'j💡⚙️venes': 'jóvenes',
  'formaci💡⚙️n': 'formación',
  'cuant💡⚙️a': 'cuantía',
  'var💡⚙️a': 'varía',
  'seg💡⚙️n': 'según',
  'declaraci💡⚙️n': 'declaración',
  'declaraciones': 'declaraciones',
  'buz💡⚙️n': 'buzón',
  'pesta💡⚙️as': 'pestañas',
  'espec💡⚙️ficas': 'específicas',
  'espec💡⚙️fico': 'específico',
  'espec💡⚙️ficos': 'específicos',
  'espec💡⚙️fica': 'específica',
  'Ay💡⚙️danos': 'Ayúdanos',
  'ay💡⚙️danos': 'ayúdanos',
  'R💡⚙️pido': 'Rápido',
  'r💡⚙️pido': 'rápido',
  'opini💡⚙️n': 'opinión',
  'presunci💡⚙️n': 'presunción',
  'exclusi💡⚙️n': 'exclusión',
  'iniciaci💡⚙️n': 'iniciación',
  'resoluci💡⚙️n': 'resolución',
  'detenci💡⚙️n': 'detención',
  'acusaci💡⚙️n': 'acusación',
  'instrucci💡⚙️n': 'instrucción',
  'adjudicaci💡⚙️n': 'adjudicación',
  'subvenci💡⚙️n': 'subvención',
  'recaudaci💡⚙️n': 'recaudación',
  'tributaci💡⚙️n': 'tributación',
  'jubilaci💡⚙️n': 'jubilación',
  'pensi💡⚙️n': 'pensión',
  'pensiones': 'pensiones',
  'bonificaci💡⚙️n': 'bonificación',
  'exenci💡⚙️n': 'exención',
  'regulaci💡⚙️n': 'regulación',
  'comisi💡⚙️n': 'comisión',
  'asociaci💡⚙️n': 'asociación',
  'evaluaci💡⚙️n': 'evaluación',
  'alimentaci💡⚙️n': 'alimentación',
  'prescripci💡⚙️n': 'prescripción',
  'titulaci💡⚙️n': 'titulación',
  'contrataci💡⚙️n': 'contratación',
  'coordinaci💡⚙️n': 'coordinación',
  'hist💡⚙️rico': 'histórico',
  'hist💡⚙️rica': 'histórica',
  'hist💡⚙️ricos': 'históricos',
  'hist💡⚙️ricas': 'históricas',
  'pa⚙️s': 'país',
  'pa💡⚙️s': 'país',
  'm⚙️💡dicas': 'médicas',
  'm⚙️💡dicos': 'médicos',
  'm⚙️💡dico': 'médico',
  'm⚙️💡dica': 'médica',
  'n⚙️💡mina': 'nómina',
  'n⚙️💡minas': 'nóminas',
  'p⚙️blica': 'pública',
  'p⚙️blico': 'público',
  'p⚙️blicas': 'públicas',
  'p⚙️blicos': 'públicos',
  'p💡⚙️blica': 'pública',
  'p💡⚙️blico': 'público',
  'p💡⚙️blicas': 'públicas',
  'p💡⚙️blicos': 'públicos',
  'enga💡⚙️oso': 'engañoso',
  'enga⚙💡oso': 'engañoso',
  'enga⚙️💡oso': 'engañoso',
  'espa💡⚙️ol': 'español',
  'espa💡⚙️ola': 'española',
  'espa💡⚙️oles': 'españoles',
  'espa💡⚙️olas': 'españolas',
  '1⚙️💡': '1ª',
  '2⚙️💡': '2ª'
};

function cleanText(text) {
  if (!text || typeof text !== 'string') return text;
  let cleaned = text;

  // Reemplazo de palabras completas
  for (const [corrupt, clean] of Object.entries(wordReplacements)) {
    cleaned = cleaned.replaceAll(corrupt, clean);
  }

  // Mapeos secundarios
  cleaned = cleaned.replaceAll('POL💡⚙n', 'POLÍTICO');
  cleaned = cleaned.replaceAll('pol💡⚙n', 'político');
  cleaned = cleaned.replaceAll('pol💡⚙s', 'políticos');
  cleaned = cleaned.replaceAll('pol💡⚙a', 'política');
  cleaned = cleaned.replaceAll('pol💡⚙as', 'políticas');
  cleaned = cleaned.replaceAll('Com💡⚙n', 'Común');
  cleaned = cleaned.replaceAll('com💡⚙n', 'común');
  cleaned = cleaned.replaceAll('Catalu💡⚙a', 'Cataluña');
  cleaned = cleaned.replaceAll('catalu💡⚙a', 'cataluña');
  cleaned = cleaned.replaceAll('comparaci💡⚙n', 'comparación');
  cleaned = cleaned.replaceAll('Caracter💡⚙stica', 'Característica');
  cleaned = cleaned.replaceAll('caracter💡⚙stica', 'característica');
  cleaned = cleaned.replaceAll('Recaudaci💡⚙n', 'Recaudación');
  cleaned = cleaned.replaceAll('recaudaci💡⚙n', 'recaudación');
  cleaned = cleaned.replaceAll('Aportaci💡⚙n', 'Aportación');
  cleaned = cleaned.replaceAll('aportaci💡⚙n', 'aportación');
  cleaned = cleaned.replaceAll('nivelaci💡⚙n', 'nivelación');
  cleaned = cleaned.replaceAll('vac⚙️💡o', 'vacío');
  cleaned = cleaned.replaceAll('vac💡⚙️o', 'vacío');
  cleaned = cleaned.replaceAll('1⚙️💡 residencia', '1ª residencia');
  cleaned = cleaned.replaceAll('2⚙️💡 residencia', '2ª residencia');
  cleaned = cleaned.replaceAll('S💡⚙️,', 'Sí,');
  cleaned = cleaned.replaceAll('S💡⚙️', 'Sí');
  cleaned = cleaned.replaceAll('S💡⚙', 'Sí');
  cleaned = cleaned.replaceAll('cat💡⚙️logo', 'catálogo');
  cleaned = cleaned.replaceAll('cat💡⚙logo', 'catálogo');
  cleaned = cleaned.replaceAll('bot💡⚙️n', 'botón');
  cleaned = cleaned.replaceAll('bot💡⚙n', 'botón');
  cleaned = cleaned.replaceAll('pesta💡⚙️as', 'pestañas');
  cleaned = cleaned.replaceAll('pesta💡⚙as', 'pestañas');
  cleaned = cleaned.replaceAll('est⚙️💡', 'está');
  cleaned = cleaned.replaceAll('est⚙💡', 'está');
  cleaned = cleaned.replaceAll('1⚙️💡 o 2⚙️💡', '1ª o 2ª');
  cleaned = cleaned.replaceAll('m⚙️💡dico', 'médico');
  cleaned = cleaned.replaceAll('m⚙️💡dica', 'médica');
  cleaned = cleaned.replaceAll('m⚙️💡dicos', 'médicos');
  cleaned = cleaned.replaceAll('n⚙️💡mina', 'nómina');
  cleaned = cleaned.replaceAll('n⚙️💡minas', 'nóminas');
  cleaned = cleaned.replaceAll('p⚙️blica', 'pública');
  cleaned = cleaned.replaceAll('p⚙️blico', 'público');
  cleaned = cleaned.replaceAll('p⚙️blicas', 'públicas');
  cleaned = cleaned.replaceAll('p⚙️blicos', 'públicos');

  cleaned = cleaned.replaceAll('enga??oso', 'engañoso');
  cleaned = cleaned.replaceAll('enga?oso', 'engañoso');
  cleaned = cleaned.replaceAll('qu??', 'qué');
  cleaned = cleaned.replaceAll('pesta??as', 'pestañas');

  cleaned = cleaned.replaceAll('ci💡⚙️n', 'ción');
  cleaned = cleaned.replaceAll('ci💡⚙n', 'ción');
  cleaned = cleaned.replaceAll('si💡⚙️n', 'sión');
  cleaned = cleaned.replaceAll('si💡⚙n', 'sión');
  cleaned = cleaned.replaceAll('gi💡⚙️n', 'gión');
  cleaned = cleaned.replaceAll('gi💡⚙n', 'gión');
  cleaned = cleaned.replaceAll('ni💡⚙️o', 'niño');
  cleaned = cleaned.replaceAll('ni💡⚙n', 'niño');
  cleaned = cleaned.replaceAll('tambi💡⚙️n', 'también');
  cleaned = cleaned.replaceAll('tambi💡⚙n', 'también');
  cleaned = cleaned.replaceAll('despu💡⚙️s', 'después');
  cleaned = cleaned.replaceAll('despu💡⚙s', 'después');
  cleaned = cleaned.replaceAll('pa💡⚙️s', 'país');
  cleaned = cleaned.replaceAll('pa💡⚙s', 'país');

  // Eliminar emojis del frontend que el usuario no quiere
  cleaned = cleaned.replaceAll('💡', '');
  cleaned = cleaned.replaceAll('⚙️', '');
  cleaned = cleaned.replaceAll('📂', '');
  cleaned = cleaned.replaceAll('🕵️', '');
  cleaned = cleaned.replaceAll('📋', '');
  cleaned = cleaned.replaceAll('⚖️', '');
  cleaned = cleaned.replaceAll('💰', '');
  cleaned = cleaned.replaceAll('📖', '');
  cleaned = cleaned.replaceAll('📊', '');
  cleaned = cleaned.replaceAll('🔍', '');
  cleaned = cleaned.replaceAll('🏛️', '');
  cleaned = cleaned.replaceAll('💬', '');
  cleaned = cleaned.replaceAll('❌', '');
  cleaned = cleaned.replaceAll('✅', '');
  cleaned = cleaned.replaceAll('⚡', '');
  cleaned = cleaned.replaceAll('📡', '');
  cleaned = cleaned.replaceAll('📥', '');
  cleaned = cleaned.replaceAll('🏛', '');
  cleaned = cleaned.replaceAll('⚖', '');
  cleaned = cleaned.replaceAll('ℹ️', '');
  cleaned = cleaned.replaceAll('🚀', '');
  cleaned = cleaned.replaceAll('📦', '');
  cleaned = cleaned.replaceAll('⚠️', '');
  cleaned = cleaned.replaceAll('🔬', '');
  cleaned = cleaned.replaceAll('📈', '');
  cleaned = cleaned.replaceAll('💾', '');

  return cleaned.trim();
}

const dbPath = process.env.SQLITE_DB_PATH || import.meta.env.SQLITE_DB_PATH || path.resolve('data/matiza.db');
console.log(`[Base de Datos] Abriendo conexión con ${dbPath}...`);
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// 1. Saneamiento de la tabla topics
console.log('Saneando tabla [topics]...');
const topics = db.prepare("SELECT id, title, description, verdict_summary FROM topics").all();
for (const t of topics) {
  const cleanTitle = cleanText(t.title);
  const cleanDesc = cleanText(t.description);
  const cleanSummary = cleanText(t.verdict_summary);
  
  db.prepare("UPDATE topics SET title = ?, description = ?, verdict_summary = ? WHERE id = ?")
    .run(cleanTitle, cleanDesc, cleanSummary, t.id);
}

// 2. Saneamiento de la tabla articles
console.log('Saneando tabla [articles]...');
const articles = db.prepare("SELECT id, title, subtitle, claim, origin_summary, summary, explanation, what_is_true, what_is_false, what_lacks_context, what_is_not_proven, emoji_tag FROM articles").all();
for (const a of articles) {
  const cleanTitle = cleanText(a.title);
  const cleanSubtitle = cleanText(a.subtitle);
  const cleanClaim = cleanText(a.claim);
  const cleanOrigSum = cleanText(a.origin_summary);
  const cleanSum = cleanText(a.summary);
  const cleanExp = cleanText(a.explanation);
  const cleanTrue = cleanText(a.what_is_true);
  const cleanFalse = cleanText(a.what_is_false);
  const cleanLacks = cleanText(a.what_lacks_context);
  const cleanNotProven = cleanText(a.what_is_not_proven);
  const cleanEmoji = cleanText(a.emoji_tag);

  db.prepare(`
    UPDATE articles 
    SET title = ?, subtitle = ?, claim = ?, origin_summary = ?, summary = ?, explanation = ?, 
        what_is_true = ?, what_is_false = ?, what_lacks_context = ?, what_is_not_proven = ?, emoji_tag = ?
    WHERE id = ?
  `).run(cleanTitle, cleanSubtitle, cleanClaim, cleanOrigSum, cleanSum, cleanExp, cleanTrue, cleanFalse, cleanLacks, cleanNotProven, cleanEmoji, a.id);
}

// 3. Saneamiento de la tabla sources
console.log('Saneando tabla [sources]...');
const sources = db.prepare("SELECT id, title, quote_or_summary FROM sources").all();
for (const s of sources) {
  const cleanTitle = cleanText(s.title);
  const cleanQuote = cleanText(s.quote_or_summary);

  db.prepare("UPDATE sources SET title = ?, quote_or_summary = ? WHERE id = ?")
    .run(cleanTitle, cleanQuote, s.id);
}

// 4. Saneamiento de la tabla policy_measures
console.log('Saneando tabla [policy_measures]...');
const measures = db.prepare("SELECT id, title, original_text, plain_language_summary, possible_impact, target_groups FROM policy_measures").all();
for (const m of measures) {
  const cleanTitle = cleanText(m.title);
  const cleanOrig = cleanText(m.original_text);
  const cleanPlain = cleanText(m.plain_language_summary);
  const cleanImpact = cleanText(m.possible_impact);
  const cleanTarget = cleanText(m.target_groups);

  db.prepare(`
    UPDATE policy_measures 
    SET title = ?, original_text = ?, plain_language_summary = ?, possible_impact = ?, target_groups = ? 
    WHERE id = ?
  `).run(cleanTitle, cleanOrig, cleanPlain, cleanImpact, cleanTarget, m.id);
}

// 5. Saneamiento de la tabla scraped_items
console.log('Saneando tabla [scraped_items]...');
const items = db.prepare("SELECT id, text, detected_claim FROM scraped_items").all();
for (const i of items) {
  const cleanTextVal = cleanText(i.text);
  const cleanClaim = cleanText(i.detected_claim);

  db.prepare("UPDATE scraped_items SET text = ?, detected_claim = ? WHERE id = ?")
    .run(cleanTextVal, cleanClaim, i.id);
}

db.close();
console.log('🎉 ¡Base de datos saneada con éxito sin emojis ni caracteres corruptos!');
