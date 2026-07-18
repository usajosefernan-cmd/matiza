import fs from 'node:fs';

let filePath = '/etc/nginx/sites-enabled/matiza';
if (!fs.existsSync(filePath)) {
  filePath = '/etc/nginx/sites-enabled/newnews';
}

if (!fs.existsSync(filePath)) {
  console.error(`❌ El archivo de configuración de Nginx no existe en este entorno (probadas rutas /matiza y /newnews).`);
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

if (content.includes('/pro/matiza') && content.includes('location /pro/matiza/')) {
  console.log('✅ La configuración de /pro/matiza ya existe en Nginx.');
  process.exit(0);
}

// Buscaremos la sección de /pro/matiza/ o /pro/newnews/ y su cierre
let targetStr = 'location /pro/matiza/ {';
if (!content.includes(targetStr)) {
  targetStr = 'location /pro/newnews/ {';
}
const index = content.indexOf(targetStr);

if (index === -1) {
  console.error('❌ No se encontró la directiva location /pro/matiza/ ni /pro/newnews/ en la configuración de Nginx.');
  process.exit(1);
}

// Encontrar la llave de cierre de este location
let openBraces = 0;
let closeIndex = -1;

for (let i = index; i < content.length; i++) {
  if (content[i] === '{') {
    openBraces++;
  } else if (content[i] === '}') {
    openBraces--;
    if (openBraces === 0) {
      closeIndex = i;
      break;
    }
  }
}

if (closeIndex === -1) {
  console.error(`❌ Error al parsear las llaves de cierre de ${targetStr}.`);
  process.exit(1);
}

const newLocation = `

    # Matiza proxy to Astro NodeJS SSR server running under PM2
    location = /pro/matiza {
        return 301 $scheme://$http_host/pro/matiza/;
    }
    location /pro/matiza/ {
        proxy_pass http://127.0.0.1:4323;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Buffer settings for SSE streaming logs
        proxy_buffering off;
        proxy_cache_bypass $http_upgrade;
    }`;

const updatedContent = content.slice(0, closeIndex + 1) + newLocation + content.slice(closeIndex + 1);

try {
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log('✅ Configuración de Nginx actualizada con éxito para /pro/matiza.');
} catch (err) {
  console.error('❌ Error al escribir el archivo de Nginx:', err.message);
  process.exit(1);
}
