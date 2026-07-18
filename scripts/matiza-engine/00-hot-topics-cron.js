import { getDb, callGemini } from './config.js';

export async function detectHotTopics(isDryRun = false, signal = null) {
  const db = getDb();
  console.log('[Hot Topics Cron] Cargando información del radar para análisis de tendencias...');

  // Obtener los últimos 100 items del radar no procesados o recientes para analizar tendencias
  const recentRadarItems = db.prepare(`
    SELECT text, platform, detected_claim, suggested_topic, virality_score, risk_score 
    FROM scraped_items 
    WHERE created_at >= datetime('now', '-7 days')
    ORDER BY virality_score DESC 
    LIMIT 100
  `).all();

  // Obtener verticales existentes
  const existingTopics = db.prepare("SELECT id, title, slug, description FROM topics WHERE status = 'activo'").all();

  console.log(`[Hot Topics Cron] Analizando ${recentRadarItems.length} tendencias frente a ${existingTopics.length} verticales existentes.`);

  const prompt = `
Eres el Director Editorial de MATIZA. Tu tarea es analizar los temas calientes y debates más preocupantes que circulan en España hoy, basándote en los datos del radar y en los verticales ya existentes.

DATOS DEL RADAR (Últimos claims y debates):
${JSON.stringify(recentRadarItems.map(i => ({ claim: i.detected_claim, text: i.text.substring(0, 150), platform: i.platform, virality: i.virality_score })))}

VERTICALES EXISTENTES:
${JSON.stringify(existingTopics.map(t => ({ id: t.id, title: t.title, description: t.description })))}

--- INSTRUCCIONES ---
1. Determina cuáles son los grandes TEMAS DE PREOCUPACIÓN SOCIAL en España en este momento.
2. Ignora rumores comerciales menores, opiniones sin daño, deporte o entretenimiento que no tengan relevancia pública.
3. Si un tema detectado encaja claramente en uno de los VERTICALES EXISTENTES o puede fusionarse con él, indícalo especificando "merge_with_existing_topic" con el id del vertical existente y pon "needs_new_vertical": false.
4. Si es un tema preocupante nuevo de relevancia nacional, sugiere crear un vertical nuevo estableciendo "needs_new_vertical": true.
5. Devuelve la lista en formato JSON con la siguiente estructura exacta por tema:

[
  {
    "topic_id": "[Ej: t-vivienda o t-nuevo-tema]",
    "slug": "[slug-del-tema-en-minusculas-con-guiones]",
    "title": "[Título corto y claro del vertical social en España]",
    "public_concern_summary": "[Resumen detallado de por qué este tema preocupa hoy a la sociedad en España]",
    "why_it_matters": "[Explicación del impacto legal, social, económico o de derechos en el ciudadano]",
    "main_confusions": ["[Confusión 1]", "[Confusión 2]"],
    "source_map_status": "[Descripción del tipo de fuentes oficiales requeridas: BOE, INE, ministerios, etc.]",
    "priority_score": [Número del 1.0 al 10.0 de prioridad],
    "social_heat_score": [Número del 1.0 al 10.0 de calor social/viralidad],
    "risk_score": [Número del 1.0 al 10.0 de riesgo de desinformación/daño],
    "evergreen_score": [Número del 1.0 al 10.0 de interés sostenido a largo plazo],
    "needs_new_vertical": true|false,
    "merge_with_existing_topic": "[ID del vertical existente si debe fusionarse, null en caso contrario]"
  }
]
`;

  let hotTopics = [];
  try {
    const aiOutput = await callGemini(prompt, '00', signal);
    if (Array.isArray(aiOutput)) {
      hotTopics = aiOutput;
    } else if (aiOutput && typeof aiOutput === 'object') {
      const keyWithArray = Object.keys(aiOutput).find(k => Array.isArray(aiOutput[k]));
      if (keyWithArray) {
        hotTopics = aiOutput[keyWithArray];
      } else {
        throw new Error('La respuesta de la IA no contiene una lista de temas.');
      }
    } else {
      throw new Error('La respuesta de la IA no es un JSON estructurado de lista.');
    }
    console.log(`[Hot Topics Cron] La IA ha identificado ${hotTopics.length} verticales calientes.`);
  } catch (err) {
    console.error('[Hot Topics Cron] Fallo al llamar a la IA para clasificar tendencias:', err.message);
    console.log('[Hot Topics Cron] Usando fallback estático dinámico de tendencias.');
    // Fallback básico si la IA falla
    hotTopics = [
      {
        topic_id: 't-vivienda',
        slug: 'vivienda-y-okupacion',
        title: 'Vivienda y Okupación',
        public_concern_summary: 'Preocupación por los plazos de desahucio, usurpación de viviendas vacías frente a allanamiento de morada, y regulación de alquileres.',
        why_it_matters: 'Afecta al derecho constitucional a la vivienda y la propiedad privada en España.',
        main_confusions: ['Mito de las 48 horas para desalojar okupaciones', 'Confundir allanamiento con usurpación'],
        source_map_status: 'BOE, Instrucción de la Fiscalía General 1/2020',
        priority_score: 9.0,
        social_heat_score: 8.5,
        risk_score: 9.0,
        evergreen_score: 9.5,
        needs_new_vertical: false,
        merge_with_existing_topic: 't-vivienda'
      },
      {
        topic_id: 't-migracion',
        slug: 'inmigracion-y-seguridad-social',
        title: 'Inmigración, Delincuencia y Ayudas',
        public_concern_summary: 'Debate en torno a las ayudas asistenciales que reciben los extranjeros y la delincuencia de menores tutelados.',
        why_it_matters: 'Afecta a la cohesión social y el equilibrio de prestaciones de la Seguridad Social.',
        main_confusions: ['Bulos de preferencia en ayudas a inmigrantes', 'Coste de tutela de menores versus pago en efectivo'],
        source_map_status: 'BOE, Ministerio de Inclusión, Seguridad Social y Migraciones',
        priority_score: 8.5,
        social_heat_score: 9.0,
        risk_score: 9.5,
        evergreen_score: 8.0,
        needs_new_vertical: false,
        merge_with_existing_topic: 't-migracion'
      }
    ];
  }

  if (isDryRun) {
    console.log('[Hot Topics Cron] MODO DRY-RUN ACTIVO: Omitiendo guardado en Base de Datos.');
  } else {
    // Insertar o actualizar los verticales en la base de datos
    const insertTopic = db.prepare(`
      INSERT OR REPLACE INTO topics (
        id, slug, title, description, category, header_summary, verdict_summary, confidence, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'activo', datetime('now'), datetime('now'))
    `);

    for (const topic of hotTopics) {
      if (topic.needs_new_vertical) {
        const topicId = topic.topic_id.startsWith('t-') ? topic.topic_id : `t-${topic.slug}`;
        console.log(`[Hot Topics Cron] Creando nuevo vertical vivo: ${topic.title} (${topicId})`);
        insertTopic.run(
          topicId,
          topic.slug,
          topic.title,
          topic.public_concern_summary,
          'Sociedad',
          topic.why_it_matters,
          `Nivel de riesgo estimado: ${topic.risk_score}`,
          'Alta'
        );

        // Guardar en topic_cache
        db.prepare(`
          INSERT OR REPLACE INTO topic_cache (
            topic_id, canonical_summary, trusted_sources_json, recurring_confusions_json, known_claims_json, source_strategy_json, last_updated
          ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `).run(
          topicId,
          topic.public_concern_summary,
          JSON.stringify([]),
          JSON.stringify(topic.main_confusions),
          JSON.stringify([]),
          JSON.stringify({ source_types: [topic.source_map_status] })
        );
      } else if (topic.merge_with_existing_topic) {
        console.log(`[Hot Topics Cron] El tema "${topic.title}" se asocia con el vertical existente: ${topic.merge_with_existing_topic}`);
        // Opcional: Actualizar el vertical existente con los nuevos detalles si se considera útil
        db.prepare(`
          UPDATE topics 
          SET description = ?, updated_at = datetime('now') 
          WHERE id = ?
        `).run(topic.public_concern_summary, topic.merge_with_existing_topic);
      }
    }
  }

  db.close();
  console.log('[Hot Topics Cron] Análisis de temas calientes finalizado con éxito.');
  return hotTopics;
}

// Ejecutar si se corre directamente
if (import.meta.url.endsWith(process.argv[1])) {
  detectHotTopics().catch(err => {
    console.error('[Hot Topics Cron] Error en ejecución autónoma:', err);
  });
}
