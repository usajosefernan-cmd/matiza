import { callGemini, getDb } from './config.js';

export async function extractClaims(itemText, signal = null) {
  console.log(`[Claim Extractor] Extrayendo afirmaciones factuales atómicas del texto...`);

  // Intentar leer de la caché de scraped_items por texto coincidente
  const db = getDb();
  try {
    const row = db.prepare("SELECT detected_claim FROM scraped_items WHERE text = ? AND detected_claim IS NOT NULL LIMIT 1").get(itemText);
    if (row && row.detected_claim) {
      console.log(`[Claim Extractor] [Cache HIT] Reutilizando claim extraído históricamente.`);
      let parsed = [];
      try {
        parsed = JSON.parse(row.detected_claim);
      } catch (e) {
        parsed = [{
          claim_text: row.detected_claim,
          normalized_claim: row.detected_claim.toLowerCase().trim(),
          is_verifiable: true,
          claim_type: 'social',
          entities: [],
          places: [],
          dates: [],
          numbers: [],
          requires_original_document: true
        }];
      }
      return {
        claims: Array.isArray(parsed) ? parsed : [parsed],
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
Eres un Fact-Checker Profesional y analista de desinformación. Tu tarea es extraer de forma detallada y atómica todas las afirmaciones factuales concretas (claims) que contenga la publicación o transcripción provista.

No analices la publicación como una sola unidad. Divídela en afirmaciones independientes y verificables.
Ejemplo:
Publicación: "El Gobierno ha aprobado una ley para regalar casas a inmigrantes mientras los españoles pagan alquiler."
Claims a extraer:
1. El Gobierno ha aprobado una ley nueva.
2. La ley regala casas.
3. Las casas se entregan solo a inmigrantes.
4. Los españoles quedan excluidos.

TEXTO A ANALIZAR:
"${itemText}"

Devuelve un JSON estrictamente bajo este esquema:
{
  "claims": [
    {
      "claim_text": "[Afirmación neutral exacta extraída del texto]",
      "normalized_claim": "[Afirmación normalizada simplificada en minúsculas y sin acentos ni puntuación]",
      "is_verifiable": true,
      "claim_type": "political|economic|judicial|health|social|commercial",
      "entities": ["Persona u organismo aludido"],
      "places": ["Ubicación o país"],
      "dates": ["Fechas aludidas si existen"],
      "numbers": ["Cifras o porcentajes mencionados"],
      "requires_original_document": true
    }
  ]
}
`;

  try {
    const result = await callGemini(prompt, '05', signal);
    if (!result || typeof result !== 'object' || !Array.isArray(result.claims)) {
      throw new Error('Formato JSON devuelto por callGemini es inválido');
    }
    
    console.log(`[Claim Extractor] Extraídos ${result.claims.length} claims con éxito.`);
    return result;
  } catch (err) {
    console.warn(`[Claim Extractor] Fallo al extraer con IA: ${err.message}. Usando fallback.`);
    return {
      claims: [
        {
          claim_text: itemText.substring(0, 150).trim() + '...',
          normalized_claim: itemText.substring(0, 150).toLowerCase().trim(),
          is_verifiable: true,
          claim_type: 'social',
          entities: [],
          places: [],
          dates: [],
          numbers: [],
          requires_original_document: true
        }
      ],
      context: 'Recorte automático del radar.',
      confidence: 0.5,
      fallback: true
    };
  }
}

// Mantener compatibilidad con llamadas existentes de extractClaim retornando el primer claim
export async function extractClaim(itemText, signal = null) {
  const result = await extractClaims(itemText, signal);
  const first = result.claims[0];
  return {
    detected_claim: first ? first.claim_text : itemText.substring(0, 100).trim(),
    context: result.context || 'Extracción simplificada.',
    confidence: result.confidence || 0.8,
    cached: result.cached,
    fallback: result.fallback
  };
}
