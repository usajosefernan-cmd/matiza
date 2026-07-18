// infographic-system.js — SISTEMA VISUAL SVG de MATIZA (editorial monocromo, mobile-first, recortable por partes)
// Autor: Hermes. Reemplaza el infographic_svg frágil de 08-article-writer.js.
//
// FILOSOFÍA (feedback del usuario):
//   • MOBILE-FIRST: ancho base 390px (iPhone). Todo el layout y la tipografía se diseñan a esa
//     referencia y se escalan con el factor s = width/390. Se lee y se pega nativamente en el móvil.
//   • CERO color → paleta neutra (tinta/gris). Estilo "data-journalism" (NYT / The Economist / The Pudding).
//   • Fondo TRANSPARENTE en cada pieza → se recorta y se pega por partes, no un bloque 16:9 pegado entero.
//   • "Explicado por partes": cada infografía son fragmentos autónomos (01 El bulo · 02 El contexto ·
//     03 Los datos · 04 El veredicto) que se leen y se pegan por separado.
//   • Determinista y local (sin LLM → ahorra tokens). Cuando llegue el OAuth de OpenAI, generateInfographic()
//     puede enchufar GPT (gratis vía OAuth) para producir el SVG explicado por partes; el renderer local es
//     el fallback/placeholder hasta entonces.
//
// Uso:
//   import { buildInfographic, generateInfographic, exportParts } from './infographic-system.js';
//   const { parts } = buildInfographic(data);                       // móvil por defecto (390px)
//   const { parts } = buildInfographic(data, { width: 1080 });      // export social (escala x, retina)
//   await exportParts(data, '/tmp/parts');                          // vuelca .svg + .png por parte

const BASE_W = 390;   // ancho de referencia MÓVIL (iPhone). Todo se escala desde aquí.

export const MATIZA_TOKENS = {
  ink: '#111111',     // tinta principal
  ink2: '#3F3F46',    // tinta secundaria
  gray: '#737373',    // gris medio (etiquetas)
  grayL: '#A3A3A3',   // gris claro (watermarks)
  line: '#E7E7E7',    // línea fina divisoria
  serif: "Georgia,'Times New Roman','Noto Serif',serif",
  sans: "'Inter','Helvetica Neue',Arial,system-ui,sans-serif",
};

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
function wrap(text, max) {
  const words = String(text).split(/\s+/);
  const lines = []; let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur.trim()); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4);
}
function defs(t, s) {
  return `<defs>
    <pattern id="hatch" width="${9 * s}" height="${9 * s}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="${9 * s}" stroke="${t.ink}" stroke-width="${1 * s}" opacity="0.09"/>
    </pattern>
    <pattern id="hatchT" width="${9 * s}" height="${9 * s}" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
      <line x1="0" y1="0" x2="0" y2="${9 * s}" stroke="${t.ink}" stroke-width="${1 * s}" opacity="0.06"/>
    </pattern>
  </defs>`;
}

