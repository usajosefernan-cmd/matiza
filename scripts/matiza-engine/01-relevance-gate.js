import { callGemini } from './config.js';

export async function evaluateRelevance(itemText, platform, metrics = {}, signal = null) {
  console.log(`[Relevance Gate] Evaluando relevancia para item de ${platform}...`);

  const prompt = `
Eres un Analista Senior de Desinformación e Interés Público en España. Tu misión es filtrar el ruido del radar y evaluar si el siguiente claim/texto amerita ser verificado como desinformación o bulo.

TEXTO/CLAIM DETECTADO:
"${itemText}"
PLATAFORMA: ${platform}
MÉTRICAS: ${JSON.stringify(metrics)}

--- REGLAS DE OBLIGADO CUMPLIMIENTO ---
1. DESCARTA NOTICIAS ESTÁNDAR Y REPORTAJES PERIODÍSTICOS: Si el texto es una noticia informativa ordinaria de la prensa profesional (ej: crónicas judiciales ordinarias, reportajes de actualidad, declaraciones parlamentarias legítimas), debes descartarla (should_process = false, recommended_action = "ignore"). No somos un diario de noticias generalistas.
2. ENFÓCATE EN BULOS Y DESINFORMACIÓN: Solo debes procesar claims que contengan sospechas razonables de ser bulos, falsedades virales, datos manipulados o desinformación en redes sociales que afecten a verticales clave (Vivienda/Okupación, Pensiones, Inmigración/MENAs, SMI/Empleo, Sanidad Pública).
3. VERIFICABILIDAD: El claim debe ser contrastable con datos oficiales del BOE, INE, Seguridad Social u otros registros primarios.

Devuelve un objeto JSON con el siguiente formato exacto:
{
  "should_process": true|false,
  "reason": "[Explicación de la decisión en base a los criterios]",
  "priority": "alta" | "media" | "baja" | "descartar",
  "public_interest_score": [0.0 a 10.0],
  "virality_score": [0.0 a 10.0],
  "harm_score": [0.0 a 10.0],
  "verification_value_score": [0.0 a 10.0],
  "commercial_noise_score": [0.0 a 10.0],
  "recommended_action": "process" | "queue" | "ignore" | "monitor_only"
}
`;

  try {
    const result = await callGemini(prompt, '01', signal);
    console.log(`[Relevance Gate] Decisión IA: ${result.recommended_action}. should_process: ${result.should_process}`);
    return result;
  } catch (err) {
    console.warn(`[Relevance Gate] Fallo al evaluar relevancia con IA: ${err.message}. Usando heurística local restrictiva.`);
    // Heurística local restrictiva de fallback
    const textLower = itemText.toLowerCase();
    const isPrensa = platform.toLowerCase().includes('prensa') || platform.toLowerCase().includes('rss');
    
    // Si es prensa generalista, por defecto ignoramos a menos que se hable explícitamente de bulo o desinformación
    const mentionsDesinfo = textLower.includes('bulo') || textLower.includes('mentira') || textLower.includes('falsedad') || textLower.includes('desmentido') || textLower.includes('fake');
    
    if (isPrensa && !mentionsDesinfo) {
      return {
        should_process: false,
        reason: 'Descartado heurísticamente: noticia informativa de prensa sin indicios explícitos de bulo.',
        priority: 'descartar',
        public_interest_score: 1.0,
        virality_score: 1.0,
        harm_score: 1.0,
        verification_value_score: 1.0,
        commercial_noise_score: 1.0,
        recommended_action: 'ignore'
      };
    }

    let interest = 3.0;
    let harm = 2.0;
    let commNoise = 1.0;
    let valVerify = 5.0;

    if (textLower.includes('ley') || textLower.includes('boe') || textLower.includes('gobierno')) {
      interest = 6.0;
      harm = 4.0;
      valVerify = 8.0;
    }
    if (textLower.includes('okupa') || textLower.includes('okupación')) {
      interest = 9.0;
      harm = 8.0;
      valVerify = 8.0;
    }
    if (textLower.includes('ayuda') || textLower.includes('subsidio') || textLower.includes('inmigra') || textLower.includes('menas')) {
      interest = 8.8;
      harm = 8.5;
      valVerify = 7.5;
    }
    if (textLower.includes('descuento') || textLower.includes('enlace en mi bio') || textLower.includes('compra')) {
      commNoise = 9.0;
    }

    const shouldProcess = (interest >= 7.5 || harm >= 7.5) && commNoise < 7.0 && valVerify >= 7.0 && mentionsDesinfo;

    return {
      should_process: shouldProcess,
      reason: 'Evaluación local heurística restrictiva de fallback por keywords.',
      priority: shouldProcess ? 'alta' : 'descartar',
      public_interest_score: interest,
      virality_score: metrics.score ? Math.min(10.0, 3.0 + metrics.score / 100) : 5.0,
      harm_score: harm,
      verification_value_score: valVerify,
      commercial_noise_score: commNoise,
      recommended_action: shouldProcess ? 'process' : 'ignore'
    };
  }
}
