import fs from 'fs';
import path from 'path';

const slugs = [
  'vivienda-y-okupacion',
  'inmigracion-y-convivencia',
  'economia-espanola',
  'franquismo-y-memoria-historica',
  'corrupcion-y-promesas-politicas',
  'sanidad-publica',
  'justicia-imputado-condenado',
  'consumo-viral-productos-milagro',
  'ciberestafas-y-dinero-facil',
  'cataluna-y-convivencia-territorial'
];

console.log('🔍 INICIANDO VERIFICACIÓN DE VERTICALES MVP EN EL BUILD DIST...');
let errors = 0;

slugs.forEach(slug => {
  const filePath = path.resolve('dist', 'tema', slug, 'index.html');
  console.log(`\n📂 Verificando vertical: ${slug}`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ERROR: El archivo del vertical no se generó en: ${filePath}`);
    errors++;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Verificar longitud mínima
  if (content.length < 5000) {
    console.error(`❌ ERROR: El archivo es demasiado corto (${content.length} bytes), probablemente falló el renderizado.`);
    errors++;
    return;
  }
  
  // 2. Verificar secciones didácticas
  const checks = {
    '¿Qué está pasando?': content.includes('¿Qué está pasando con este tema?'),
    '¿Qué sabemos?': content.includes('¿Qué sabemos?'),
    '¿Qué no sabemos?': content.includes('¿Qué no sabemos?'),
    'Datos clave': content.includes('Puntos y Cifras Clave'),
    'Confusiones frecuentes': content.includes('Confusiones Frecuentes'),
    'Respuestas rápidas para redes': content.includes('Respuestas Rápidas para Redes'),
    'Cronología': content.includes('Cronología de Acontecimientos'),
    'Preguntas pendientes': content.includes('Preguntas Pendientes y Desafíos'),
    'Fuentes oficiales': content.includes('Fuentes Oficiales y Enlaces de Interés')
  };
  
  let passed = true;
  for (const [section, present] of Object.entries(checks)) {
    if (!present) {
      console.warn(`⚠️ ADVERTENCIA: Falta la sección didáctica "${section}" en el HTML.`);
      passed = false;
    }
  }
  
  if (passed) {
    console.log(`✅ OK: Secciones didácticas y visuales del vertical validadas al 100%. Size: ${content.length} bytes.`);
  } else {
    errors++;
  }
});

console.log('\n======================================');
if (errors === 0) {
  console.log('🎉 VERIFICACIÓN DE VERTICALES COMPLETADA CON ÉXITO SIN ERRORES.');
} else {
  console.error(`❌ VERIFICACIÓN COMPLETADA CON ${errors} ERRORES/ADVERTENCIAS.`);
  process.exit(1);
}
