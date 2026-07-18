import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { execSync, exec } from 'node:child_process';
import { promisify } from 'node:util';
import { AsyncLocalStorage } from 'node:async_hooks';
const execPromise = promisify(exec);

// Cargar variables de entorno del archivo .env de forma manual y robusta si existe
try {
  const currentDir = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
  const envPath = path.join(currentDir, '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    for (const line of envConfig.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        // Quitar comillas si las tiene
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        if (!process.env[key]) {
          process.env[key] = val.trim();
        }
      }
    }
  }
} catch (e) {
  console.error('[Config] Error cargando .env local:', e.message);
}

// Redirigir consola a un archivo de log unificado para el panel de administración
const logFile = path.resolve('data/logs/pipeline.log');
try {
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
} catch (e) {}

const originalLog = console.log;
const originalError = console.error;

function appendToLogFile(type, args) {
  const timestamp = new Date().toISOString();
  const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
  const logLine = `[${timestamp}] [${type}] ${message}\n`;
  try {
    fs.appendFileSync(logFile, logLine, 'utf8');
  } catch (e) {}
}

export const asyncLocalStorage = new AsyncLocalStorage();

console.log = function(...args) {
  const store = asyncLocalStorage.getStore();
  const prefix = store && store.itemId ? `[Item: ${store.itemId}] ` : '';
  const modifiedArgs = prefix && args.length > 0 && typeof args[0] === 'string'
    ? [prefix + args[0], ...args.slice(1)]
    : args;
  originalLog.apply(console, modifiedArgs);
  appendToLogFile('INFO', modifiedArgs);
};

console.error = function(...args) {
  const store = asyncLocalStorage.getStore();
  const prefix = store && store.itemId ? `[Item: ${store.itemId}] ` : '';
  const modifiedArgs = prefix && args.length > 0 && typeof args[0] === 'string'
    ? [prefix + args[0], ...args.slice(1)]
    : args;
  originalError.apply(console, modifiedArgs);
  appendToLogFile('ERROR', modifiedArgs);
};

let resolvedDbPath = process.env.MATIZA_DB_PATH || process.env.SQLITE_DB_PATH || process.env.NEWNEWS_DB_PATH || path.resolve('data/matiza.db');
if (!fs.existsSync(resolvedDbPath)) {
  resolvedDbPath = path.resolve('data/matiza.db');
}
export const dbPath = resolvedDbPath;

export function loadEnv() {
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    lines.forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        process.env[key] = value.trim();
      }
    });
  }
}

loadEnv();

let cachedDb = null;

export function getDb(forceNew = false) {
  if (cachedDb && !forceNew) {
    return cachedDb;
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA busy_timeout = 5000;');
  db.exec('PRAGMA journal_mode = WAL;');

  if (!forceNew) {
    const originalClose = db.close.bind(db);
    db.close = () => {
      // no-op to reuse shared connection
    };
    db.forceClose = () => {
      originalClose();
      cachedDb = null;
    };
    cachedDb = db;
  }

  return db;
}

// Cargar la configuración dinámica del pipeline editable por el usuario en el admin
export function getPipelineConfig() {
  const configPath = path.resolve('pipeline_config.json');
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {
      console.error('[Config] Error parseando pipeline_config.json, usando valores por defecto:', e.message);
    }
  }
  return null;
}

export function extractJson(text) {
  if (!text) return null;
  const startIdx = text.indexOf('{');
  if (startIdx === -1) return null;
  
  let braceCount = 0;
  let inString = false;
  let escapeNext = false;
  
  for (let i = startIdx; i < text.length; i++) {
    const char = text[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          return text.substring(startIdx, i + 1);
        }
      }
    }
  }
  return null;
}

