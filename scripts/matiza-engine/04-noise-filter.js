import { runAgentPanel, synthesizeAgentPanel } from './lib/multi-agent.js';
import { normalizeText } from './lib/text-utils.js';

export async function filterNoise(itemText, platform, contextOrSignal = {}, maybeSignal = null) {
  const context = contextOrSignal && typeof contextOrSignal === 'object' && !('aborted' in contextOrSignal) ? contextOrSignal : {};
  const signal = context === contextOrSignal ? maybeSignal : contextOrSignal;
  const text = normalizeText(itemText);
  const hasCommercialDisclosure = /afiliad|patrocin|codigo|descuento|enlace|comision|colaboracion pagada/.test(text);
  const hasConcretePromise = /cura|garantiza|obligatorio|el mejor|sin riesgo|gratis|rentabilidad|ahorra|reduce|aumenta|elimina/.test(text);
  const virality = Number(context.virality_score || context.virality || 0);
  const harm = Number(context.harm_score || context.harm || 0);

  if (hasCommercialDisclosure && hasConcretePromise && (virality >= 4 || harm >= 5)) {
    return {
      is_noise: false,
      noise_reason: 'Contenido comercial con promesa verificable y potencial impacto; debe analizarse, no descartarse.',
      keep_monitoring: true,
      requires_processing: true,
      deterministic: true
    };
  }

  const panel = await runAgentPanel({
    phaseId: '04-panel',
    task: 'Clasificar si el contenido es un suceso ordinario y cerrado sin debate (ej. detención común, accidente de tráfico ordinario, noticia policial finalizada) o si contiene una polémica de opinión/hechos abiertos y sensibles que amerite analizarse en Matiza.',
    context: { text: itemText, platform, metrics: context },
    agents: [
      { id: 'noise', role: 'Descarta de inmediato reportajes deportivos, horóscopos, entretenimiento común y noticias de crímenes ordinarios cerrados.' },
      { id: 'debate-exception', role: 'Busca indicios de que el contenido pertenece a un tema de debate social de fondo o polarización (ej. discusiones sobre leyes, impuestos, inmigración, derechos civiles).' },
      { id: 'commercial-audit', role: 'Identifica y descarta autopromoción, spam comercial y lanzamientos de productos ordinarios.' }
    ],
    signal
  });

  try {
    const result = await synthesizeAgentPanel({
      phaseId: '04',
      objective: 'Emitir una decisión de ruido prudente y reversible.',
      context: { text: itemText, platform, metrics: context },
      panel,
      schema: {
        is_noise: false,
        noise_reason: '...',
        keep_monitoring: true,
        requires_processing: true,
        confidence: 0
      },
      signal
    });
    result.agent_panel = panel;
    return result;
  } catch (error) {
    return {
      is_noise: !hasConcretePromise && virality < 3 && harm < 3,
      noise_reason: `Fallback conservador: ${error.message}`,
      keep_monitoring: virality >= 3,
      requires_processing: hasConcretePromise || virality >= 5 || harm >= 5,
      fallback: true
    };
  }
}
