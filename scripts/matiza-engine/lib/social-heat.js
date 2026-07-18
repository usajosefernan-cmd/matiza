import { getDb } from '../config.js';

/**
 * Calcula el Social Heat Score real (0.0 - 10.0) de un post/claim en base al histórico de SQLite.
 * Combina velocidad, aceleración, alcance, cuentas duplicadas, salto multiplataforma y variables de control.
 */
export async function calculateSocialHeat(post_id, platform, currentMetrics = {}, options = {}) {
  const db = getDb();
  
  const views = Number(currentMetrics.views || 0);
  const likes = Number(currentMetrics.likes || 0);
  const shares = Number(currentMetrics.shares || 0);
  const comments = Number(currentMetrics.comments || 0);
  const riskScore = Number(options.riskScore || 5.0); // 0-10
  const hasNoSources = options.hasNoSources ? 1 : 0;

  // 1. Guardar registro actual en el histórico
  try {
    // Evitar duplicados exactos en el mismo minuto para no alterar las derivadas
    const lastHistory = db.prepare(`
      SELECT captured_at FROM social_metrics_history 
      WHERE post_id = ? 
      ORDER BY captured_at DESC LIMIT 1
    `).get(post_id);

    const nowStr = new Date().toISOString();
    let shouldInsert = true;
    if (lastHistory) {
      const diffMs = Date.now() - new Date(lastHistory.captured_at).getTime();
      if (diffMs < 30000) { // Menos de 30 segundos, omitir inserción
        shouldInsert = false;
      }
    }
    
    if (shouldInsert) {
      db.prepare(`
        INSERT INTO social_metrics_history (post_id, views, likes, shares, comments, captured_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(post_id, views, likes, shares, comments, nowStr);
    }
  } catch (err) {
    console.warn('[Social Heat] Error guardando histórico de métricas:', err.message);
  }

  // 2. Recuperar histórico para derivadas
  let velocity = 0.0;
  let acceleration = 0.0;
  
  try {
    const history = db.prepare(`
      SELECT * FROM social_metrics_history 
      WHERE post_id = ? 
      ORDER BY captured_at DESC LIMIT 3
    `).all(post_id);

    if (history.length >= 2) {
      const h0 = history[0];
      const h1 = history[1];
      const t0 = new Date(h0.captured_at).getTime();
      const t1 = new Date(h1.captured_at).getTime();
      const dt1 = (t0 - t1) / 60000; // En minutos

      if (dt1 > 0.05) { // Evitar división por cero
        const engagement0 = (h0.likes || 0) + (h0.shares || 0) * 2 + (h0.comments || 0) * 3 + (h0.views || 0) * 0.01;
        const engagement1 = (h1.likes || 0) + (h1.shares || 0) * 2 + (h1.comments || 0) * 3 + (h1.views || 0) * 0.01;
        const dEng1 = Math.max(0, engagement0 - engagement1);
        velocity = dEng1 / dt1; // Interacciones por minuto

        if (history.length >= 3) {
          const h2 = history[2];
          const t2 = new Date(h2.captured_at).getTime();
          const dt2 = (t1 - t2) / 60000;

          if (dt2 > 0.05) {
            const engagement2 = (h2.likes || 0) + (h2.shares || 0) * 2 + (h2.comments || 0) * 3 + (h2.views || 0) * 0.01;
            const dEng2 = Math.max(0, engagement1 - engagement2);
            const prevVelocity = dEng2 / dt2;
            
            const dtAvg = (dt1 + dt2) / 2;
            acceleration = (velocity - prevVelocity) / dtAvg;
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Social Heat] Error calculando derivadas del histórico:', err.message);
  }

  // 3. Alcance Absoluto
  const reach = likes + shares * 2.5 + comments * 4.0 + views * 0.05;

  // 4. Salto Multiplataforma y Amplitud
  let multiplatformCount = 1;
  let accountSpreadCount = 1;
  try {
    if (options.detectedClaim) {
      const norm = String(options.detectedClaim).toLowerCase().replace(/[^\w\s]/g, '').trim();
      const word = norm.split(/\s+/).filter(w => w.length > 4)[0] || '___';
      
      // Contar en cuántas plataformas distintas se repite un claim similar
      const platforms = db.prepare(`
        SELECT DISTINCT platform FROM scraped_items 
        WHERE text LIKE ? AND id != ?
      `).all(`%${word}%`, post_id);
      multiplatformCount = 1 + platforms.length;

      // Contar cuentas independientes
      const accounts = db.prepare(`
        SELECT COUNT(DISTINCT author_public_name) as count FROM scraped_items 
        WHERE text LIKE ?
      `).get(`%${word}%`);
      accountSpreadCount = accounts?.count || 1;
    }
  } catch (err) {
    console.warn('[Social Heat] Error calculando propagación:', err.message);
  }

  // 5. Normalizar variables a escalas de 0 a 10
  const nVelocity = Math.min(10.0, velocity / 50.0);       // 10 puntos si crece a 50 interacciones/minuto
  const nAcceleration = Math.min(10.0, Math.max(0, acceleration) / 10.0);
  const nReach = Math.min(10.0, reach / 10000.0);         // 10 puntos si acumula 10.000 alcance equivalente
  const nSpread = Math.min(10.0, accountSpreadCount / 5.0); // 10 puntos si 5 cuentas independientes lo replican
  const nMulti = Math.min(10.0, (multiplatformCount - 1) * 5.0);
  
  // 6. Aplicar ponderación configurable del Plan de Especificación
  const wVelocity = Number(process.env.WEIGHT_VELOCITY || 0.25);
  const wAcceleration = Number(process.env.WEIGHT_ACCELERATION || 0.20);
  const wReach = Number(process.env.WEIGHT_REACH || 0.15);
  const wSpread = Number(process.env.WEIGHT_SPREAD || 0.15);
  const wMulti = Number(process.env.WEIGHT_MULTI || 0.10);
  const wDamage = Number(process.env.WEIGHT_DAMAGE || 0.10);
  const wNoSources = Number(process.env.WEIGHT_NOSOURCES || 0.05);

  const rawHeat = (
    nVelocity * wVelocity +
    nAcceleration * wAcceleration +
    nReach * wReach +
    nSpread * wSpread +
    nMulti * wMulti +
    riskScore * wDamage +
    (hasNoSources ? 10.0 : 0.0) * wNoSources
  );

  const finalHeat = Math.min(10.0, Math.max(0.0, Number(rawHeat.toFixed(2))));
  
  return {
    social_heat: finalHeat,
    details: {
      velocity: Number(velocity.toFixed(2)),
      acceleration: Number(acceleration.toFixed(2)),
      reach,
      multiplatformCount,
      accountSpreadCount,
      components: {
        nVelocity,
        nAcceleration,
        nReach,
        nSpread,
        nMulti
      }
    }
  };
}