export function sanitizeJsonString(str) {
  if (!str) return "";
  let result = "";
  let inString = false;
  let escapeNext = false;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (escapeNext) {
      result += char;
      escapeNext = false;
      continue;
    }
    if (char === "\\") {
      result += char;
      escapeNext = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }
    if (inString) {
      if (char === "\n") {
        result += "\\n";
      } else if (char === "\r") {
        result += "\\r";
      } else if (char === "\t") {
        result += "\\t";
      } else if (char.charCodeAt(0) < 32) {
        result += "\\u" + ("0000" + char.charCodeAt(0).toString(16)).slice(-4);
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }
  return result;
}

// Helper de fetch con reintentos para errores transitorios
async function fetchWithRetry(url, options, maxRetries = 3, initialDelay = 500) {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      // Si la respuesta es de reintento (429, 5xx), lanzar error para reintentar
      if (!response.ok && (response.status === 429 || response.status >= 500)) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }
      return response;
    } catch (err) {
      const isAborted = err.name === 'AbortError' || (options.signal && options.signal.aborted);
      if (isAborted || attempt === maxRetries) {
        throw err;
      }
      console.warn(`[Inference Retry] Intento ${attempt} fallido para ${url}: ${err.message}. Reintentando en ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

export function createController(timeoutMs, externalSignal) {
  const controller = new AbortController();
  let timeoutId = null;
  let onAbort = null;
  if (timeoutMs) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort(externalSignal.reason);
    } else {
      onAbort = () => controller.abort(externalSignal.reason);
      externalSignal.addEventListener('abort', onAbort);
    }
  }
  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (externalSignal && onAbort) {
      externalSignal.removeEventListener('abort', onAbort);
      onAbort = null;
    }
  };
  return { signal: controller.signal, cleanup };
}

let inferenceQueuePromise = Promise.resolve();

export async function callGemini(promptText, phaseId = null, options = {}) {
  const tStartCall = Date.now();
  
  let externalSignal = null;
  if (options instanceof AbortSignal) {
    externalSignal = options;
  } else if (options && options.signal) {
    externalSignal = options.signal;
  }

  if (externalSignal && externalSignal.aborted) {
    const abortErr = new Error('The user aborted a request.');
    abortErr.name = 'AbortError';
    throw abortErr;
  }

  // Esperar turno en la cola de inferencia local para evitar rate limits
  await new Promise(resolve => {
    inferenceQueuePromise = inferenceQueuePromise.then(async () => {
      resolve();
      await new Promise(r => setTimeout(r, 5000));
    }).catch(() => {
      resolve();
    });
  });

  const config = getPipelineConfig();
  let temperature = 0.2;
  
  if (config && phaseId && config.phases && config.phases[phaseId]) {
    const phaseConf = config.phases[phaseId];
    temperature = phaseConf.temperature !== undefined ? phaseConf.temperature : temperature;
  }

  console.log(`[Antigravity IA Local] ⚡ [Fase ${phaseId || 'Global'}] Intentando API local de Antigravity (puerto 3010)...`);

  try {
    if (process.env.USE_OFFLINE_DISK === 'true') {
      throw new Error('Forzando uso directo de disco offline por configuracion');
    }
    const payload = {
      model: 'google/gemma-4-26b-a4b-it:free',
      max_tokens: 4096,
      messages: [{ role: 'user', content: promptText }]
    };

    const fetchController = new AbortController();
    const timeoutId = setTimeout(() => fetchController.abort(), 90000); // 90 segundos de timeout
    
    let activeSignal = fetchController.signal;
    if (externalSignal) {
      // Si el usuario cancela externamente, abortamos la peticion
      externalSignal.addEventListener('abort', () => fetchController.abort());
      if (externalSignal.aborted) {
        fetchController.abort();
      }
    }

    let response = null;
    let attempts = 0;
    const maxAttempts = 12;
    let delayMs = 5000;

    while (attempts < maxAttempts) {
      try {
        const responseAttempt = await fetch('http://127.0.0.1:3010/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: activeSignal
        });

        if (responseAttempt.status === 429) {
          attempts++;
          console.log(`[Antigravity IA Local] ⚠️ Rate limit (429) en intento ${attempts}/${maxAttempts}. Esperando ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          delayMs *= 1.5; // Backoff exponencial
          continue;
        }

        response = responseAttempt;
        break;
      } catch (err) {
        // Si hay un error de red y no hemos superado los intentos, reintentar
        attempts++;
        if (attempts >= maxAttempts) {
          throw err;
        }
        console.log(`[Antigravity IA Local] ⚠️ Error de red en intento ${attempts}/${maxAttempts}: ${err.message}. Reintentando en ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 1.5;
      }
    }

    clearTimeout(timeoutId);

    if (!response) {
      throw new Error(`Superado el maximo de reintentos por Rate Limit (429)`);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text || '';
    const cleanText = rawText.trim();

    global.lastInferenceTelemetry = {
      provider: 'antigravity-api',
      model: 'gemma-4-26b',
      durationMs: Date.now() - tStartCall
    };

    const extracted = extractJson(cleanText);
    if (extracted) {
      try {
        return JSON.parse(sanitizeJsonString(extracted));
      } catch (e) {
        console.warn(`[Antigravity IA Local] Fallo al parsear extracted JSON saneado, intentando JSON match...`);
      }
    }
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(sanitizeJsonString(jsonMatch[0]));
      } catch (e) {
        console.warn(`[Antigravity IA Local] Fallo al parsear jsonMatch saneado:`, e.message);
      }
    }
    return cleanText;

  } catch (apiErr) {
    console.log(`[Antigravity IA Local] ⚠️ API local falló (${apiErr.message}). Usando fallback offline por disco...`);

    const scratchDir = path.resolve('scratch');
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }

    // Generar archivos de peticion y respuesta offline
    const reqFile = path.join(scratchDir, `ia_request_${Date.now()}_${Math.floor(Math.random() * 1000)}.json`);
    const resFile = reqFile.replace('ia_request_', 'ia_response_');
    
    try {
      const requestData = {
        prompt: promptText,
        temperature,
        phase: phaseId,
        created_at: new Date().toISOString()
      };
      
      fs.writeFileSync(reqFile, JSON.stringify(requestData, null, 2), 'utf-8');
      console.log(`[Antigravity IA Local] 📂 Archivo escrito: ${path.basename(reqFile)}. Esperando respuesta del chat...`);
      
      // Polling síncrono esperando a que el agente del chat/usuario escriba la respuesta en disco
      let responseData = null;
      const timeoutMs = 600000;
      const startPoll = Date.now();
      
      while (Date.now() - startPoll < timeoutMs) {
        if (fs.existsSync(resFile)) {
          const content = fs.readFileSync(resFile, 'utf-8');
          if (content.trim()) {
            try {
              responseData = JSON.parse(content);
              break;
            } catch (e) {
              // Esperar a que se termine de escribir
            }
          }
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Limpieza de archivos procesados
      try { if (fs.existsSync(reqFile)) fs.unlinkSync(reqFile); } catch (e) {}
      try { if (fs.existsSync(resFile)) fs.unlinkSync(resFile); } catch (e) {}
      
      if (!responseData) {
        throw new Error(`Timeout esperando respuesta offline de Antigravity (${path.basename(resFile)})`);
      }
      
      const rawText = responseData.response || responseData.choices?.[0]?.message?.content || '';
      const cleanText = rawText.trim();
      
      global.lastInferenceTelemetry = {
        provider: 'antigravity-offline',
        model: 'chat-offline',
        durationMs: Date.now() - tStartCall
      };

      const extracted = extractJson(cleanText);
      if (extracted) return JSON.parse(extracted);
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return cleanText;

    } catch (fallbackErr) {
      try { if (fs.existsSync(reqFile)) fs.unlinkSync(reqFile); } catch (e) {}
      try { if (fs.existsSync(resFile)) fs.unlinkSync(resFile); } catch (e) {}
      console.error(`[Antigravity IA Local] ❌ Error en el sistema de disco offline: ${fallbackErr.message}`);
      throw fallbackErr;
    }
  }
}
