import fs from 'node:fs';
import path from 'node:path';

const searchDir = path.resolve('src');

// Expresión regular para detectar variantes de emojis corruptos y selectores de variación
const corruptPattern = /(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)/g;

function cleanText(text) {
  if (!text || typeof text !== 'string') return text;
  
  let cleaned = text;

  // Reemplazar patrones corruptos por su vocal correspondiente de forma heurística
  cleaned = cleaned.replace(/p(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)blica/gi, 'pública');
  cleaned = cleaned.replace(/p(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)blico/gi, 'público');
  cleaned = cleaned.replace(/p(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)blicas/gi, 'públicas');
  cleaned = cleaned.replace(/p(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)blicos/gi, 'públicos');

  cleaned = cleaned.replace(/pol(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)tica/gi, 'política');
  cleaned = cleaned.replace(/pol(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)tico/gi, 'político');
  cleaned = cleaned.replace(/pol(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)ticas/gi, 'políticas');
  cleaned = cleaned.replace(/pol(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)ticos/gi, 'políticos');

  cleaned = cleaned.replace(/econ(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)mica/gi, 'económica');
  cleaned = cleaned.replace(/econ(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)mico/gi, 'económico');
  cleaned = cleaned.replace(/econ(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)micas/gi, 'económicas');
  cleaned = cleaned.replace(/econ(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)micos/gi, 'económicos');

  cleaned = cleaned.replace(/jur(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)dica/gi, 'jurídica');
  cleaned = cleaned.replace(/jur(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)dico/gi, 'jurídico');
  cleaned = cleaned.replace(/jur(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)dicas/gi, 'jurídicas');
  cleaned = cleaned.replace(/jur(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)dicos/gi, 'jurídicos');

  cleaned = cleaned.replace(/art(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)culo/gi, 'artículo');
  cleaned = cleaned.replace(/art(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)culos/gi, 'artículos');

  cleaned = cleaned.replace(/auton(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)mica/gi, 'autónoma');
  cleaned = cleaned.replace(/auton(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)mico/gi, 'autónomo');
  cleaned = cleaned.replace(/auton(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)micas/gi, 'autónomas');
  cleaned = cleaned.replace(/auton(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)micos/gi, 'autónomos');

  cleaned = cleaned.replace(/tambi(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)n/gi, 'también');
  cleaned = cleaned.replace(/despu(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)s/gi, 'después');
  cleaned = cleaned.replace(/ingl(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)s/gi, 'inglés');
  
  cleaned = cleaned.replace(/ci(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)n/g, 'ción');
  cleaned = cleaned.replace(/si(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)n/g, 'sión');
  cleaned = cleaned.replace(/gi(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)n/g, 'gión');
  
  cleaned = cleaned.replace(/detr(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)s/gi, 'detrás');
  cleaned = cleaned.replace(/adem(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)s/gi, 'además');
  cleaned = cleaned.replace(/m(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)s/gi, 'más');
  cleaned = cleaned.replace(/all(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)/gi, 'allá');

  cleaned = cleaned.replace(/m(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)dico/gi, 'médico');
  cleaned = cleaned.replace(/m(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)dica/gi, 'médica');
  cleaned = cleaned.replace(/m(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)dicos/gi, 'médicos');
  cleaned = cleaned.replace(/m(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)dicas/gi, 'médicas');

  cleaned = cleaned.replace(/n(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)mina/gi, 'nómina');
  cleaned = cleaned.replace(/n(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)minas/gi, 'nóminas');

  cleaned = cleaned.replace(/espa(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)ol/gi, 'español');
  cleaned = cleaned.replace(/espa(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)ola/gi, 'española');
  cleaned = cleaned.replace(/espa(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)oles/gi, 'españoles');
  cleaned = cleaned.replace(/espa(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)olas/gi, 'españolas');
  cleaned = cleaned.replace(/Espa(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)a/g, 'España');

  cleaned = cleaned.replace(/b(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)squeda/gi, 'búsqueda');
  cleaned = cleaned.replace(/quir(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)rgica/gi, 'quirúrgica');
  cleaned = cleaned.replace(/quir(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)rgico/gi, 'quirúrgico');
  cleaned = cleaned.replace(/quir(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)rgicas/gi, 'quirúrgicas');
  cleaned = cleaned.replace(/quir(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)rgicos/gi, 'quirúrgicos');

  cleaned = cleaned.replace(/p(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)nico/gi, 'pánico');
  cleaned = cleaned.replace(/t(?:💡\uFE0F?⚙️\uFE0F?|⚙️\uFE0F?💡\uFE0F?|💡\uFE0F?⚙\uFE0F?|⚙\uFE0F?💡\uFE0F?|\?\?)tulo/gi, 'título');
  
  cleaned = cleaned.replace(/⚙️💡/g, 'í');
  cleaned = cleaned.replace(/💡⚙️/g, 'á');
  cleaned = cleaned.replace(/⚙️/g, '');

  // Eliminar emojis del frontend en textos literales de menús y botones
  // Si encontramos emojis decorativos en las vistas, los quitamos
  cleaned = cleaned.replaceAll('💡', '');
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
  cleaned = cleaned.replaceAll('📦', '');
  cleaned = cleaned.replaceAll('⚠️', '');
  cleaned = cleaned.replaceAll('🚀', '');
  cleaned = cleaned.replaceAll('🔬', '');
  cleaned = cleaned.replaceAll('📈', '');
  cleaned = cleaned.replaceAll('💾', '');

  return cleaned;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  content = cleanText(content);

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Saneado: ${path.relative(process.cwd(), filePath)}`);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverse(fullPath);
    } else if (f.endsWith('.astro') || f.endsWith('.js') || f.endsWith('.css') || f.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

traverse(searchDir);
console.log('🎉 Saneamiento global de archivos completado sin emojis.');
