import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { AsyncLocalStorage } from 'node:async_hooks';

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

              

  const config = getPipelineConfig();
  
  let provider = 'freellmapi';
  let model = 'auto';
  let temperature = 0.2;
  
  if (config) {
    if (phaseId && config.phases && config.phases[phaseId]) {
      const phaseConf = config.phases[phaseId];
      provider = phaseConf.provider || config.global.default_provider || 'freellmapi';
      model = phaseConf.model || 'auto';
      temperature = phaseConf.temperature !== undefined ? phaseConf.temperature : temperature;
    } else {
      provider = config.global.default_provider || 'freellmapi';
      model = 'auto';
    }
  }

  // Traducción de alias a modelos físicos para los proveedores de fallback
  const FALLBACK_MODELS = {
    gemini: {
      'auto:fast': 'gemini-2.5-flash',
      'auto:balanced': 'gemini-2.5-flash',
      'auto:smart': 'gemini-2.5-pro',
      'auto:reliable': 'gemini-2.5-pro',
      'auto': 'gemini-2.5-flash'
    },
    openrouter: {
      'auto:fast': 'google/gemini-2.5-flash',
      'auto:balanced': 'google/gemini-2.5-flash',
      'auto:smart': 'google/gemini-2.5-pro',
      'auto:reliable': 'google/gemini-2.5-pro',
      'auto': 'google/gemini-2.5-flash'
    },
    groq: {
      'auto:fast': 'llama-3.1-8b-instant',
      'auto:balanced': 'llama-3.3-70b-specdec',
      'auto:smart': 'llama-3.3-70b-specdec',
      'auto:reliable': 'llama-3.3-70b-specdec',
      'auto': 'llama-3.3-70b-specdec'
    }
  };

  const getFallbackModel = (prov, alias) => {
    if (alias.startsWith('auto') && FALLBACK_MODELS[prov] && FALLBACK_MODELS[prov][alias]) {
      return FALLBACK_MODELS[prov][alias];
    }
    const cleaned = alias.includes('/') ? alias.split('/').pop() : alias;
    
    // Asegurar compatibilidad física del modelo con el proveedor de fallback
    if (prov === 'gemini') {
      if (cleaned.includes('pro') || cleaned.includes('high') || cleaned.includes('smart') || cleaned.includes('reliable')) {
        return 'gemini-2.5-pro';
      }
      return 'gemini-2.5-flash';
    }
    if (prov === 'groq' && !cleaned.startsWith('llama') && !cleaned.startsWith('mixtral') && !cleaned.startsWith('gemma')) {
      return 'llama-3.3-70b-specdec';
    }
    if (prov === 'openrouter' && !cleaned.includes('/')) {
      if (cleaned.startsWith('gemini') || cleaned.startsWith('gemma')) {
        return `google/${cleaned}`;
      }
      if (cleaned.startsWith('llama')) {
        return `meta-llama/${cleaned}-instruct`;
      }
      if (cleaned.startsWith('mistral') || cleaned.startsWith('mixtral') || cleaned.startsWith('codestral')) {
        return `mistralai/${cleaned}`;
      }
      if (cleaned.startsWith('qwen')) {
        return `qwen/${cleaned}`;
      }
      if (cleaned.startsWith('deepseek')) {
        return `deepseek/${cleaned}`;
      }
      return `google/${cleaned}`;
    }
    return cleaned;
  };

  // 0. Intentar usar FreeLLMAPI local si el proveedor es freellmapi
  const freeLlmApiKey = process.env.FREELLMAPI_API_KEY;
  const freeLlmBaseUrl = process.env.FREELLMAPI_BASE_URL || 'http://localhost:3001/v1';
  if (provider === 'freellmapi' && freeLlmApiKey) {
    console.log(`[FreeLLMAPI] ⚡ [Fase ${phaseId || 'Global'}] Despachando inferencia (Modelo: ${model} | Temp: ${temperature})`);
    const { signal: activeSignal, cleanup } = createController(90000, externalSignal);
    try {
      let response = await fetchWithRetry(`${freeLlmBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${freeLlmApiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: promptText }],
          temperature: temperature,
          response_format: { type: 'json_object' }
        }),
        signal: activeSignal
      });

      if (!response.ok && (response.status === 429 || response.status === 404)) {
        const errText = await response.text();
        console.warn(`[FreeLLMAPI] ⚠️ Error ${response.status} llamando a ${model}. Reintentando con enrutamiento 'auto'...`);
        response = await fetchWithRetry(`${freeLlmBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${freeLlmApiKey}`
          },
          body: JSON.stringify({
            model: 'auto',
            messages: [{ role: 'user', content: promptText }],
            temperature: temperature,
            response_format: { type: 'json_object' }
          }),
          signal: activeSignal
        });
      }
      cleanup();

      if (response.ok) {
        const data = await response.json();
        const resolvedModelName = data?._routed_via ? `${data._routed_via.platform}/${data._routed_via.model}` : model;
        console.log(`[FreeLLMAPI] ✨ [Fase ${phaseId || 'Global'}] Completado con éxito ➔ Enrutado vía: ${resolvedModelName}`);
        
        let actualProvider = 'freellmapi';
        let actualModel = model;
        if (data?._routed_via) {
          actualProvider = data._routed_via.platform || 'freellmapi';
          actualModel = data._routed_via.model || model;
        }

        global.lastInferenceTelemetry = {
          provider: actualProvider,
          model: actualModel,
          durationMs: Date.now() - tStartCall
        };

        const rawText = data?.choices?.[0]?.message?.content || '';
        const cleanText = rawText.trim();
        const extracted = extractJson(cleanText);
        if (extracted) return JSON.parse(extracted);
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      } else {
        const errBody = await response.text();
        console.warn(`[FreeLLMAPI] ⚠️ HTTP ${response.status} - ${errBody.substring(0, 150)}`);
      }
    } catch (err) {
      cleanup();
      console.error(`[FreeLLMAPI] ❌ Error o Timeout en FreeLLMAPI: ${err.message}`);
      if (err.name === 'AbortError' || (externalSignal && externalSignal.aborted)) {
        throw err;
      }
    }
  }

  // 1. Intentar usar la API de Gemini directa de Google (Fallback 1)
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) {
    const physicalModel = getFallbackModel('gemini', model);
    console.log(`[Gemini API] ⚠️ [Fase ${phaseId || 'Global'}] Fallback a Gemini Directo (Modelo: ${physicalModel})`);
    const { signal: activeSignal, cleanup } = createController(15000, externalSignal);
    try {
      const response = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${physicalModel}:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { temperature: temperature, responseMimeType: 'application/json' }
        }),
        signal: activeSignal
      });
      cleanup();

      if (response.ok) {
        const data = await response.json();
        
        global.lastInferenceTelemetry = {
          provider: 'gemini',
          model: physicalModel,
          durationMs: Date.now() - tStartCall
        };

        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanText = rawText.trim();
        const extracted = extractJson(cleanText);
        if (extracted) return JSON.parse(extracted);
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      } else {
        const errBody = await response.text();
        console.warn(`[Gemini API] ⚠️ HTTP ${response.status} - ${errBody.substring(0, 150)}`);
      }
    } catch (err) {
      cleanup();
      console.error(`[Gemini API] ❌ Error en Gemini Directo: ${err.message}`);
      if (err.name === 'AbortError' || (externalSignal && externalSignal.aborted)) {
        throw err;
      }
    }
  }

  // 2. Fallback de OpenRouter
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    const physicalOpenRouterModel = getFallbackModel('openrouter', model);
    const modelsToTry = [physicalOpenRouterModel];
    if (!physicalOpenRouterModel.endsWith(':free')) {
      modelsToTry.push('meta-llama/llama-3-8b-instruct:free');
    }
    
    for (const mToTry of modelsToTry) {
      console.log(`[OpenRouter API] ⚠️ [Fase ${phaseId || 'Global'}] Fallback a OpenRouter (Modelo: ${mToTry})`);
      const { signal: activeSignal, cleanup } = createController(15000, externalSignal);
      try {
        const response = await fetchWithRetry('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openRouterKey}`,
            'HTTP-Referer': 'https://143-47-35-167.sslip.io',
            'X-Title': 'Matiza Engine'
          },
          body: JSON.stringify({
            model: mToTry,
            messages: [{ role: 'user', content: promptText }],
            temperature: temperature,
            response_format: { type: 'json_object' }
          }),
          signal: activeSignal
        });
        await new Promise(r => setTimeout(r, 100)); // gap para evitar rate-limits de ráfaga
        cleanup();

        if (response.ok) {
          const data = await response.json();
          
          global.lastInferenceTelemetry = {
            provider: 'openrouter',
            model: mToTry,
            durationMs: Date.now() - tStartCall
          };

          const rawText = data?.choices?.[0]?.message?.content || '';
          const cleanText = rawText.trim();
          const extracted = extractJson(cleanText);
          if (extracted) return JSON.parse(extracted);
          const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
          if (jsonMatch) return JSON.parse(jsonMatch[0]);
        } else {
          const errText = await response.text();
          console.warn(`[OpenRouter API Fallback] ⚠️ HTTP ${response.status} al llamar a ${mToTry}. Error: ${errText.substring(0, 150)}`);
          if (response.status === 402 && mToTry !== modelsToTry[modelsToTry.length - 1]) {
            console.log(`[OpenRouter API Fallback] Intentando con el modelo gratuito de OpenRouter de respaldo...`);
            continue;
          }
        }
      } catch (err) {
        cleanup();
        console.warn(`[OpenRouter API Fallback] ⚠️ Error al conectar: ${err.message}`);
        if (err.name === 'AbortError' || (externalSignal && externalSignal.aborted)) {
          throw err;
        }
      }
    }
  }

  // 3. Fallback de Groq
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const groqModel = getFallbackModel('groq', model);
    console.log(`[Groq API] ⚠️ [Fase ${phaseId || 'Global'}] Fallback a Groq (Modelo: ${groqModel})`);
    const { signal: activeSignal, cleanup } = createController(15000, externalSignal);
    try {
      const response = await fetchWithRetry('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [{ role: 'user', content: promptText }],
          temperature: temperature,
          response_format: { type: 'json_object' }
        }),
        signal: activeSignal
      });
      cleanup();

      if (response.ok) {
        const data = await response.json();
        
        global.lastInferenceTelemetry = {
          provider: 'groq',
          model: groqModel,
          durationMs: Date.now() - tStartCall
        };

        const rawText = data?.choices?.[0]?.message?.content || '';
        const cleanText = rawText.trim();
        const extracted = extractJson(cleanText);
        if (extracted) return JSON.parse(extracted);
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      } else {
        const errText = await response.text();
        console.warn(`[Groq API Fallback] ⚠️ HTTP ${response.status}. Error: ${errText.substring(0, 150)}`);
      }
    } catch (err) {
      cleanup();
      console.warn(`[Groq API Fallback] ⚠️ Error en Groq: ${err.message}`);
      if (err.name === 'AbortError' || (externalSignal && externalSignal.aborted)) {
        throw err;
      }
    }
  }

  global.lastInferenceTelemetry = null;
  throw new Error('Todos los proveedores de inferencia (Gemini, OpenRouter, Groq) han fallado o no tienen API Key.');
}
