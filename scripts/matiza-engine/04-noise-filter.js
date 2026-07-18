import { callGemini } from './config.js';

export async function filterNoise(itemText, platform, signal = null) {
  console.log(`[Noise Filter] Evaluando si el item es ruido o contenido no relevante...`);

  const prompt = `
Eres un Auditor de Calidad Periodística. Tu tarea es descartar el ruido o contenido comercial/entretenimiento sin relevancia pública de España en el flujo de MATIZA.

TEXTO A ANALIZAR:
"${itemText}"
PLATAFORMA: ${platform}

--- REGLA DE FILTRADO ---
Debes marcar como "is_noise": true si el contenido cumple alguna de las siguientes:
- Contenido comercial menor (reseñas ordinarias de restaurantes, ropa, juguetes).
- Enlaces promocionales puros de afiliados sin viralidad desmedida ni engaño.
- Entretenimiento puro sin riesgo de desinformación (chistes, memes, cotilleos ordinarios, deportes).
- Noticias puramente locales sin impacto social amplio en el resto de España.
- Opiniones puras que no realizan afirmaciones factuales desmentibles (es decir, debate subjetivo puro sin falsedad de datos).
- Contenido que no puede ser verificado de ninguna forma empírica (afirmaciones puramente místicas, esotéricas o sobrenaturales).

IMPORTANTE: Las afirmaciones virales, rumores o bulos sociopolíticos sobre temas sensibles como inmigración, ayudas públicas, pensiones, okupación, impuestos, SMI o violencia de género, por muy exagerados, sesgados o infundados que parezcan, NO son ruido. Deben marcarse con "is_noise": false para que el sistema pueda investigarlos y desmentirlos formalmente.


Devuelve un JSON con el formato exacto:
{
  "is_noise": true|false,
  "noise_reason": "[Explicación detallada de por qué se considera ruido o contenido útil]",
  "keep_monitoring": true|false,
  "requires_processing": true|false
}
`;

  try {
    const result = await callGemini(prompt, '04', signal);
    console.log(`[Noise Filter] is_noise: ${result.is_noise}. Razón: ${result.noise_reason}`);
    return result;
  } catch (err) {
    console.warn('[Noise Filter] Fallo en la evaluación con IA. Usando descarte básico por keywords.');
    const lower = itemText.toLowerCase();
    
    // Lista de keywords que implican ruido comercial u opinión subjetiva extrema
    const noiseKeywords = [
      'código de descuento', 'enlace de afiliado', 'comprar aquí', 'oferta especial', 'promoción',
      'fútbol', 'real madrid', 'barça', 'mbappé', 'champions league', 'película', 'estreno', 'horóscopo'
    ];

    const isNoise = noiseKeywords.some(kw => lower.includes(kw));

    return {
      is_noise: isNoise,
      noise_reason: isNoise ? 'Detectado keyword de ruido comercial o entretenimiento deportivo.' : 'Sin indicios evidentes de ruido en el análisis heurístico local.',
      keep_monitoring: false,
      requires_processing: !isNoise
    };
  }
}
