import { callGemini } from './config.js';

export async function writeSocialPosts(title, subtitle, verdict, claim, signal = null) {
  console.log(`[Social Writer] Generando borradores de posts sociales para: "${title.substring(0, 50)}..."`);

  const prompt = `
Eres un Redactor Creativo y Gestor de Redes Sociales para MATIZA. Tu objetivo es generar borradores de copies para redes sociales sobre la última verificación de hechos.

DATOS:
- Título del desmentido: "${title}"
- Subtítulo: "${subtitle}"
- Veredicto: "${verdict}"
- Claim original viral: "${claim}"

--- INSTRUCCIONES ---
1. Crea un borrador estructurado para X (Twitter) en formato corto o hilo llamativo pero serio.
2. Crea un borrador estructurado para Instagram en formato copy de post explicativo.
3. No uses lenguaje sensacionalista, pero sí emoticonos y una estructura visual limpia.

Devuelve un JSON con el formato exacto:
[
  { "platform": "X", "format": "corto", "content": "[Copy corto para X con hashtags y link]" },
  { "platform": "Instagram", "format": "copy", "content": "[Copy explicativo para Instagram con hashtags]" }
]
`;

  try {
    const result = await callGemini(prompt, '11', signal);
    if (!result || (!Array.isArray(result) && typeof result !== 'object')) {
      throw new Error('JSON devuelto por callGemini es inválido o incompleto');
    }
    console.log(`[Social Writer] Posts sociales generados por la IA.`);
    return result;
  } catch (err) {
    console.error(`[Social Writer] ❌ Fallo crítico en la generación de posts sociales: ${err.message}`);
    throw err;
  }
}
