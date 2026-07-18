import { getDb } from './config.js';
import crypto from 'node:crypto';

function syncSleep(ms) {
  try {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  } catch (e) {
    const start = Date.now();
    while (Date.now() - start < ms) {}
  }
}

function runWriteWithRetry(db, runFn, maxRetries = 5, initialDelay = 100) {
  let attempt = 0;
  while (true) {
    try {
      return runFn();
    } catch (err) {
      const isBusy = err.code === 'SQLITE_BUSY' ||
                     (err.message && (err.message.includes('locked') || err.message.includes('busy') || err.message.includes('SQLITE_BUSY')));
      if (isBusy && attempt < maxRetries) {
        attempt++;
        const backoff = initialDelay * Math.pow(2, attempt - 1) * (0.5 + Math.random());
        console.warn(`[SQLite Cache Write Retry] Database locked/busy. Retrying attempt ${attempt}/${maxRetries} in ${Math.round(backoff)}ms...`);
        syncSleep(backoff);
      } else {
        throw err;
      }
    }
  }
}

export function getNormalizedClaimHash(claimText) {
  const normalized = claimText
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .replace(/[^a-z0-9]/g, ''); // Dejar solo letras y números

  return crypto.createHash('md5').update(normalized).digest('hex');
}

export function getTopicCache(topicId, dbArg) {
  const db = dbArg || getDb();
  try {
    const row = db.prepare("SELECT * FROM topic_cache WHERE topic_id = ?").get(topicId);
    if (!row) return null;
    return {
      topic_id: row.topic_id,
      canonical_summary: row.canonical_summary,
      trusted_sources: JSON.parse(row.trusted_sources_json || '[]'),
      recurring_confusions: JSON.parse(row.recurring_confusions_json || '[]'),
      known_claims: JSON.parse(row.known_claims_json || '[]'),
      source_strategy: JSON.parse(row.source_strategy_json || '{}'),
      last_updated: row.last_updated
    };
  } catch (e) {
    console.error(`[Cache] Error al obtener topic_cache para ${topicId}:`, e.message);
    return null;
  } finally {
    if (!dbArg) {
      db.close();
    }
  }
}

export function setTopicCache(topicId, data, dbArg) {
  const db = dbArg || getDb();
  try {
    runWriteWithRetry(db, () => {
      db.prepare(`
        INSERT OR REPLACE INTO topic_cache (
          topic_id, canonical_summary, trusted_sources_json, recurring_confusions_json, known_claims_json, source_strategy_json, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        topicId,
        data.canonical_summary || '',
        JSON.stringify(data.trusted_sources || []),
        JSON.stringify(data.recurring_confusions || []),
        JSON.stringify(data.known_claims || []),
        JSON.stringify(data.source_strategy || {})
      );
    });
    return true;
  } catch (e) {
    console.error(`[Cache] Error al escribir topic_cache para ${topicId}:`, e.message);
    throw e;
  } finally {
    if (!dbArg) {
      db.close();
    }
  }
}

export function getClaimCache(claimText, dbArg) {
  const hash = getNormalizedClaimHash(claimText);
  const db = dbArg || getDb();
  try {
    const row = db.prepare("SELECT * FROM claim_cache WHERE normalized_claim_hash = ?").get(hash);
    if (!row) return null;

    // Check TTL (24 hours)
    const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
    const lastSeenDate = new Date(row.last_seen.includes('T') ? row.last_seen : row.last_seen.replace(' ', 'T') + 'Z');
    const isExpired = isNaN(lastSeenDate.getTime()) || (Date.now() - lastSeenDate.getTime() > CACHE_TTL_MS);
    if (isExpired) {
      console.log(`[Cache] Claim cache expired for hash: ${hash}`);
      return null;
    }

    return {
      normalized_claim_hash: row.normalized_claim_hash,
      similar_claims: JSON.parse(row.similar_claims_json || '[]'),
      previous_verdict: row.previous_verdict,
      previous_sources: JSON.parse(row.previous_sources_json || '[]'),
      previous_article_id: row.previous_article_id,
      reuse_allowed: !!row.reuse_allowed,
      last_seen: row.last_seen
    };
  } catch (e) {
    console.error('[Cache] Error al obtener claim_cache:', e.message);
    return null;
  } finally {
    if (!dbArg) {
      db.close();
    }
  }
}

export function setClaimCache(claimText, data, dbArg) {
  const hash = getNormalizedClaimHash(claimText);
  const db = dbArg || getDb();
  try {
    runWriteWithRetry(db, () => {
      db.prepare(`
        INSERT OR REPLACE INTO claim_cache (
          normalized_claim_hash, similar_claims_json, previous_verdict, previous_sources_json, previous_article_id, reuse_allowed, last_seen
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        hash,
        JSON.stringify(data.similar_claims || []),
        data.previous_verdict || '',
        JSON.stringify(data.previous_sources || []),
        data.previous_article_id || '',
        data.reuse_allowed ? 1 : 0
      );
    });
    return true;
  } catch (e) {
    console.error('[Cache] Error al escribir claim_cache:', e.message);
    throw e;
  } finally {
    if (!dbArg) {
      db.close();
    }
  }
}

export function getSourceStrategyCache(semanticArea, dbArg) {
  const db = dbArg || getDb();
  try {
    const row = db.prepare("SELECT * FROM source_strategy_cache WHERE semantic_area = ?").get(semanticArea);
    if (!row) return null;
    return {
      semantic_area: row.semantic_area,
      source_types: JSON.parse(row.source_types_json || '[]'),
      preferred_sources: JSON.parse(row.preferred_sources_json || '[]'),
      validation_rules: JSON.parse(row.validation_rules_json || '{}'),
      last_successful_use: row.last_successful_use
    };
  } catch (e) {
    console.error('[Cache] Error al obtener source_strategy_cache:', e.message);
    return null;
  } finally {
    if (!dbArg) {
      db.close();
    }
  }
}

export function setSourceStrategyCache(semanticArea, data, dbArg) {
  const db = dbArg || getDb();
  try {
    runWriteWithRetry(db, () => {
      db.prepare(`
        INSERT OR REPLACE INTO source_strategy_cache (
          semantic_area, source_types_json, preferred_sources_json, validation_rules_json, last_successful_use
        ) VALUES (?, ?, ?, ?, datetime('now'))
      `).run(
        semanticArea,
        JSON.stringify(data.source_types || []),
        JSON.stringify(data.preferred_sources || []),
        JSON.stringify(data.validation_rules || {})
      );
    });
    return true;
  } catch (e) {
    console.error('[Cache] Error al escribir source_strategy_cache:', e.message);
    throw e;
  } finally {
    if (!dbArg) {
      db.close();
    }
  }
}
