// contracts.js - MATIZA Engine Contracts Validator

const VALID_SOURCE_TYPES = ['url', 'text', 'image', 'video', 'rss', 'social', 'manual'];

/**
 * Valida y normaliza un item de entrada.
 */
export function validateItem(item) {
  const errors = [];
  const warnings = [];

  if (!item || typeof item !== 'object') {
    errors.push('El item es inválido o nulo.');
    return { ok: false, item: null, errors };
  }

  const normalized = {
    id: item.id || `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    source_type: item.source_type || 'manual',
    source_url: item.source_url || '',
    raw_text: item.raw_text || item.text || '',
    platform: item.platform || 'manual',
    detected_at: item.detected_at || new Date().toISOString(),
    metadata: item.metadata || {}
  };

  if (!VALID_SOURCE_TYPES.includes(normalized.source_type)) {
    warnings.push(`Tipo de fuente no estándar: ${normalized.source_type}. Usando 'manual'.`);
    normalized.source_type = 'manual';
  }

  if (!normalized.raw_text.trim()) {
    errors.push('El campo raw_text está vacío o ausente.');
  }

  return {
    ok: errors.length === 0,
    item: normalized,
    errors,
    warnings
  };
}

/**
 * Genera una estructura base para la salida de cualquier fase.
 */
export function createPhaseOutput({ phase, inputId, ok = true, result = {}, warnings = [], errors = [], costEstimate = null, nextAction = "" }) {
  return {
    phase,
    input_id: inputId,
    ok,
    result,
    warnings,
    errors,
    cost_estimate: costEstimate,
    next_action: nextAction
  };
}
