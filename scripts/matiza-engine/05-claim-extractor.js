import { callGemini, getDb } from './config.js';

export async function extractClaim(itemText, signal = null) {
  console.log(`[Claim Extractor] Extrayendo afirmación del texto...`);

  // Intentar leer de la caché de scraped_items por texto coincidente
  const db = getDb();
  try {
    const row = db.prepare("SELECT detected_claim FROM scraped_items WHERE text = ? AND detected_claim IS NOT NULL LIMIT 1").get(itemText);
    if (row && row.detected_claim) {
      console.log(`[Claim Extractor] [Cache HIT] Reutilizando claim extraído históricamente.`);
      db.close();
      return {
        detected_claim: row.detected_claim,
        context: 'Recuperado de histórico del radar.',
        confidence: 1.0,
        cached: true
      };
    }
  } catch (e) {
    console.warn('[Claim Extractor Cache] Error al consultar histórico:', e.message);
  } finally {
    if (db) db.close();
  }

  const prompt = `
Eres un Fact-Checker Profesional. Tu tarea es extraer la afirmación factual principal (claim) que deba ser verificada, a partir del siguiente fragmento de texto o transcripción capturado por el radar.

El claim extraído debe ser:
1. Una única frase concisa y clara.
2. Escrito en tono totalmente neutral y aséptico (sin ironías, sin adjetivos sensacionalistas).
3. Enfocado en los hechos contrastables de la afirmación (ej: "Se ha aprobado una ayuda de 4.000€ mensuales para menores extranjeros", "El allanamiento de morada requiere orden judicial para el desalojo en segundas viviendas").

TEXTO DETECTADO:
"${itemText}"

Devuelve un JSON con el formato exacto:
{
  "detected_claim": "[Afirmación neutral a verificar]",
  "context": "[Breve contexto de la afirmación]",
  "confidence": [0.0 a 1.0]
}
`;

  try {
    const result = await callGemini(prompt, '05', signal);
    if (!result || typeof result !== 'object' || !result.detected_claim) {
      throw new Error('JSON devuelto por callGemini es inválido o incompleto');
    }
    console.log(`[Claim Extractor] Claim extraído: "${result.detected_claim}"`);
    return result;
  } catch (err) {
    console.warn(`[Claim Extractor] Fallo al extraer con IA: ${err.message}. Usando texto recortado como fallback.`);
    return {
      detected_claim: itemText.substring(0, 100).trim() + '...',
      context: 'Recorte automático del radar.',
      confidence: 0.5,
      fallback: true
    };
  }
}
