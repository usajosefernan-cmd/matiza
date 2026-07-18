import { callGemini, getDb } from './config.js';
import { getClaimCache } from './cache.js';

export async function verifyClaim(claimText, sources = [], signal = null) {
  console.log(`[Verifier] Verificando claim: "${claimText.substring(0, 50)}..."`);

  // Intentar leer de caché antes de llamar al LLM
  try {
    const cached = getClaimCache(claimText);
    if (cached && cached.reuse_allowed) {
      const db = getDb();
      try {
        const art = db.prepare("SELECT * FROM articles WHERE id = ?").get(cached.previous_article_id);
        if (art) {
          console.log(`[Verifier] [Cache HIT] Reutilizando verificación para: "${claimText.substring(0, 50)}..."`);
          db.close();
          return {
            verdict: art.verdict,
            confidence: art.confidence || 'Alta',
            verdict_reasoning: art.summary || 'Recuperado de caché',
            what_is_true: art.what_is_true || '',
            what_is_false: art.what_is_false || '',
            what_lacks_context: art.what_lacks_context || '',
            what_is_not_proven: art.what_is_not_proven || '',
            cached: true
          };
        }
      } catch (dbErr) {
        console.warn('[Verifier Cache] Error buscando artículo en DB:', dbErr.message);
      } finally {
        if (db) db.close();
      }
    }
  } catch (cacheErr) {
    console.warn('[Verifier Cache] Error al consultar caché:', cacheErr.message);
  }

  const prompt = `
Eres un Auditor de Datos y Veracidad en MATIZA. Tu labor es realizar un contraste analítico, desapasionado y lógico entre el claim y las fuentes oficiales primarias recolectadas.

CLAIM A VERIFICAR:
"${claimText}"

FUENTES OFICIALES DE EVIDENCIA:
${JSON.stringify(sources)}

--- INSTRUCCIONES ---
1. Analiza con precisión técnica si el claim es:
   - "Verdadero": Los hechos afirmados coinciden exactamente con la normativa o datos estadísticos oficiales.
   - "Falso": Las afirmaciones contradicen o falsean directamente la ley, los datos o la realidad documental.
   - "Engañoso": Mezcla hechos verdaderos con omisiones o interpretaciones falsas sesgadas para confundir.
   - "Falta contexto": Requiere perspectiva legal, metodológica o histórica sin la cual la frase induce a conclusiones equivocadas.
2. Genera un nivel de confianza en el veredicto ("Alta", "Media" o "Baja").
3. Elabora un resumen técnico de qué parte del claim es cierta, cuál es falsa, qué contexto falta y qué no está probado.

Devuelve un JSON con el formato exacto:
{
  "verdict": "Verdadero" | "Falso" | "Engañoso" | "Falta contexto",
  "confidence": "Alta" | "Media" | "Baja",
  "verdict_reasoning": "[Explicación lógica paso a paso de cómo las fuentes desmienten o prueban la afirmación]",
  "what_is_true": "[Qué partes de la afirmación son reales]",
  "what_is_false": "[Qué partes de la afirmación son mentiras o bulos]",
  "what_lacks_context": "[Qué contexto legal, temporal o metodológico se omitió]",
  "what_is_not_proven": "[Qué elementos no se han podido demostrar con las pruebas actuales]"
}
`;

  try {
    const result = await callGemini(prompt, '07', signal);
    if (!result || typeof result !== 'object' || !result.verdict || !result.verdict_reasoning) {
      throw new Error('JSON devuelto por callGemini es inválido o incompleto');
    }
    console.log(`[Verifier] Veredicto: ${result.verdict}. Confianza: ${result.confidence}`);
    return result;
  } catch (err) {
    console.error(`[Verifier] ❌ Fallo crítico en la verificación: ${err.message}`);
    throw err;
  }
}
