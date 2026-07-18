import { exec } from 'child_process';
import http from 'http';

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

function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data
        });
      });
    }).on('error', (err) => {
      resolve({
        statusCode: 0,
        error: err.message
      });
    });
  });
}

async function runVerification() {
  console.log('🔍 PROBANDO ACCESO A VERTICALES EN LOCALHOST:4321...');
  let liveErrors = 0;
  
  for (const slug of slugs) {
    const url = `http://localhost:4321/tema/${slug}`;
    console.log(`\n📡 Conectando a: ${url}`);
    
    const res = await checkUrl(url);
    
    if (res.statusCode !== 200) {
      console.error(`❌ ERROR: El vertical devuelvo estado ${res.statusCode}. Detalle error: ${res.error || 'Ninguno'}`);
      liveErrors++;
      continue;
    }
    
    const content = res.body;
    
    // Verificar secciones
    const checks = {
      '¿Qué está pasando?': content.includes('¿Qué está pasando con este tema?'),
      '¿Qué sabemos? e Incertidumbres': content.includes('Hechos Probados') && content.includes('Incertidumbres'),
      'Marco Legal (BOE)': content.includes('Marco Legal y Normativo'),
      'Datos clave': content.includes('Puntos y Cifras Clave'),
      'Confusiones frecuentes': content.includes('Confusiones Frecuentes'),
      'Respuestas rápidas para redes': content.includes('Respuestas Rápidas para Redes'),
      'Cronología': content.includes('Cronología de Acontecimientos'),
      'Fuentes oficiales': content.includes('Fuentes Oficiales y Enlaces de Interés')
    };
    
    let passed = true;
    for (const [section, present] of Object.entries(checks)) {
      if (!present) {
        console.warn(`⚠️ ADVERTENCIA: Falta la sección didáctica "${section}" en el HTML renderizado.`);
        passed = false;
      }
    }
    
    if (passed) {
      console.log(`✅ OK: El vertical responde y renderiza todos los desgloses didácticos y fuentes oficiales.`);
    } else {
      liveErrors++;
    }
  }
  
  console.log('\n======================================');
  if (liveErrors === 0) {
    console.log('🎉 VERIFICACIÓN EN VIVO COMPLETADA CON ÉXITO SIN ERRORES.');
    process.exit(0);
  } else {
    console.error(`❌ VERIFICACIÓN COMPLETADA CON ${liveErrors} ERRORES/ADVERTENCIAS.`);
    process.exit(1);
  }
}

// Comprobamos si el servidor ya está corriendo en el 4321
const testRes = await checkUrl('http://localhost:4321/');
if (testRes.statusCode !== 0) {
  console.log('⚡ El servidor ya está corriendo. Iniciando verificación directa...');
  await runVerification();
} else {
  console.log('🚀 El servidor local no está corriendo. Levantando "astro preview" temporalmente...');
  const serverProcess = exec('npm run preview');
  
  // Esperar a que el servidor esté activo
  let attempts = 0;
  const maxAttempts = 15;
  let ready = false;
  
  while (attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 1000));
    const check = await checkUrl('http://localhost:4321/');
    if (check.statusCode !== 0) {
      ready = true;
      break;
    }
    attempts++;
  }
  
  if (ready) {
    console.log('⚡ Servidor temporal activo en http://localhost:4321/. Iniciando verificación...');
    try {
      await runVerification();
    } finally {
      console.log('🔌 Deteniendo servidor temporal...');
      serverProcess.kill();
    }
  } else {
    console.error('❌ ERROR: No se pudo levantar el servidor temporal de Astro en 15 segundos.');
    serverProcess.kill();
    process.exit(1);
  }
}
