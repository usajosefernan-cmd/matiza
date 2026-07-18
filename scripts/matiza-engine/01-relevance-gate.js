import { runAgentPanel, synthesizeAgentPanel } from './lib/multi-agent.js';
import { clamp, normalizeText } from './lib/text-utils.js';

function metricValue(metrics, keys) {
  for (const key of keys) {
    const value = Number(metrics?.[key]);
    if (Number.isFinite(value)) return value;
  }
  return 0;
}

function viralityFromMetrics(metrics = {}) {
  const views = metricValue(metrics, ['views', 'view_count', 'plays', 'reach', 'impressions']);
  const likes = metricValue(metrics, ['likes', 'like_count']);
  const shares = metricValue(metrics, ['shares', 'reposts', 'retweets']);
  const comments = metricValue(metrics, ['comments', 'replies']);
  const followers = metricValue(metrics, ['followers', 'author_followers']);
  const weighted = Math.log10(1 + views) * 1.7 + Math.log10(1 + shares) * 1.5 + Math.log10(1 + comments) + Math.log10(1 + likes) * 0.5 + Math.log10(1 + followers) * 0.3;
  return clamp(weighted, 0, 10);
}

function deterministicSignals(itemText, platform, metrics = {}) {
  const text = normalizeText(itemText);
  const hasConcreteClaim = /\b(\d+[.,]?\d*%?|millones?|euros?|anos?|meses?|ley|decreto|sentencia|estudio|datos?|obligatorio|prohibido|cura|provoca|aumenta|reduce)\b/i.test(text);
  
  // Detección explícita de las excepciones del plan (salud, dinero, estafas, violencia, elecciones, menores)
  const isCriticalTopic = /\b(salud|tratamiento|cura|cancer|vacuna|estafa|fraude|dinero|robo|euros|violencia|agresion|elecciones|votar|pucherazo|menor|menores|seguridad|armas)\b/i.test(text);
  const hasPublicImpact = isCriticalTopic || /\b(impuestos?|derechos?|empleo|vivienda|justicia|sanidad|pensiones?|ayudas?|consumo)\b/i.test(text);
  
  const isPromotion = /\b(descuento|codigo|enlace|afiliado|patrocinado|compra|oferta|solo hoy|link en bio)\b/i.test(text);
  const isPureOpinion = /\b(creo|pienso|me parece|opino|para mi|me gusta|no me gusta)\b/i.test(text) && !hasConcreteClaim;
  const virality = viralityFromMetrics(metrics);
  return { text, hasConcreteClaim, hasPublicImpact, isPromotion, isPureOpinion, virality, platform, isCriticalTopic };
}

