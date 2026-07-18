import { getDb, callGemini } from './config.js';

export async function routeSemanticContent(claimText, suggestedTopic = 'General', signal = null) {
  const db = getDb();
  console.log(`[Semantic Router] Buscando vertical idóneo para el claim: "${claimText.substring(0, 50)}..."`);

  // Obtener todos los temas activos de la DB
  const existingTopics = db.prepare("SELECT id, title, slug, description, category FROM topics WHERE status = 'activo'").all();
  db.close();

  const lower = claimText.toLowerCase();
  let topicId = null;

  // HEURÍSTICA LOCAL DIRECTA: Mapear por keywords de alta confianza de forma estática
  if (lower.includes('franco') || lower.includes('memoria histórica')) {
    topicId = 't-franco';
  } else if (lower.includes('mena') || lower.includes('inmigr') || lower.includes('extranj')) {
    topicId = 't-migracion';
  } else if (lower.includes('begoña') || lower.includes('peinado') || lower.includes('sánchez')) {
    topicId = 't-begona';
  } else if (lower.includes('koldo') || lower.includes('ábalos') || lower.includes('mascarilla')) {
    topicId = 't-koldo';
  } else if (lower.includes('okupa') || lower.includes('okupación') || lower.includes('alquiler') || lower.includes('desahucio')) {
    topicId = 't-vivienda';
  } else if (lower.includes('precio') || lower.includes('inflac') || lower.includes('ipc') || lower.includes('cesta')) {
    topicId = 't-inflacion';
  } else if (lower.includes('paro') || lower.includes('empleo') || lower.includes('trabaj')) {
    topicId = 't-empleo';
  } else if (lower.includes('autonom') || lower.includes('fiscal') || lower.includes('cuota') || lower.includes('hacienda')) {
    topicId = 't-autonomos';
  }

  // Si encontramos una coincidencia directa por keyword, evitamos llamar al LLM
  if (topicId && existingTopics.some(t => t.id === topicId)) {
    console.log(`[Semantic Router] [Heurística Local Directa] Enrutado a vertical coincidente: ${topicId}`);
    return {
      content_type: 'Bulo',
      claim_type: 'Social',
      topic_match: {
        existing_topic_id: topicId,
        confidence: 0.95,
        should_merge: true
      },
      category_tags: ['Sociedad'],
      needs_new_topic: false,
      routing_reason: 'Enrutado heurísticamente mediante coincidencia unívoca de palabras clave de alta confianza.'
    };
  }

  const prompt = `
Eres un Enrutador Semántico Inteligente para una sala de redacción en España. Tu objetivo es emparejar un claim detectado con uno o varios de los verticales de noticias existentes (expedientes) o decidir si debe proponerse un tema nuevo.

CLAIM A CLASIFICAR:
"${claimText}"
TEMA PROPUESTO POR EL SCRAPER: "${suggestedTopic}"

VERTICALES DISPONIBLES:
${JSON.stringify(existingTopics.map(t => ({ id: t.id, title: t.title, description: t.description, category: t.category })))}

--- INSTRUCCIONES ---
1. Analiza semánticamente el claim frente a los verticales disponibles.
2. Si el claim se refiere directamente al ámbito de uno o varios verticales existentes (por ejemplo, plazos de okupación e impuestos asócialo tanto al de "Vivienda" como al de "Economía e Impuestos"), asócialo a todos los que corresponda de forma justificada.
3. Devuelve una lista estructurada de emparejamientos en "topic_matches", indicando el ID del vertical y el grado de confianza (de 0.0 a 1.0).
4. Si el claim NO tiene relación lógica con ningún tema existente pero representa un hecho noticioso o rumor de gran impacto sociopolítico en España, sugiere la creación de un nuevo vertical ("needs_new_topic": true).

Devuelve un JSON con la estructura exacta:
{
  "content_type": "[Explicativo, Declaración, Datos, Rumor, Bulo, Video, Captura]",
  "claim_type": "[Legal, Social, Económico, Sanitario, Judicial, Político, Comercial]",
  "topic_matches": [
    {
      "existing_topic_id": "[ID del tema 1]",
      "confidence": [0.0 a 1.0]
    },
    {
      "existing_topic_id": "[ID del tema 2]",
      "confidence": [0.0 a 1.0]
    }
  ],
  "category_tags": ["[etiqueta1]", "[etiqueta2]"],
  "needs_new_topic": true|false,
  "routing_reason": "[Explicación del enrutamiento]"
}
`;

  try {
    const result = await callGemini(prompt, '02', signal);
    const primaryMatch = result.topic_matches && result.topic_matches.length > 0 ? result.topic_matches[0].existing_topic_id : null;
    console.log(`[Semantic Router] Enrutado a temas: ${JSON.stringify(result.topic_matches)}. Tema principal: ${primaryMatch}`);
    return result;
  } catch (err) {
    console.warn('[Semantic Router] Fallo en clasificación IA. Usando emparejamiento por keywords de fallback.');
    // Heurística local de fallback similar a ai-pipeline
    const lower = claimText.toLowerCase();
    let topicId = 't-autonomos';
    let reason = 'Emparejamiento heurístico local de fallback por coincidencia de palabras clave.';

    if (lower.includes('franco') || lower.includes('memoria histórica')) {
      topicId = 't-franco';
    } else if (lower.includes('mena') || lower.includes('inmigr') || lower.includes('extranj')) {
      topicId = 't-migracion';
    } else if (lower.includes('begoña') || lower.includes('peinado') || lower.includes('sánchez')) {
      topicId = 't-begona';
    } else if (lower.includes('koldo') || lower.includes('ábalos') || lower.includes('mascarilla')) {
      topicId = 't-koldo';
    } else if (lower.includes('okupa') || lower.includes('vivienda') || lower.includes('alquiler')) {
      topicId = 't-vivienda';
    } else if (lower.includes('precio') || lower.includes('inflac') || lower.includes('ipc') || lower.includes('cesta')) {
      topicId = 't-inflacion';
    } else if (lower.includes('paro') || lower.includes('empleo') || lower.includes('trabaj')) {
      topicId = 't-empleo';
    } else if (lower.includes('autonom') || lower.includes('fiscal') || lower.includes('cuota') || lower.includes('hacienda')) {
      topicId = 't-autonomos';
    } else if (lower.includes('politica') || lower.includes('ley') || lower.includes('congreso')) {
      topicId = 't-politica';
    }

    return {
      content_type: 'Rumor',
      claim_type: 'Social',
      topic_matches: [
        {
          existing_topic_id: topicId,
          confidence: 0.8
        }
      ],
      category_tags: ['Sociedad'],
      needs_new_topic: false,
      routing_reason: reason
    };
  }
}
