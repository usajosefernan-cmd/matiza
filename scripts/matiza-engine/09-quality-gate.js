import { runAgentPanel, synthesizeAgentPanel } from './lib/multi-agent.js';

function deterministicChecks(articleData, verdict, sources = []) {
  const errors = [];
  const warnings = [];
  const text = `${articleData?.title || ''} ${articleData?.subtitle || ''} ${articleData?.summary || ''} ${articleData?.explanation || ''}`;
  if (!articleData?.title || !articleData?.explanation) errors.push('Faltan título o explicación.');
  if (!verdict) errors.push('Falta veredicto.');
  if (!Array.isArray(articleData?.source_refs) || articleData.source_refs.length === 0) errors.push('No hay referencias de fuente trazables.');
  if ((sources || []).filter(source => source.authority_level === 'Máxima' || source.source_type === 'oficial').length === 0) warnings.push('No hay fuente primaria u oficial.');
  if (/100%|totalmente demostrado|sin ninguna duda|es culpable/i.test(text) && !/sentencia firme|prueba concluyente/i.test(text)) errors.push('Lenguaje absoluto no justificado.');
  if (/explicado para tontos|gente inculta/i.test(text)) errors.push('Lenguaje paternalista o despectivo.');
  if ((verdict === 'Sin pruebas suficientes' || verdict === 'No verificable') && /\b(es falso|es verdadero|queda demostrado)\b/i.test(text)) errors.push('El artículo contradice un veredicto prudente.');
  return { errors, warnings };
}

export async function checkQuality(articleData, verdict, sourcesOrSignal = [], maybeSignal = null) {
  const sources = Array.isArray(sourcesOrSignal) ? sourcesOrSignal : [];
  const signal = Array.isArray(sourcesOrSignal) ? maybeSignal : sourcesOrSignal;
  const deterministic = deterministicChecks(articleData, verdict, sources);
  if (deterministic.errors.length) {
    return {
      passed: false,
      reason: 'Fallo determinista previo a la auditoría de IA.',
      corrections_required: deterministic.errors,
      warnings: deterministic.warnings,
      quality_score: 0
    };
  }

  const context = { article: articleData, verdict, sources };
  const panel = await runAgentPanel({
    phaseId: '09-panel',
    task: 'Auditar el borrador y detectar contradicciones, sesgo, referencias inexistentes, sobreafirmación y riesgo legal.',
    context,
    agents: [
      { id: 'fact-consistency', role: 'Comprueba coherencia entre claim, veredicto, artículo y fuentes.' },
      { id: 'reader-defender', role: 'Comprueba claridad, neutralidad y ausencia de manipulación editorial.' },
      { id: 'legal-risk', role: 'Detecta difamación, culpabilidad prematura, datos personales y riesgo legal.' },
      { id: 'source-auditor', role: 'Comprueba trazabilidad y suficiencia de las referencias.' }
    ],
    signal
  });

  try {
    const result = await synthesizeAgentPanel({
      phaseId: '09',
      objective: 'Decidir si el artículo puede pasar a revisión humana rápida. Ante duda, bloquear.',
      context,
      panel,
      schema: {
        passed: false,
        reason: '...',
        corrections_required: ['...'],
        warnings: ['...'],
        quality_score: 0,
        human_review_required: true
      },
      signal
    });
    result.passed = Boolean(result.passed && Number(result.quality_score || 0) >= Number.parseFloat(process.env.MIN_QUALITY_SCORE || '7.5'));
    result.human_review_required = true;
    result.agent_panel = panel;
    return result;
  } catch (error) {
    return {
      passed: false,
      reason: `La auditoría de calidad no pudo completarse: ${error.message}`,
      corrections_required: ['Reprocesar quality gate o revisar manualmente antes de publicar.'],
      warnings: deterministic.warnings,
      quality_score: 0,
      human_review_required: true,
      fallback: true
    };
  }
}
