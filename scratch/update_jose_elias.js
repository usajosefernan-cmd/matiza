import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { buildInfographic } from '../scripts/infographic-system.js';

const dbPath = process.env.MATIZA_DB_PATH || process.env.SQLITE_DB_PATH || '/home/ubuntu/db/matiza/matiza.db';

console.log('Generating updated article and infographic...');

// Data for infographic
const infoData = {
  claim: "José Elías: La vivienda está disparada, emprender es muy difícil y España ha traicionado a su juventud.",
  trick_used: "cherry-picking",
  trick_label: "cherry-picking",
  why: "Selecciona problemas reales de vivienda y empleo, elevándolos a juicios políticos absolutos sin desglose regional ni temporal.",
  sources: [
    "INE: Precios de vivienda y EPA",
    "MIVAU: Índices de referencia",
    "AEAT/SS: Impuestos y cuotas RETA"
  ],
  what_is_true: "Los registros oficiales avalan el alza en vivienda y desempleo juvenil, pero no una traición política.",
  matiza_score: 56,
  emoji_tag: "🧊 Falta contexto"
};

// Build infographic SVG and parts using the monochrome deterministic system
const { svg: infoSvg, parts: infoParts } = buildInfographic(infoData);

// Updated Article values
const title = "El discurso de José Elías sobre la juventud, la vivienda y el emprendimiento en España es engañoso: mezcla datos reales con interpretaciones políticas y omite matices clave";
const subtitle = "Los registros oficiales del INE, MIVAU, SEPE, AEAT y la Seguridad Social confirman problemas en el acceso a la vivienda y desempleo juvenil, pero no avalan la tesis de una traición deliberada.";
const summary = "El claim atribuido al empresario José Elías combina un juicio de valor subjetivo ('España ha traicionado a su juventud') con problemas socioeconómicos reales. Los datos oficiales del INE, MIVAU, SEPE, AEAT y la Seguridad Social respaldan las dificultades en el mercado de la vivienda (precios al alza) y el empleo juvenil (tasas de desempleo elevadas) y una presión fiscal considerable para autónomos. Sin embargo, calificar la situación como una 'traición' deliberada o afirmar de forma absoluta la imposibilidad de emprender constituye una simplificación sesgada que omite medidas de apoyo, regímenes simplificados y diferencias regionales.";

const explanation = `El discurso analizado, cuyos fragmentos y debates virales pueden contrastarse a través de fuentes multimedia no estructuradas, afirma en síntesis que España ha traicionado a su juventud, que emprender es muy difícil por la burocracia y los impuestos, y que la vivienda está disparada. Estas tres aseveraciones requieren un tratamiento separado, ya que combinan elementos con registros estadísticos oficiales con valoraciones subjetivas e intencionales.

Respecto a la **vivienda**, existen series estadísticas oficiales que permiten medir la evolución del mercado de forma objetiva. El [Índice de Precios de la Vivienda (IPV) del Instituto Nacional de Estadística (INE)](https://www.ine.es) y el [Portal del Ministerio de Vivienda y Agenda Urbana (MIVAU)](https://www.mivau.gob.es) muestran una trayectoria general de precios al alza en compra y alquiler en las zonas tensionadas. Sin embargo, no autorizan a hablar de un fenómeno nacional homogéneo ni uniforme, ya que persisten amplias diferencias territoriales y temporales que el claim simplifica sin aportar matices.

En materia de **juventud y mercado laboral**, la [Encuesta de Población Activa (EPA) del INE](https://www.ine.es) y el [Servicio Público de Empleo Estatal (SEPE)](https://www.sepe.gob.es) reflejan una tasa de paro juvenil superior a la media de la Unión Europea y una alta temporalidad en la afiliación. Estos registros avalan la existencia de dificultades socioeconómicas objetivas para los jóvenes, pero no sustentan una causalidad política exclusiva o un acto deliberado de traición por parte de las instituciones.

En cuanto al **emprendimiento**, la [Agencia Estatal de Administración Tributaria (AEAT)](https://www.agenciatributaria.es) e informes sobre presión fiscal muestran que la carga impositiva en España se encuentra en niveles elevados, y la [Seguridad Social](https://www.seg-social.es) detalla que las cuotas y costes de cotización del Régimen Especial de Trabajadores Autónomos (RETA) suponen un coste relevante para el autoempleo. No obstante, existen también medidas de apoyo al emprendimiento juvenil, bonificaciones (como la tarifa plana de autónomos) y trámites digitalizados regulados en leyes estatales que reducen la carga burocrática inicial. Por lo tanto, la afirmación de que emprender es universalmente "muy difícil" de forma absoluta carece de una comparativa internacional rigurosa en el discurso.

La expresión **\"traición a la juventud\"** constituye un juicio político de valor. No existe una métrica estadística pública ni un indicador estandarizado en los portales oficiales para cuantificar o probar dolo, intencionalidad o traición estatal.

En conjunto, el discurso incurre en un sesgo de selección (*cherry-picking*): selecciona problemas socioeconómicos reales y contrastables (como el acceso a la vivienda y el paro juvenil) y los eleva a una conclusión generalizada de fracaso e intencionalidad institucional, omitiendo datos clave de variación, ayudas y comparativas internacionales.`;

