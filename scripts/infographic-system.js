// infographic-system.js — SISTEMA VISUAL SVG de MATIZA (Premium Cyberpunk, Mobile-First y de Lectura Rápida)
// Rediseñado para contraste brutal, legibilidad en fondos oscuros y exportación premium

const BASE_W = 390;   // ancho de referencia MÓVIL (iPhone). Todo se escala desde aquí.

export const MATIZA_TOKENS = {
  bg: '#0f1326',      // Fondo oscuro cyberpunk integrado
  ink: '#ffffff',     // Tinta principal blanca
  ink2: '#e2e8f0',    // Tinta secundaria gris claro muy legible
  gray: '#00f0ff',    // Neon Cyan / Blue para etiquetas y números
  grayL: '#ff007f',   // Neon Rose / Pink para advertencias y veredictos falsos
  line: 'rgba(255, 255, 255, 0.08)', // Divisorias sutiles
  neonGreen: '#00f5d4', // Verde neón para veredictos verdaderos
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
    if ((cur + ' ' + w).trim().length > max && cur) { 
      lines.push(cur.trim()); 
      cur = w; 
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4);
}

function defs(t, s) {
  return `<defs>
    <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f1326" />
      <stop offset="100%" stop-color="#151b38" />
    </linearGradient>
    <pattern id="hatch" width="${9 * s}" height="${9 * s}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="${9 * s}" stroke="${t.grayL}" stroke-width="${1 * s}" opacity="0.04"/>
    </pattern>
    <pattern id="hatchT" width="${9 * s}" height="${9 * s}" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
      <line x1="0" y1="0" x2="0" y2="${9 * s}" stroke="${t.gray}" stroke-width="${1 * s}" opacity="0.03"/>
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
    <rect x="${2 * s}" y="${2 * s}" width="${W - 4 * s}" height="${PART_H - 4 * s}" rx="${8 * s}" fill="url(#cyberGrad)" stroke="${t.line}" stroke-width="${1 * s}"/>
    <text x="${MX}" y="${60 * s}" font-family="${t.serif}" font-size="${48 * s}" font-weight="700" fill="rgba(255, 255, 255, 0.05)">${num}</text>
    <text x="${MX + 56 * s}" y="${37 * s}" font-family="${t.sans}" font-size="${11 * s}" font-weight="800" letter-spacing="${2.5 * s}" fill="${t.gray}">${esc(label.toUpperCase())}</text>
    <line x1="${MX + 56 * s}" y1="${47 * s}" x2="${MX + 56 * s + accentW * s}" y2="${47 * s}" stroke="${t.gray}" stroke-width="${2.5 * s}" stroke-linecap="round"/>
    <line x1="${MX}" y1="${PART_H - 12 * s}" x2="${W - MX}" y2="${PART_H - 12 * s}" stroke="${t.line}" stroke-width="${1 * s}"/>`;
  }

  // sello timbre (Premium): false ✕ / true ✓
  function stamp(cx, cy, kind) {
    const isFalse = kind === 'false';
    const color = isFalse ? t.grayL : t.neonGreen;
    const g = isFalse
      ? `<path d="M${-8 * s},${-8 * s} L${8 * s},${8 * s} M${8 * s},${-8 * s} L${-8 * s},${8 * s}" stroke="${color}" stroke-width="${3 * s}" stroke-linecap="round"/>`
      : `<path d="M${-9 * s},${-1 * s} L${-3 * s},${5 * s} L${8 * s},${-7 * s}" fill="none" stroke="${color}" stroke-width="${3 * s}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const txt = isFalse ? 'FALSO' : 'VERDAD';
    
    return `<g transform="translate(${cx},${cy})">
    <circle cx="0" cy="0" r="${18 * s}" fill="rgba(15, 19, 38, 0.8)" stroke="${color}" stroke-width="${2 * s}" style="filter: drop-shadow(0px 0px 4px ${color}33);"/>
    ${g}
    <text x="0" y="${40 * s}" text-anchor="middle" font-family="${t.sans}" font-size="${9.5 * s}" font-weight="900" letter-spacing="${1.5 * s}" fill="${color}">${txt}</text>
  </g>`;
  }

  // ---- FRAGMENTOS ----
  function fragBulo() {
    const lines = wrap(data.claim || 'Afirmación viral', 28);
    const body = lines.map((l, i) =>
      `<text x="${MX + 56 * s}" y="${78 * s + i * 22 * s}" font-family="${t.sans}" font-size="${15 * s}" font-weight="600" fill="${t.ink}">${esc(l)}</text>`).join('\n    ');
    return `<g>
    <rect x="0" y="0" width="${W}" height="${PART_H}" rx="${8 * s}" fill="url(#cyberGrad)"/>
    <rect x="0" y="0" width="${W}" height="${PART_H}" rx="${8 * s}" fill="url(#hatch)" opacity="0.4"/>
    ${head('01', 'El bulo', 56)}
    ${body}
    ${stamp(W - 40 * s, 42 * s, 'false')}
    <!-- Borde neon izquierdo decorativo -->
    <rect x="2 * s" y="2 * s" width="${3 * s}" height="${PART_H - 4 * s}" fill="${t.grayL}" rx="${1 * s}"/>
  </g>`;
  }

  function fragContext() {
    const txt = data.why || data.trick_used || 'Por qué engaña';
    const lines = wrap(txt, 34);
    const body = lines.map((l, i) =>
      `<text x="${MX + 56 * s}" y="${78 * s + i * 22 * s}" font-family="${t.sans}" font-size="${14.5 * s}" font-weight="500" fill="${t.ink2}">${esc(l)}</text>`).join('\n    ');
    const tech = data.trick_used
      ? `<text x="${MX + 56 * s}" y="${PART_H - 30 * s}" font-family="${t.sans}" font-size="${10 * s}" font-weight="800" letter-spacing="${1.5 * s}" fill="${t.grayL}">↳ TÉCNICA: ${esc(data.trick_used.toUpperCase())}</text>`
      : '';
    return `<g>
    <rect x="0" y="0" width="${W}" height="${PART_H}" rx="${8 * s}" fill="url(#cyberGrad)"/>
    ${head('02', 'El contexto', 92)}
    ${body}
    ${tech}
  </g>`;
  }

  function fragData() {
    const items = (Array.isArray(data.sources) && data.sources.length)
      ? data.sources
      : ['Fuente: Metadatos oficiales', 'Veracidad: Datos contrastados'];
    const rows = items.slice(0, 4).map((it, i) => {
      const partsArr = String(it).split(':');
      const k = partsArr[0] || 'Dato';
      const v = partsArr.slice(1).join(':').trim();
      const y = 78 * s + i * 25 * s;
      return `<circle cx="${MX + 62 * s}" cy="${y - 6 * s}" r="${3 * s}" fill="${t.gray}"/>
      <text x="${MX + 74 * s}" y="${y - 2 * s}" font-family="${t.sans}" font-size="${13 * s}" font-weight="700" fill="${t.ink}">${esc(k)}</text>
      <text x="${MX + 74 * s + k.length * 8 * s}" y="${y - 2 * s}" font-family="${t.sans}" font-size="${13 * s}" font-weight="400" fill="${t.ink2}">${esc(v ? ': ' + v : '')}</text>`;
    }).join('\n    ');
    return `<g>
    <rect x="0" y="0" width="${W}" height="${PART_H}" rx="${8 * s}" fill="url(#cyberGrad)"/>
    ${head('03', 'Los datos', 78)}
    ${rows}
  </g>`;
  }

  function fragVerdict() {
    const lines = wrap(data.what_is_true || 'Dato verificado', 28);
    const body = lines.map((l, i) =>
      `<text x="${MX + 56 * s}" y="${76 * s + i * 22 * s}" font-family="${t.sans}" font-size="${15 * s}" font-weight="600" fill="${t.ink}">${esc(l)}</text>`).join('\n    ');
    const score = data.matiza_score;
    const scoreTxt = (score != null)
      ? `<text x="${W - MX}" y="${42 * s}" text-anchor="end" font-family="${t.serif}" font-size="${33 * s}" font-weight="700" fill="${t.ink}">${score}<tspan font-family="${t.sans}" font-size="${13 * s}" fill="${t.gray}">/100</tspan></text>
       <text x="${W - MX}" y="${56 * s}" text-anchor="end" font-family="${t.sans}" font-size="${9 * s}" font-weight="700" letter-spacing="${1.5 * s}" fill="${t.gray}">MATIZA SCORE</text>`
      : '';
    const tag = data.emoji_tag ? esc(data.emoji_tag) : '💼';
    const tagTxt = tag ? `<text x="${MX + 56 * s}" y="${PART_H - 30 * s}" font-family="${t.sans}" font-size="${11 * s}" font-weight="700" letter-spacing="${1.5 * s}" fill="${t.gray}">◆ ${tag}</text>` : '';
    return `<g>
    <rect x="0" y="0" width="${W}" height="${PART_H}" rx="${8 * s}" fill="url(#cyberGrad)"/>
    <rect x="0" y="0" width="${W}" height="${PART_H}" rx="${8 * s}" fill="url(#hatchT)" opacity="0.4"/>
    ${head('04', 'El veredicto', 104)}
    ${body}
    ${scoreTxt}
    ${stamp(W - 40 * s, 138 * s, 'true')}
    ${tagTxt}
    <!-- Borde neon izquierdo decorativo (Verde) -->
    <rect x="2 * s" y="2 * s" width="${3 * s}" height="${PART_H - 4 * s}" fill="${t.neonGreen}" rx="${1 * s}"/>
  </g>`;
  }

  const parts = [];
  parts.push({ id: 'bulo', label: 'El bulo', inner: fragBulo() });
  if (data.trick_used || data.why || data.what_is_false) parts.push({ id: 'contexto', label: 'El contexto', inner: fragContext() });
  if (data.sources || data.data_points) parts.push({ id: 'datos', label: 'Los datos', inner: fragData() });
  parts.push({ id: 'veredicto', label: 'El veredicto', inner: fragVerdict() });

  const totalH = parts.length * PART_H;
  const full = `<svg viewBox="0 0 ${W} ${totalH}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="border-radius:12px; overflow:hidden; border:1px solid rgba(255,255,255,0.06);">${defs(t, s)}` +
    parts.map((p, i) => `<g transform="translate(0,${i * PART_H})">${p.inner}</g>`).join('\n') + `</svg>`;

  const partSvgs = parts.map(p =>
    `<svg viewBox="0 0 ${W} ${PART_H}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="border-radius:8px; overflow:hidden;">${defs(t, s)}${p.inner}</svg>`);

  return {
    svg: full,
    parts: parts.map((p, i) => ({ id: p.id, label: p.label, svg: partSvgs[i] })),
    width: W, partHeight: PART_H, tokens: t,
  };
}

// Render PNG opcional via Playwright
export async function toPng(svg, outPath, bg = '#0f1326', scale = 3) {
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

export async function exportParts(data, outDir = '/tmp/matiza_parts', opts = {}) {
  const fs = await import('fs');
  fs.mkdirSync(outDir, { recursive: true });
  const { parts } = buildInfographic(data, opts);
  for (const p of parts) {
    const base = `${outDir}/${p.id}`;
    fs.writeFileSync(`${base}.svg`, p.svg);
    await toPng(p.svg, `${base}.png`, '#0f1326');
  }
  return parts.map(p => ({ id: p.id, svg: `${outDir}/${p.id}.svg`, png: `${outDir}/${p.id}.png` }));
}

export async function generateInfographic(data, opts = {}) {
  return buildInfographic(data, opts);
}

export default buildInfographic;
