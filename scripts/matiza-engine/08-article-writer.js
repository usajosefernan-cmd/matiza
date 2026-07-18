import { callGemini, getDb } from './config.js';
import { buildInfographic } from '../infographic-system.js';
import { getClaimCache } from './cache.js';

export async function writeArticle(claimText, verificationData, sources = [], signal = null) {
  console.log(`[Article Writer] Redactando artículo periodístico de verificación...`);

  // Intentar leer de caché antes de llamar al LLM
  try {
    const cached = getClaimCache(claimText);
    if (cached && cached.reuse_allowed) {
      const db = getDb();
      try {
        const art = db.prepare("SELECT * FROM articles WHERE id = ?").get(cached.previous_article_id);
        if (art) {
          console.log(`[Article Writer] [Cache HIT] Reutilizando artículo para: "${claimText.substring(0, 50)}..."`);
          db.close();
          return {
            title: art.title,
            subtitle: art.subtitle,
            summary: art.summary,
            explanation: art.explanation,
            trick_used: art.trick_used,
            matiza_score: art.matiza_score || 50,
            emoji_tag: art.emoji_tag,
            tags: [],
            infographic_svg: art.infographic_svg,
            cached: true
          };
        }
      } catch (dbErr) {
        console.warn('[Article Writer Cache] Error buscando artículo en DB:', dbErr.message);
      } finally {
        if (db) db.close();
      }
    }
  } catch (cacheErr) {
    console.warn('[Article Writer Cache] Error al consultar caché:', cacheErr.message);
  }

  const prompt = `
Eres el Redactor Jefe de MATIZA. Tu tarea es escribir un artículo de verificación que sea **extremadamente visual, directo y fácil de entender por cualquiera ("explicado para tontos")**, pero manteniendo el rigor y la neutralidad.

DATOS DE VERIFICACIÓN:
- Claim: "${claimText}"
- Veredicto: "${verificationData.verdict}"
- Razonamiento: "${verificationData.verdict_reasoning}"
- Verdadero: "${verificationData.what_is_true}"
- Falso: "${verificationData.what_is_false}"
- Falta Contexto: "${verificationData.what_lacks_context}"
- No Probado: "${verificationData.what_is_not_proven}"
- Fuentes: ${JSON.stringify(sources)}

--- INSTRUCCIONES DE FORMATO Y ESTILO ---
1. TÍTULO: Debe ser persuasivo pero riguroso, directo y claro (ej: "No, España no confisca tu herencia: la realidad del Impuesto de Sucesiones"). Evita tecnicismos vacíos.
2. SUBTÍTULO: Corto, indicando de forma sencilla el veredicto real.
3. EXPLICACIÓN: 
   - Debe comenzar obligatoriamente con un bloque de cita que resuma el tema en cristiano:
     > **Explicado en sencillo:** [Resumen ultra-claro de 2 frases sin tecnicismos].
   - Usa párrafos muy cortos (máximo 2 o 3 frases por párrafo).
   - Usa **negritas** para destacar los puntos clave.
   - Utiliza **listas de viñetas (*)** para desglosar datos, cifras, leyes, o tramos de forma súper visual y rápida de leer.
4. TRUCO DETECTADO (trick_used): Clasifica cuál de estas técnicas de manipulación se está usando para confundir: "cherry-picking", "falso dilema", "culpa colectiva", "dato sin base", "vídeo recortado", "autoridad falsa", "miedo/urgencia", "promoción encubierta".
5. MATIZA TERMÓMETRO SCORE (matiza_score): Calcula el termómetro de bulo/riesgo en España de 0 a 100: 
    - 0-20 ruido bajo
    - 21-40 dudoso
    - 41-60 confuso
    - 61-80 viral y preocupante
    - 81-100 prioridad alta/alarma
6. EMOJI TAG (emoji_tag): Selecciona la etiqueta exacta correspondiente con su emoji de esta lista:
    - "🔥 Caliente"
    - "🧊 Falta contexto"
    - "🧪 Necesita pruebas"
    - "🎭 Manipulación emocional"
    - "📉 Dato tramposo"
    - "🎬 Vídeo fuera de contexto"
    - "💸 Promo encubierta"
    - "⚖️ Revisión legal"
    - "🧠 Aprende el truco"
 7. ETIQUETAS (tags): Proporciona entre 2 y 4 palabras clave transversales cortas (ej. "vivienda", "paro", "impuestos", "ley", "seguridad-social", "catalunya", "justicia") que describan el tema y los hechos. Deben estar normalizadas (en minúsculas, sin acentos y separadas por guiones en lugar de espacios si tienen varias palabras).

Devuelve un JSON con el formato exacto:
{
  "title": "[Título claro y directo]",
  "subtitle": "[Subtítulo corto explicativo del veredicto]",
  "summary": "[Resumen ejecutivo sencillo de la distorsión del claim]",
  "explanation": "[Cuerpo del artículo estructurado con el bloque '> **Explicado en sencillo:** ...', negritas y listas de viñetas para lectura rápida]",
  "trick_used": "cherry-picking" | "falso dilema" | "culpa colectiva" | "dato sin base" | "vídeo recortado" | "autoridad falsa" | "miedo/urgencia" | "promoción encubierta",
  "matiza_score": [Número entre 0 y 100],
  "emoji_tag": "[Etiqueta de la lista]",
  "tags": ["[etiqueta-1]", "[etiqueta-2]"]
}
`;

  try {
    const result = await callGemini(prompt, '08', signal);
    if (!result || typeof result !== 'object' || !result.title) {
      throw new Error('JSON devuelto por callGemini es inválido o incompleto');
    }
    // Mapear score o risk_score a matiza_score por si acaso el modelo utiliza campos antiguos
    if (result.matiza_score === undefined || result.matiza_score === null) {
      if (result.score !== undefined && result.score !== null) {
        result.matiza_score = result.score;
      } else if (result.risk_score !== undefined && result.risk_score !== null) {
        result.matiza_score = result.risk_score;
      }
    }
    console.log(`[Article Writer] Redacción completada: "${result.title}" (Score: ${result.matiza_score})`);

    // Generar infografía determinista mobile-first de Hermes
    try {
      const infoData = {
        claim: claimText,
        trick_used: result.trick_used,
        why: result.summary,
        sources: sources.slice(0, 3).map(s => `${s.title.split(':')[0].trim()}: ${s.authority_level || 'Oficial'}`),
        what_is_true: verificationData.what_is_true,
        matiza_score: result.matiza_score || 50,
        emoji_tag: result.emoji_tag
      };
      const { svg } = buildInfographic(infoData);
      result.infographic_svg = svg;
    } catch (infErr) {
      console.warn('[Article Writer] Error al generar la infografía local:', infErr);
      result.infographic_svg = `<svg viewBox='0 0 390 205' xmlns='http://www.w3.org/2000/svg'><rect width='390' height='205' fill='rgba(7,9,19,0.45)' rx='8'/><text x='195' y='100' fill='#737373' font-family='sans-serif' font-size='12' text-anchor='middle'>Infografía no disponible</text></svg>`;
    }

    return result;
  } catch (err) {
    console.error(`[Article Writer] ❌ Fallo crítico en la redacción del artículo: ${err.message}`);
    throw err;
  }
}
