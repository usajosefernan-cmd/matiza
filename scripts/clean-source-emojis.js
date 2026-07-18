import fs from 'node:fs';
import path from 'node:path';

const targetDirs = ['src'];

// Diccionario de reemplazo exacto de palabras completas corruptas
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
  'hist💡⚙️ricos': 'historias',
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
  let cleaned = text;

  // Primero reemplazos por diccionario de palabras completas
  for (const [corrupt, clean] of Object.entries(wordReplacements)) {
    const regex = new RegExp(corrupt, 'g');
    cleaned = cleaned.replace(regex, clean);
  }

  // Mapeos secundarios sin variante selector para asegurar cobertura
  cleaned = cleaned.replace(/POL💡⚙n/g, 'POLÍTICO');
  cleaned = cleaned.replace(/pol💡⚙n/g, 'político');
  cleaned = cleaned.replace(/pol💡⚙s/g, 'políticos');
  cleaned = cleaned.replace(/pol💡⚙a/g, 'política');
  cleaned = cleaned.replace(/pol💡⚙as/g, 'políticas');
  cleaned = cleaned.replace(/Com💡⚙n/g, 'Común');
  cleaned = cleaned.replace(/com💡⚙n/g, 'común');
  cleaned = cleaned.replace(/Catalu💡⚙a/g, 'Cataluña');
  cleaned = cleaned.replace(/catalu💡⚙a/g, 'cataluña');
  cleaned = cleaned.replace(/comparaci💡⚙n/g, 'comparación');
  cleaned = cleaned.replace(/Caracter💡⚙stica/g, 'Característica');
  cleaned = cleaned.replace(/caracter💡⚙stica/g, 'característica');
  cleaned = cleaned.replace(/Recaudaci💡⚙n/g, 'Recaudación');
  cleaned = cleaned.replace(/recaudaci💡⚙n/g, 'recaudación');
  cleaned = cleaned.replace(/Aportaci💡⚙n/g, 'Aportación');
  cleaned = cleaned.replace(/aportaci💡⚙n/g, 'aportación');
  cleaned = cleaned.replace(/nivelaci💡⚙n/g, 'nivelación');
  cleaned = cleaned.replace(/allanamiento vs usurpaci💡⚙n/gi, 'allanamiento vs usurpación');
  cleaned = cleaned.replace(/morada vs vac⚙️💡o/gi, 'morada vs vacío');
  cleaned = cleaned.replace(/vac⚙️💡o/gi, 'vacío');
  cleaned = cleaned.replace(/vac💡⚙️o/gi, 'vacío');
  cleaned = cleaned.replace(/1⚙️💡 residencia/g, '1ª residencia');
  cleaned = cleaned.replace(/2⚙️💡 residencia/g, '2ª residencia');
  cleaned = cleaned.replace(/💡⚙️De d💡⚙️nde/g, '¿De dónde');
  cleaned = cleaned.replace(/💡⚙De d💡⚙nde/g, '¿De dónde');
  cleaned = cleaned.replace(/S💡⚙️,/g, 'Sí,');
  cleaned = cleaned.replace(/S💡⚙️/g, 'Sí');
  cleaned = cleaned.replace(/S💡⚙/g, 'Sí');
  cleaned = cleaned.replace(/cat💡⚙️logo/g, 'catálogo');
  cleaned = cleaned.replace(/cat💡⚙logo/g, 'catálogo');
  cleaned = cleaned.replace(/bot💡⚙️n/g, 'botón');
  cleaned = cleaned.replace(/bot💡⚙n/g, 'botón');
  cleaned = cleaned.replace(/pesta💡⚙️as/g, 'pestañas');
  cleaned = cleaned.replace(/pesta💡⚙as/g, 'pestañas');
  cleaned = cleaned.replace(/💡⚙️Qu⚙️💡/g, '¿Qué');
  cleaned = cleaned.replace(/💡⚙️Qu⚙️/g, '¿Qué');
  cleaned = cleaned.replace(/💡⚙Qu⚙/g, '¿Qué');
  cleaned = cleaned.replace(/est⚙️💡/g, 'está');
  cleaned = cleaned.replace(/est⚙💡/g, 'está');

  cleaned = cleaned.replace(/1⚙️💡 o 2⚙️💡/g, '1ª o 2ª');
  cleaned = cleaned.replace(/m⚙️💡dico/g, 'médico');
  cleaned = cleaned.replace(/m⚙️💡dica/g, 'médica');
  cleaned = cleaned.replace(/m⚙️💡dicos/g, 'médicos');
  cleaned = cleaned.replace(/n⚙️💡mina/g, 'nómina');
  cleaned = cleaned.replace(/n⚙️💡minas/g, 'nóminas');
  cleaned = cleaned.replace(/p⚙️blica/g, 'pública');
  cleaned = cleaned.replace(/p⚙️blico/g, 'público');
  cleaned = cleaned.replace(/p⚙️blicas/g, 'públicas');
  cleaned = cleaned.replace(/p⚙️blicos/g, 'públicos');

  // Limpiar casos específicos con interrogantes restantes
  cleaned = cleaned.replace(/enga\?\?oso/g, 'engañoso');
  cleaned = cleaned.replace(/enga\?oso/g, 'engañoso');
  cleaned = cleaned.replace(/qu\?\?/g, 'qué');
  cleaned = cleaned.replace(/pesta\?\?as/g, 'pestañas');

  // Regex heurísticas generales
  cleaned = cleaned.replace(/ci💡⚙️n/g, 'ción');
  cleaned = cleaned.replace(/ci💡⚙n/g, 'ción');
  cleaned = cleaned.replace(/si💡⚙️n/g, 'sión');
  cleaned = cleaned.replace(/si💡⚙n/g, 'sión');
  cleaned = cleaned.replace(/gi💡⚙️n/g, 'gión');
  cleaned = cleaned.replace(/gi💡⚙n/g, 'gión');
  cleaned = cleaned.replace(/ni💡⚙️o/g, 'niño');
  cleaned = cleaned.replace(/ni💡⚙n/g, 'niño');
  cleaned = cleaned.replace(/tambi💡⚙️n/g, 'también');
  cleaned = cleaned.replace(/tambi💡⚙n/g, 'también');
  cleaned = cleaned.replace(/despu💡⚙️s/g, 'después');
  cleaned = cleaned.replace(/despu💡⚙s/g, 'después');
  cleaned = cleaned.replace(/pa💡⚙️s/g, 'país');
  cleaned = cleaned.replace(/pa💡⚙s/g, 'país');

  // Emojis sueltos o residuales que queden dentro de palabras
  cleaned = cleaned.replace(/💡⚙️Has/g, '¿Has');
  cleaned = cleaned.replace(/💡⚙Has/g, '¿Has');
  cleaned = cleaned.replace(/💡⚙️Cómo/g, '¿Cómo');
  cleaned = cleaned.replace(/💡⚙Cómo/g, '¿Cómo');
  cleaned = cleaned.replace(/💡⚙️Creó/g, '¿Creó');
  cleaned = cleaned.replace(/💡⚙Creó/g, '¿Creó');

  return cleaned;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const cleaned = cleanText(content);
  if (content !== cleaned) {
    fs.writeFileSync(filePath, cleaned, 'utf8');
    console.log(`✓ Saneado: ${filePath}`);
    return true;
  }
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (stat.isFile() && (file.endsWith('.astro') || file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.json'))) {
      processFile(fullPath);
    }
  }
}

console.log('[Saneador de Emojis] Iniciando escaneo de archivos...');
for (const dir of targetDirs) {
  const fullDir = path.resolve(dir);
  if (fs.existsSync(fullDir)) {
    console.log(`  → Escaneando carpeta: ${fullDir}`);
    walkDir(fullDir);
  }
}
console.log('✅ Escaneo y saneamiento completados.');