export async function evaluateRelevance(itemText, platform, metrics = {}, signal = null) {
  console.log(`[Relevance Gate] Evaluando relevancia para item de ${platform}...`);
  const deterministic = deterministicSignals(itemText, platform, metrics);
  
  const minimumVirality = Number.parseFloat(process.env.MIN_VIRALITY_SCORE || '3.5');
  const minimumInterest = Number.parseFloat(process.env.MIN_PUBLIC_INTEREST_SCORE || '5.5');

  if (deterministic.isPureOpinion && deterministic.virality < minimumVirality) {
    return {
      should_process: false,
      reason: 'Opinión no verificable y sin señales suficientes de impacto o viralidad.',
      priority: 'descartar',
      public_interest_score: 1,
      virality_score: deterministic.virality,
      harm_score: 1,
      verification_value_score: 1,
      commercial_noise_score: deterministic.isPromotion ? 8 : 1,
      relevance_rating: 10,
      recommended_action: 'ignore',
      deterministic_gate: true
    };
  }

  const agents = [
    { id: 'public-interest', role: 'Evalúa si el asunto constituye un tema de debate social sensible, controvertido, polarizante o de actualidad candente en España.' },
    { id: 'harm', role: 'Evalúa si la polémica o bulo fomenta conflicto, desconfianza en instituciones, división social o afecta derechos y bienestar público.' },
    { id: 'verifiability', role: 'Evalúa si el tema contiene matices complejos, sesgos de opinión disfrazados de datos o información conflictiva que requiera ser contrastada y aclarada.' },
    { id: 'noise', role: 'Filtra y descarta de inmediato sucesos ordinarios cerrados (sentencias definitivas, detenciones cotidianas, sucesos de tráfico comunes) y noticias ordinarias sin controversia o debate social.' }
  ];

  const context = { text: itemText, platform, metrics, deterministic };
  const panel = await runAgentPanel({
    phaseId: '01-panel',
    task: 'Evaluar si el item es un tema sensible de debate y controversia social en España idóneo para Matiza (vivienda, inmigración, subsidios, impuestos, derechos, reformas), o si es ruido de sucesos cotidianos cerrados que debe descartarse.',
    context,
    agents,
    signal
  });

  try {
    const result = await synthesizeAgentPanel({
      phaseId: '01',
      objective: 'Emitir una decisión de triage prudente y cuantificada.',
      context,
      panel,
      schema: {
        should_process: true,
        reason: '...',
        priority: 'alta|media|baja|descartar',
        public_interest_score: 0,
        virality_score: 0,
        harm_score: 0,
        verification_value_score: 0,
        commercial_noise_score: 0,
        recommended_action: 'process|queue|ignore|monitor_only'
      },
      signal
    });

    result.public_interest_score = clamp(result.public_interest_score, 0, 10);
    result.virality_score = Math.max(clamp(result.virality_score, 0, 10), deterministic.virality);
    result.harm_score = clamp(result.harm_score, 0, 10);
    result.verification_value_score = clamp(result.verification_value_score, 0, 10);
    result.commercial_noise_score = clamp(result.commercial_noise_score, 0, 10);

    // Calcular el score total de relevancia de 0 a 100 de forma ponderada
    const totalScore = (
      result.public_interest_score * 3.0 +
      result.virality_score * 2.0 +
      result.harm_score * 2.0 +
      result.verification_value_score * 2.0 +
      (10 - result.commercial_noise_score) * 1.0
    );
    result.relevance_rating = Math.min(100, Math.max(0, Math.round(totalScore)));

    // Determinar la acción exacta según la rúbrica numérica de puntuación del plan
    if (result.relevance_rating >= 80) {
      result.recommended_action = 'process';
      result.priority = 'alta';
    } else if (result.relevance_rating >= 60) {
      result.recommended_action = 'queue';
      result.priority = 'media';
    } else if (result.relevance_rating >= 40) {
      result.recommended_action = 'monitor_only';
      result.priority = 'baja';
    } else {
      result.recommended_action = 'ignore';
      result.priority = 'descartar';
    }

    // Excepciones especiales: Investigar ahora incluso con baja viralidad si es crítico
    if (deterministic.isCriticalTopic && result.relevance_rating >= 40) {
      console.log('[Relevance Gate] Excepción temática crítica detectada (salud/estafas/dinero). Investigar ahora.');
      result.recommended_action = 'process';
      result.priority = 'alta';
      result.should_process = true;
    } else {
      result.should_process = Boolean(
        result.relevance_rating >= 60 && 
        result.verification_value_score >= 4.5 && 
        !deterministic.isPromotion
      );
    }

    result.agent_panel = panel;
    return result;
  } catch (error) {
    const shouldProcess = deterministic.hasConcreteClaim && (deterministic.hasPublicImpact || deterministic.virality >= minimumVirality);
    return {
      should_process: shouldProcess,
      reason: `Fallback determinista: ${error.message}`,
      priority: shouldProcess ? (deterministic.virality >= 6 ? 'alta' : 'media') : 'descartar',
      public_interest_score: deterministic.hasPublicImpact ? 7 : 3,
      virality_score: deterministic.virality,
      harm_score: deterministic.hasPublicImpact ? 6 : 2,
      verification_value_score: deterministic.hasConcreteClaim ? 7 : 2,
      commercial_noise_score: deterministic.isPromotion ? 7 : 1,
      relevance_rating: shouldProcess ? 65 : 25,
      recommended_action: shouldProcess ? 'queue' : 'ignore',
      fallback: true
    };
  }
}
