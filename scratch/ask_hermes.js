import http from 'node:http';
import fs from 'node:fs';

const promptText = `Hermes, el usuario me ha pedido investigar cómo conseguir el enlace original real de Instagram y su multimedia usando Playwright Chromium de forma robusta para evitar bloqueos y fallos de Instaloader. ¿Qué técnica, selectores o pasos de Playwright usas tú en el agente de Hermes para extraer posts de Instagram, descargar su imagen/video real y pintar el enlace original de Instagram en el layout? Dame el código, los selectores de Playwright exactos y las mejores prácticas.`;

const postData = JSON.stringify({
  model: "hermes-agent",
  messages: [{ role: "user", content: promptText }],
  stream: false
});

let apiKey = process.env.API_SERVER_KEY || '';

// Intentar leer el env de Hermes en la VPS
try {
  const envContent = fs.readFileSync('/home/ubuntu/.hermes/.env', 'utf8');
  const match = envContent.match(/^API_SERVER_KEY=(.*)$/m);
  if (match) {
    apiKey = match[1].trim().replace(/^['"]|['"]$/g, '');
  }
} catch (e) {
  // Ignorar si no existe (por ejemplo, en local)
}

const headers = {
  'Content-Type': 'application/json',
  'Content-Length': Buffer.byteLength(postData)
};

if (apiKey) {
  headers['Authorization'] = `Bearer ${apiKey}`;
}

const options = {
  hostname: '127.0.0.1',
  port: 8642,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: headers,
  timeout: 90000
};

console.log("🤖 Consultando a Hermes en la VPS (localhost:8642)...");

const req = http.request(options, (res) => {
  let body = '';
  res.setEncoding('utf8');
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.error(`❌ HTTP Status ${res.statusCode}: ${body}`);
      process.exit(1);
    }
    try {
      const data = JSON.parse(body);
      const content = data.choices[0].message.content;
      console.log("\n💬 [RESPUESTA DE HERMES]:\n");
      console.log(content);
    } catch (e) {
      console.error("❌ Fallo al parsear respuesta JSON:", e.message);
      console.log(body);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Error de conexión: ${e.message}`);
});

req.write(postData);
req.end();
