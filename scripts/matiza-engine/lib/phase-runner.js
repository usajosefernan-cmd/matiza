// phase-runner.js - MATIZA Engine Phase Runner Wrapper
import { logPhase } from './logger.js';
import { createPhaseOutput } from './contracts.js';

/**
 * Ejecuta una fase del pipeline de forma controlada y resiliente.
 * @param {string} phaseName - Nombre identificativo de la fase (ej: "01-relevance-gate").
 * @param {string} inputId - Identificador único de la señal o claim de entrada.
 * @param {function} phaseFn - Función asíncrona que ejecuta el análisis de la fase.
 * @param {object} args - Parámetros a pasar a la función de la fase.
 */
export async function runPhase(phaseName, inputId, phaseFn, ...args) {
  const startTime = Date.now();
  console.log(`\n🔹 [Ejecutando Fase] ${phaseName} para entrada: ${inputId}...`);
  
  try {
    const resultData = await phaseFn(...args);
    const durationMs = Date.now() - startTime;
    
    // Si la función ya devuelve el contrato formateado, lo adaptamos
    const output = createPhaseOutput({
      phase: phaseName,
      inputId,
      ok: resultData.ok !== false,
      result: resultData.result || resultData,
      warnings: resultData.warnings || [],
      errors: resultData.errors || [],
      costEstimate: resultData.cost_estimate || 0.0,
      nextAction: resultData.next_action || ""
    });

    logPhase({
      phase: phaseName,
      inputId,
      success: output.ok,
      result: output.result,
      warnings: output.warnings,
      errors: output.errors,
      durationMs,
      costEstimate: output.cost_estimate
    });

    return output;
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const output = createPhaseOutput({
      phase: phaseName,
      inputId,
      ok: false,
      errors: [err.message]
    });

    logPhase({
      phase: phaseName,
      inputId,
      success: false,
      errors: [err.message],
      durationMs
    });

    return output;
  }
}
