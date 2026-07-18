// login_sessions.js v2 — Abre logins de IG/TikTok/X/FB en DISPLAY :99.
// Prefija el USUARIO desde /home/ubuntu/db/matiza/ o /home/ubuntu/db/matiza/ .credentials.json (no es secreto)
// y deja el campo de PASSWORD listo para que EL USUARIO teclee (no se teclea password por código).
// Tras el login manual, la sesión persistente queda guardada en la carpeta *_session.
// Uso: DISPLAY=:99 node scripts/login_sessions.js [red]   (red opcional: instagram|tiktok|x|facebook)

import { chromium } from 'playwright';
import fs from 'fs';

const BASE = fs.existsSync('/home/ubuntu/db/matiza') ? '/home/ubuntu/db/matiza' : '/home/ubuntu/db/matiza';
const CREDS = `${BASE}/.credentials.json`;
const WAIT_MS = Number(process.env.LOGIN_WAIT_MS || 240000); // 4 min por defecto

const NET = {
  instagram: { path: `${BASE}/instagram_session`, loginUrl: 'https://www.instagram.com/accounts/login/', userSel: 'input[name="username"]' },
  tiktok:    { path: `${BASE}/tiktok_session`,    loginUrl: 'https://www.tiktok.com/login',                       userSel: 'input[name="username"]' },
  x:         { path: `${BASE}/x_session`,         loginUrl: 'https://x.com/login',                                userSel: 'input[name="text"]' },
  facebook:  { path: `${BASE}/facebook_session`,  loginUrl: 'https://www.facebook.com/login',                    userSel: 'input[name="email"]' },
};

const onlyNet = process.argv[2];
const targets = onlyNet ? (NET[onlyNet] ? [[onlyNet, NET[onlyNet]]] : []) : Object.entries(NET);

function loadCreds() {
  try { return JSON.parse(fs.readFileSync(CREDS, 'utf8')); } catch { return {}; }
}
const creds = loadCreds();

async function openAndWait(key, s) {
  fs.mkdirSync(s.path, { recursive: true });
  const ctx = await chromium.launchPersistentContext(s.path, {
    headless: false,
    viewport: { width: 1100, height: 820 },
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-setuid-sandbox'],
    env: { ...process.env, DISPLAY: ':99' },
  });
  const page = await ctx.newPage();
  console.log(`[LOGIN] ${key}: abriendo ${s.loginUrl}`);
  await page.goto(s.loginUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log(`[LOGIN] ${key} goto:`, e.message));

  const c = creds[key] || {};
  if (c.user) {
    try {
      await page.waitForSelector(s.userSel, { timeout: 8000 });
      await page.fill(s.userSel, c.user);
      console.log(`[LOGIN] ${key}: usuario prefijado (${c.user.slice(0,3)}***).`);
    } catch (e) { console.log(`[LOGIN] ${key}: no pude prefijar usuario (${e.message})`); }
  }
  console.log(`[LOGIN] ${key}: >>> TECLA EL PASSWORD EN ESTA VENTANA Y PULSA ENTRAR (${WAIT_MS/1000}s) <<<`);
  // Esperar a que aparezca cookie de sesión O a que cambie la URL fuera de login
  let logged = false;
  const deadline = Date.now() + WAIT_MS;
  while (Date.now() < deadline) {
    const cookies = await ctx.cookies();
    const auth = cookies.find(c => /sessionid|session|auth_token|datr|ssid|sb=/i.test(c.name));
    if (auth) { logged = true; break; }
    await page.waitForTimeout(3000);
  }
  const cookies = await ctx.cookies();
  console.log(`[LOGIN] ${key}: ${logged ? 'LOGUEADO OK' : 'NO logueado'} | cookies=${cookies.length}`);
  await ctx.close();
  return logged;
}

let allOk = true;
for (const [k, s] of targets) {
  try { if (!await openAndWait(k, s)) allOk = false; }
  catch (e) { console.log(`[LOGIN] ${k} FALLO:`, e.message); allOk = false; }
}
console.log(allOk ? '[LOGIN] Todas las sesiones listas.' : '[LOGIN] Revisa las que fallaron.');
