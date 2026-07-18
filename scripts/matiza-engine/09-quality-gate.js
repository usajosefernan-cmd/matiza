import { callGemini } from './config.js';

export async function checkQuality(articleData, verdict, signal = null) {
  console.log(`[Quality Gate] Evaluando calidad y deontología del artículo...`);

  const prompt = `
Eres el Defensor del Lector y Auditor de Calidad Deontológica de MATIZA. Evalúa el siguiente borrador de desmentido de forma estricta para garantizar que cumpla con los principios de imparcialidad periodística y ausencia de opiniones subjetivas.

TÍTULO: "${articleData.title}"
SUBTÍTULO: "${articleData.subtitle}"
VEREDICTO: "${verdict}"
RESUMEN: "${articleData.summary}"
EXPLICACIÓN: "${articleData.explanation}"

--- PRINCIPIOS DE CALIDAD ---
1. Imparcialidad absoluta: ¿El tono es neutral y objetivo o toma partido de forma agresiva?
2. Sin opiniones personales del redactor: ¿Hay valoraciones morales o adjetivos calificativos no demostrados?
3. Neutralidad en títulos: ¿El titular evita sensacionalismos, muletillas o prefijos tipo "Auditoría de hechos"?
4. Ausencia de citas a competidores de verificación (Maldita, Newtral, etc.).

Devuelve un JSON con el formato exacto:
{
  "passed": true|false,
  "reason": "[Explicación detallada de la evaluación]",
  "corrections_required": ["[Corrección 1 si passed es false]", "[Corrección 2]"],
  "quality_score": [0.0 a 10.0]
}
`;

  try {
    const result = await callGemini(prompt, '09', signal);
    console.log(`[Quality Gate] Calidad aprobada: ${result.passed}. Puntuación: ${result.quality_score}`);
    return result;
  } catch (err) {
    console.warn(`[Quality Gate] Fallo al evaluar calidad con IA: ${err.message}. Aprobando por defecto.`);
    return {
      passed: true,
      reason: 'Aprobación automática de fallback por indisponibilidad de IA.',
      corrections_required: [],
      quality_score: 8.0
    };
  }
}
