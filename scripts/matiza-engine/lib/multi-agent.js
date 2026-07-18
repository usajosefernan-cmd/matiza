import { callGemini } from '../config.js';
import { settleMapLimit } from './async-pool.js';
import { clamp } from './text-utils.js';

function normalizeAgentResult(agent, result) {
  const raw = result && typeof result === 'object' ? result : {};
  return {
    agent_id: agent.id,
    role: agent.role,
    confidence: clamp(raw.confidence ?? raw.score ?? 0.5, 0, 1),
    decision: raw.decision ?? raw.recommendation ?? null,
    reasons: Array.isArray(raw.reasons) ? raw.reasons : [],
    warnings: Array.isArray(raw.warnings) ? raw.warnings : [],
    queries: Array.isArray(raw.queries) ? raw.queries : [],
    source_requirements: Array.isArray(raw.source_requirements) ? raw.source_requirements : [],
    payload: raw
  };
}

export async function runAgentPanel({
  phaseId,
  task,
  context,
  agents,
  signal = null,
  concurrency = Number.parseInt(process.env.AGENT_CONCURRENCY || '4', 10)
}) {
  if (!Array.isArray(agents) || agents.length === 0) return [];

  const settled = await settleMapLimit(agents, concurrency, async agent => {
    const prompt = `
Eres un agente especializado dentro de un sistema editorial de verificación. No eres el redactor final.

ROL DEL AGENTE:
${agent.role}

OBJETIVO COMÚN:
${task}

CONTEXTO:
${JSON.stringify(context, null, 2)}

REGLAS:
- Analiza únicamente desde tu especialidad.
- No inventes hechos, cifras, enlaces, citas ni fuentes.
- Expón incertidumbre y límites.
- Si faltan datos, dilo de forma explícita.
- Devuelve solo JSON válido.

FORMATO:
{
  "decision": "string o null",
  "confidence": 0.0,
  "reasons": ["..."],
  "warnings": ["..."],
  "queries": ["..."],
  "source_requirements": ["..."],
  "payload": {}
}`;

    const result = await callGemini(prompt, phaseId, { signal });
    return normalizeAgentResult(agent, result);
  });

  return settled.map((entry, index) => {
    if (entry.status === 'fulfilled') return entry.value;
    return {
      agent_id: agents[index].id,
      role: agents[index].role,
      confidence: 0,
      decision: null,
      reasons: [],
      warnings: [`Agente no disponible: ${entry.reason?.message || String(entry.reason)}`],
      queries: [],
      source_requirements: [],
      payload: {},
      failed: true
    };
  });
}

export async function synthesizeAgentPanel({ phaseId, objective, context, panel, schema, signal = null }) {
  const prompt = `
Eres el coordinador de un panel de agentes de verificación. Debes sintetizar sus análisis sin votar ciegamente y sin inventar información nueva.

OBJETIVO:
${objective}

CONTEXTO ORIGINAL:
${JSON.stringify(context, null, 2)}

RESPUESTAS DEL PANEL:
${JSON.stringify(panel, null, 2)}

REGLAS:
- Da más peso a argumentos fundamentados y a agentes con mayor confianza.
- Conserva desacuerdos relevantes como advertencias.
- No conviertas una hipótesis en un hecho.
- Si faltan pruebas, el resultado debe ser prudente.
- Devuelve solo JSON válido con este esquema:
${JSON.stringify(schema, null, 2)}
`;
  return callGemini(prompt, phaseId, { signal });
}
