// reply-bot.js — Módulo de respuesta "tipo humano" para matiza (anti-ban, gratis)
// Autor: Hermes (diseño ligero). Integrable por Antigravity en radar-cron.js tras el scrapeo.
// NO usa APIs de pago. Depende de sesiones logueadas persistentes (Playwright / instaloader)
// guardadas en /home/ubuntu/db/matiza/ (con fallback a /home/ubuntu/db/matiza/ si existe).
//
// Estrategia anti-detección (basada en investigación 2026):
//   1. Warming obligatorio: no comenta hasta que pasen N días desde alta de la cuenta.
//   2. Jitter: espera aleatoria entre comentarios (nunca intervalo fijo / metrónomo).
//   3. Límite diario bajo: pocos comentarios/día (cuentas nuevas mucho menos).
//   4. Respuesta ÚNICA por post: variación de plantilla + enlace envuelto en contexto (nunca link pelado).
//   5. Una sola cuenta por red (evita "coordinated behavior").
//   6. Solo responde a posts MUY virales Y relevantes para matiza (filtro natural de volumen).

import fs from 'node:fs';
import path from 'node:path';

const DB_DIR = process.env.MATIZA_DB_DIR || (fs.existsSync('/home/ubuntu/db/matiza') ? '/home/ubuntu/db/matiza' : '/home/ubuntu/db/matiza');
const STATE_FILE = path.join(DB_DIR, 'reply_state.json');
const PUBLIC_BASE = (process.env.PUBLIC_BASE_PATH && process.env.PUBLIC_BASE_PATH.startsWith('http')) 
  ? process.env.PUBLIC_BASE_PATH 
  : 'https://143-47-35-167.sslip.io' + (process.env.PUBLIC_BASE_PATH || '/pro/matiza');

// Config por plataforma. warmDays = días mínimos de cuenta antes de comentar.
const PLATFORMS = {
  Instagram: { enabled: true,  warmDays: 21, dailyLimitNew: 5,  dailyLimitOld: 20, minVirality: 8.0, jitterMin: 30,  jitterMax: 540 },
  TikTok:     { enabled: true,  warmDays: 21, dailyLimitNew: 3,  dailyLimitOld: 12, minVirality: 8.5, jitterMin: 45,  jitterMax: 600 },
  X:          { enabled: true,  warmDays: 10, dailyLimitNew: 4,  dailyLimitOld: 18, minVirality: 8.0, jitterMin: 60,  jitterMax: 720 },
};

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch { return { accounts: {}, lastResetDate: today() }; }
}
function saveState(s) { fs.mkdirSync(DB_DIR, { recursive: true }); fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2)); }
function today() { return new Date().toISOString().slice(0, 10); }
function isNewAccount(platform, state) {
  const acc = state.accounts[platform];
  if (!acc || !acc.warmStartDate) return true;
  const days = (Date.now() - new Date(acc.warmStartDate).getTime()) / 86400000;
  return days < PLATFORMS[platform].warmDays;
}
function rollDaily(state) {
  if (state.lastResetDate !== today()) {
    for (const p of Object.keys(state.accounts)) state.accounts[p].count = 0;
    state.lastResetDate = today();
  }
}

// ¿Debe responder a este item? Devuelve {ok, reason}
function shouldReply(item, viralityScore, suggestedTopic, state) {
  const cfg = PLATFORMS[item.platform];
  if (!cfg || !cfg.enabled) return { ok: false, reason: 'plataforma no habilitada' };
  rollDaily(state);
  const acc = state.accounts[item.platform] || (state.accounts[item.platform] = { count: 0 });
  if (isNewAccount(item.platform, state)) return { ok: false, reason: `cuenta en warming (${cfg.warmDays} días)` };
  if (viralityScore < cfg.minVirality) return { ok: false, reason: 'virality insuficiente' };
  const limit = isNewAccount(item.platform, state) ? cfg.dailyLimitNew : cfg.dailyLimitOld;
  if (acc.count >= limit) return { ok: false, reason: 'límite diario alcanzado' };
  if (acc.lastReplyAt && (Date.now() - acc.lastReplyAt) < cfg.jitterMin * 1000) return { ok: false, reason: 'jitter mínimo no cumplido' };
  return { ok: true, reason: 'ok', jitterMax: cfg.jitterMax, jitterMin: cfg.jitterMin };
}

// Genera respuesta ÚNICA por post (variación de plantillas + enlace en contexto)
function buildReply(item, suggestedTopic, slug) {
  const url = `${PUBLIC_BASE}/${slug || item.id}`;
  const variants = [
    (t) => `Ojo con esto, lo verificamos aquí 👉 ${url}`,
    (t) => `Esto tiene contexto que falta, lo desmentimos en ${url}`,
    (t) => `No es tan simple como parece, te lo explicamos: ${url}`,
    (t) => `Cuidado, hay datos que faltan. Nuestra verificación: ${url}`,
    (t) => `Antes de compartir, mira la realidad de este caso: ${url}`,
  ];
  const pick = variants[Math.floor(Math.random() * variants.length)];
  return pick(suggestedTopic);
}

// Envía el comentario usando la sesión persistente logueada (stub; requiere sesión real).
// No se ejecuta si no existe el session_file -> evita comentarios anónimos (señal de bot).
function sendReply(item, text) {
  const sessionPath = path.join(DB_DIR, `${item.platform.toLowerCase()}_session`);
  if (!fs.existsSync(sessionPath)) {
    return { sent: false, error: `falta sesión logueada en ${sessionPath}` };
  }
  // Antigravity debe completar esto con Playwright persistent_context logueado por plataforma.
  // Ejemplo IG/TikTok/X: abrir sesión, navegar a item.link, escribir text, publicar, cerrar.
  console.log(`[reply-bot] (stub) ${item.platform} -> ${item.link}\n  "${text}"`);
  return { sent: true, stub: true };
}

// Punto de entrada para radar-cron.js: dado un item ya insertado, decide y responde.
function maybeReply(item, viralityScore, suggestedTopic, slug) {
  const state = loadState();
  const decision = shouldReply(item, viralityScore, suggestedTopic, state);
  if (!decision.ok) return decision;
  const text = buildReply(item, suggestedTopic, slug);
  const res = sendReply(item, text);
  if (res.sent) {
    const acc = state.accounts[item.platform];
    acc.count = (acc.count || 0) + 1;
    acc.lastReplyAt = Date.now();
    saveState(state);
  }
  return { ok: res.sent, reason: res.sent ? 'comentario enviado' : res.error, text, jitterMax: decision.jitterMax };
}

export { shouldReply, buildReply, sendReply, maybeReply, PLATFORMS };

// Auto-test si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const item = { platform: 'Instagram', link: 'https://instagram.com/p/abc', id: 'ig-abc' };
  const st = loadState();
  st.accounts.Instagram = { count: 0, warmStartDate: '2026-01-01', lastReplyAt: 0 };
  const d = shouldReply(item, 9.0, 'Inmigración', st);
  console.log('decision:', d);
  if (d.ok) console.log('respuesta:', buildReply(item, 'Inmigración', 'ig-abc'));
}