// ============ API PRINCIPAL ============
export function buildInfographic(data, opts = {}) {
  const t = { ...MATIZA_TOKENS, ...(opts.tokens || {}) };
  const W = opts.width || BASE_W;
  const s = W / BASE_W;                 // factor de escala desde la referencia móvil
  const MX = 20 * s;                    // margen X
  const PART_H = Math.round((opts.partHeight || 205) * s);

  // ---- cabecera compartida de cada fragmento ----
  function head(num, label, accentW) {
    return `
    <text x="${MX}" y="${60 * s}" font-family="${t.serif}" font-size="${48 * s}" font-weight="700" fill="${t.line}">${num}</text>
    <text x="${MX + 56 * s}" y="${37 * s}" font-family="${t.sans}" font-size="${11 * s}" font-weight="800" letter-spacing="${2.5 * s}" fill="${t.gray}">${esc(label.toUpperCase())}</text>
    <line x1="${MX + 56 * s}" y1="${47 * s}" x2="${MX + 56 * s + accentW * s}" y2="${47 * s}" stroke="${t.ink}" stroke-width="${3 * s}" stroke-linecap="round"/>
    <line x1="${MX}" y1="${PART_H - 18 * s}" x2="${W - MX}" y2="${PART_H - 18 * s}" stroke="${t.line}" stroke-width="${1 * s}"/>`;
  }
  // sello timbre (monocromo): false ✕ / true ✓
  function stamp(cx, cy, kind) {
    const g = kind === 'false'
      ? `<path d="M${-9 * s},${-9 * s} L${9 * s},${9 * s} M${9 * s},${-9 * s} L${-9 * s},${9 * s}" stroke="${t.ink}" stroke-width="${2.6 * s}" stroke-linecap="round"/>`
      : `<path d="M${-10 * s},0 L${-3 * s},${7 * s} L${10 * s},${-9 * s}" fill="none" stroke="${t.ink}" stroke-width="${2.6 * s}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const txt = kind === 'false' ? 'FALSO' : 'VERDAD';
    return `<g transform="translate(${cx},${cy})">
    <circle cx="0" cy="0" r="${19 * s}" fill="none" stroke="${t.ink}" stroke-width="${2.4 * s}"/>
    ${g}
    <text x="0" y="${44 * s}" text-anchor="middle" font-family="${t.sans}" font-size="${10.5 * s}" font-weight="800" letter-spacing="${2 * s}" fill="${t.ink}">${txt}</text>
  </g>`;
  }

  // ---- FRAGMENTOS (cada uno devuelve el <g> interior, transparente) ----
  function fragBulo() {
    const lines = wrap(data.claim || 'Afirmación viral', 30);
    const body = lines.map((l, i) =>
      `<text x="${MX + 56 * s}" y="${78 * s + i * 22 * s}" font-family="${t.sans}" font-size="${15.5 * s}" font-weight="500" fill="${t.ink}">${esc(l)}</text>`).join('\n    ');
    return `<g>
    <rect x="0" y="0" width="${W}" height="${PART_H}" fill="url(#hatch)"/>
    ${head('01', 'El bulo', 56)}
    ${body}
    ${stamp(W - 30 * s, 34 * s, 'false')}
  </g>`;
  }
  function fragContext() {
    const txt = data.trick_used || data.why || data.what_is_false || 'Por qué engaña';
    const lines = wrap(txt, 38);
    const body = lines.map((l, i) =>
      `<text x="${MX + 56 * s}" y="${78 * s + i * 22 * s}" font-family="${t.sans}" font-size="${15 * s}" font-weight="400" fill="${t.ink2}">${esc(l)}</text>`).join('\n    ');
    const tech = data.trick_label
      ? `<text x="${MX + 56 * s}" y="${PART_H - 36 * s}" font-family="${t.sans}" font-size="${11 * s}" font-weight="700" letter-spacing="${1.5 * s}" fill="${t.gray}">↳ TÉCNICA: ${esc(data.trick_label.toUpperCase())}</text>`
      : '';
    return `<g>
    ${head('02', 'El contexto', 92)}
    ${body}
    ${tech}
  </g>`;
  }
  function fragData() {
    const items = (Array.isArray(data.sources) && data.sources.length)
      ? data.sources
      : (data.data_points || ['Fuente original: sin verificar', 'Fecha: no confirmada', 'Ley citada: inexistente']);
    const rows = items.slice(0, 4).map((it, i) => {
      const [k, ...rest] = String(it).split(':');
      const v = rest.join(':').trim();
      const y = 78 * s + i * 26 * s;
      const kw = k.length * 8.5 * s;
      return `<path d="M${MX + 56 * s},${y - 12 * s} L${MX + 62 * s},${y - 2 * s} L${MX + 68 * s},${y - 12 * s}" fill="none" stroke="${t.grayL}" stroke-width="${1.4 * s}"/>
      <text x="${MX + 76 * s}" y="${y - 2 * s}" font-family="${t.sans}" font-size="${13.5 * s}" font-weight="700" fill="${t.ink}">${esc(k)}</text>
      <text x="${MX + 76 * s + kw}" y="${y - 2 * s}" font-family="${t.sans}" font-size="${13.5 * s}" font-weight="400" fill="${t.gray}">${esc(': ' + v)}</text>`;
    }).join('\n    ');
    return `<g>
    ${head('03', 'Los datos', 78)}
    ${rows}
  </g>`;
  }
  function fragVerdict() {
    const lines = wrap(data.what_is_true || 'Dato verificado', 30);
    const body = lines.map((l, i) =>
      `<text x="${MX + 56 * s}" y="${76 * s + i * 22 * s}" font-family="${t.sans}" font-size="${15.5 * s}" font-weight="500" fill="${t.ink}">${esc(l)}</text>`).join('\n    ');
    const score = data.matiza_score;
    const scoreTxt = (score != null)
      ? `<text x="${W - MX}" y="${42 * s}" text-anchor="end" font-family="${t.serif}" font-size="${33 * s}" font-weight="700" fill="${t.ink}">${score}<tspan font-family="${t.sans}" font-size="${13 * s}" fill="${t.gray}">/100</tspan></text>
       <text x="${W - MX}" y="${58 * s}" text-anchor="end" font-family="${t.sans}" font-size="${10 * s}" font-weight="700" letter-spacing="${2 * s}" fill="${t.gray}">MATIZA SCORE</text>`
      : '';
    const tag = data.emoji_tag ? esc(data.emoji_tag.replace(/^[^ ]+ /, '')) : '';
    const tagTxt = tag ? `<text x="${MX + 56 * s}" y="${PART_H - 36 * s}" font-family="${t.sans}" font-size="${11 * s}" font-weight="700" letter-spacing="${1.5 * s}" fill="${t.gray}">◆ ${tag}</text>` : '';
    return `<g>
    <rect x="0" y="0" width="${W}" height="${PART_H}" fill="url(#hatchT)"/>
    ${head('04', 'El veredicto', 104)}
    ${body}
    ${scoreTxt}
    ${stamp(W - 30 * s, 150 * s, 'true')}
    ${tagTxt}
  </g>`;
  }

  const parts = [];
  parts.push({ id: 'bulo', label: 'El bulo', inner: fragBulo() });
  if (data.trick_used || data.why || data.what_is_false) parts.push({ id: 'contexto', label: 'El contexto', inner: fragContext() });
  if (data.sources || data.data_points) parts.push({ id: 'datos', label: 'Los datos', inner: fragData() });
  parts.push({ id: 'veredicto', label: 'El veredicto', inner: fragVerdict() });

  const totalH = parts.length * PART_H;
  const full = `<svg viewBox="0 0 ${W} ${totalH}" xmlns="http://www.w3.org/2000/svg">${defs(t, s)}` +
    parts.map((p, i) => `<g transform="translate(0,${i * PART_H})">${p.inner}</g>`).join('\n') + `</svg>`;

  const partSvgs = parts.map(p =>
    `<svg viewBox="0 0 ${W} ${PART_H}" xmlns="http://www.w3.org/2000/svg">${defs(t, s)}${p.inner}</svg>`);

  return {
    svg: full,                       // bloque completo (transparente) — opcional
    parts: parts.map((p, i) => ({ id: p.id, label: p.label, svg: partSvgs[i] })),
    width: W, partHeight: PART_H, tokens: t,
  };
}

// Render PNG opcional. bg=null → respeta transparencia (lo que quiere el usuario para recortar).
// scale = deviceScaleFactor para salida retina/nítida en móvil (default 3).
async function toPng(svg, outPath, bg = '#F5F5F4', scale = 3) {
  try {
    const { chromium } = await import('playwright');
    const vb = svg.match(/viewBox=["']([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)["']/);
    let sized = svg;
    if (vb && !/width=/.test(svg)) sized = svg.replace('<svg ', `<svg width="${vb[3]}" height="${vb[4]}" `);
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: Number(vb[3]) + 40, height: Number(vb[4]) + 40 }, deviceScaleFactor: scale });
    const bodyBg = bg ? `background:${bg};` : 'background:transparent;';
    await page.setContent(`<body style="margin:20px;${bodyBg}">${sized}</body>`);
    await page.screenshot({ path: outPath, fullPage: true, omitBackground: true });
    await browser.close();
    return outPath;
  } catch (e) { return null; }
}

// Exporta cada parte recortable como .svg y .png en outDir (listas para pegar por partes).
async function exportParts(data, outDir = '/tmp/matiza_parts', opts = {}) {
  const fs = await import('fs');
  fs.mkdirSync(outDir, { recursive: true });
  const { parts } = buildInfographic(data, opts);
  for (const p of parts) {
    const base = `${outDir}/${p.id}`;
    fs.writeFileSync(`${base}.svg`, p.svg);
    await toPng(p.svg, `${base}.png`);   // preview retina sobre fondo claro
  }
  return parts.map(p => ({ id: p.id, svg: `${outDir}/${p.id}.svg`, png: `${outDir}/${p.id}.png` }));
}

// --- Canal GPT (futuro): cuando haya OAuth de OpenAI, generateInfographic puede pedir a GPT
//     que produzca el SVG explicado por partes (gratis vía OAuth). Mientras, renderer local. ---
export async function generateInfographic(data, opts = {}) {
  // if (process.env.OPENAI_OAUTH) return await generateWithGPT(data, opts);
  return buildInfographic(data, opts);
}

export { toPng, exportParts };
export default buildInfographic;