// Save to JSON files
const newArticulo = {
  title,
  subtitle,
  summary,
  explanation,
  trick_used: "cherry-picking",
  matiza_score: 56,
  emoji_tag: "🧊 Falta contexto",
  infographic_svg: infoSvg,
  infographic_parts: infoParts
};

fs.writeFileSync('articulo_jose_elias.json', JSON.stringify(newArticulo, null, 2));
console.log('Saved to articulo_jose_elias.json');

const currentExtended = JSON.parse(fs.readFileSync('verificacion_jose_elias_extended.json', 'utf8'));
currentExtended.fact_check.verdict = "Engañoso";
currentExtended.fact_check.what_is_true = "- La carga tributaria total en España es elevada en términos de ingresos tributarios sobre PIB según los datos agregados publicados por la AEAT.\n- Los costes de cotización para trabajadores por cuenta propia (RETA / Seguridad Social) suponen una carga mensual relevante y pueden disuadir el autoempleo inicial.\n- Los índices oficiales de vivienda muestran una tendencia general de precios elevada y dinámica al alza en muchos periodos recientes, especialmente en áreas de alta demanda.";
currentExtended.fact_check.what_is_false = "- No hay demostración oficial en las fuentes dadas de que exista una 'traición' a la juventud como acto político deliberado; es una interpretación valorativa y no un hecho documentado.\n- No es exacto afirmar que sea 'muy difícil emprender por la burocracia' sin más: existen regímenes simplificados, ayudas públicas y facturación electrónica obligatoria que reducen carga administrativa en ciertos trámites.\n- No se ha demostrado que la vivienda esté 'disparada' de forma uniforme en todo el país, sin matizaciones territoriales ni periódicas que muestra la metodología del INE.";
currentExtended.fact_check.what_lacks_context = "- Datos oficiales de paro juvenil (EPA/SEPE) y de creación de empresas por edad, necesarios para calificar el supuesto efecto sobre la juventud.\n- Desglose de IRPF por tramos, deducciones por familia, ayudas a emprendedores y comparativa internacional de fiscalidad.\n- Datos de plazo real de tramitación administrativa para crear una empresa en España, y evolución histórica de ese plazo.\n- Contexto territorial del precio de la vivienda: zonas con subidas muy altas y zonas con descensos o estabilidad en el mismo periodo.";
currentExtended.fact_check.what_is_not_proven = "- La afirmación causativa de que la burocracia y los impuestos son la causa principal del bajo emprendimiento juvenil respecto a otros factores.\n- La afirmación absolutista sobre la vivienda 'disparada' sin periodo, territorio ni tipo de inmueble acotado.\n- El término 'traición' y la intencionalidad política atribuida; no existe evidencia probatoria en los portales oficiales indicados sobre la voluntad deliberada de perjudicar a la juventud.";

fs.writeFileSync('verificacion_jose_elias_extended.json', JSON.stringify(currentExtended, null, 2));
console.log('Saved to verificacion_jose_elias_extended.json');

// Update DB
const db = new DatabaseSync(dbPath);
const stmt = db.prepare(`
  UPDATE articles
  SET title = ?,
      subtitle = ?,
      summary = ?,
      explanation = ?,
      verdict = ?,
      trick_used = ?,
      matiza_score = ?,
      emoji_tag = ?,
      infographic_svg = ?,
      infographic_parts = ?,
      status = ?,
      human_review_required = ?,
      published_at = ?
  WHERE id = ?
`);

stmt.run(
  title,
  subtitle,
  summary,
  explanation,
  "engañoso",
  "cherry-picking",
  56,
  "🧊 Falta contexto",
  infoSvg,
  JSON.stringify(infoParts),
  "borrador",
  1,
  null,
  "art-1784259708415-907"
);

console.log('Successfully updated database row for José Elías article.');
db.close();
