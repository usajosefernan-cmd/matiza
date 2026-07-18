// safe-json.js - MATIZA Engine Safe JSON Utility

/**
 * Parsea un string JSON de forma segura. Retorna fallback si falla.
 */
export function safeParse(str, fallback = {}) {
  if (typeof str !== 'string' || !str.trim()) {
    return fallback;
  }
  try {
    return JSON.parse(str);
  } catch (err) {
    console.warn(`[Safe JSON] Error al parsear JSON: ${err.message}. Retornando fallback.`);
    return fallback;
  }
}

/**
 * Stringifica un objeto de forma segura, previniendo referencias circulares.
 */
export function safeStringify(obj, space = 2) {
  try {
    const cache = new Set();
    const result = JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return '[Circular]';
        }
        cache.add(value);
      }
      return value;
    }, space);
    cache.clear();
    return result;
  } catch (err) {
    console.error(`[Safe JSON] Error al formatear JSON: ${err.message}`);
    return '{}';
  }
}
