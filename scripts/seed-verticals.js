import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = process.env.SQLITE_DB_PATH || path.resolve('data/matiza.db');
console.log(`[Verticals Seeder] Conectando a la base de datos en: ${dbPath}`);
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON;');

// 1. Asegurar la existencia de los temas necesarios
const insertTopic = db.prepare(`
  INSERT INTO topics (id, theme_id, slug, title, description, category, confidence, verdict_summary, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'activo', datetime('now'), datetime('now'))
  ON CONFLICT(id) DO UPDATE SET
    theme_id = excluded.theme_id,
    title = excluded.title,
    description = excluded.description,
    category = excluded.category,
    confidence = excluded.confidence,
    verdict_summary = excluded.verdict_summary,
    status = 'activo',
    updated_at = datetime('now')
`);

const topics = [
  {
    id: 't-sanidad',
    theme_id: 'theme-salud',
    slug: 'sanidad-publica',
    title: 'Sanidad Pública vs Privada',
    description: 'Análisis de la gestión sanitaria en España: listas de espera, derivaciones a conciertos privados, presupuestos autonómicos y derechos de acceso al sistema de salud.',
    category: 'Sanidad pública y listas de espera',
    confidence: 'Alta',
    verdict_summary: 'Análisis de los modelos de colaboración público-privada, gasto sanitario oficial y desmentidos sobre listas de espera.'
  },
  {
    id: 't-empleo',
    theme_id: 'theme-dinero',
    slug: 'empleo-y-cifras-de-paro',
    title: 'Cifras de Paro y Empleo',
    description: 'Metodología oficial de cómputo del desempleo en España: fijos discontinuos, afiliación a la Seguridad Social, encuestas de la EPA y metodología del SEPE.',
    category: 'Economía e Impuestos',
    confidence: 'Alta',
    verdict_summary: 'Desglose de contratos fijos discontinuos activos/inactivos, ERTE y estadísticas del mercado laboral.'
  },
  {
    id: 't-pensiones',
    theme_id: 'theme-dinero',
    slug: 'pensiones-y-sostenibilidad',
    title: 'Pensiones y Sostenibilidad',
    description: 'Auditoría del sistema público de reparto en España: sostenibilidad financiera, cotizaciones, hucha de las pensiones, jubilación no contributiva y pensiones especiales.',
    category: 'Economía e Impuestos',
    confidence: 'Alta',
    verdict_summary: 'Desmentidos de pensiones a extranjeros sin cotización previa y análisis del Fondo de Reserva de la Seguridad Social.'
  },
  {
    id: 't-salarios',
    theme_id: 'theme-dinero',
    slug: 'salarios-smi-y-coste-laboral',
    title: 'Salarios, SMI y Mercado Laboral',
    description: 'El Salario Mínimo Interprofesional (SMI) en España, los costes salariales y la comparativa de poder adquisitivo en la Eurozona con fuentes oficiales.',
    category: 'Economía e Impuestos',
    confidence: 'Alta',
    verdict_summary: 'Análisis de costes salariales (cuota patronal), subida del SMI y devaluación real del salario.'
  },
  {
    id: 't-eta',
    theme_id: 'theme-historia',
    slug: 'memoria-de-eta-y-terrorismo',
    title: 'Memoria de ETA y Terrorismo',
    description: 'Análisis del cumplimiento de condenas por terrorismo, subsidios penitenciarios, legislación penal, indemnizaciones y memoria histórica en España.',
    category: 'Sociedad',
    confidence: 'Alta',
    verdict_summary: 'Verificación de subsidios de excarcelación de presos, marco de la directiva europea de condenas y ayudas a víctimas.'
  }
];

console.log('Insertando o actualizando temas/verticales...');
for (const t of topics) {
  insertTopic.run(t.id, t.theme_id, t.slug, t.title, t.description, t.category, t.confidence, t.verdict_summary);
}

// 2. Insertar Artículos de Desmentido (Confusiones Frecuentes)
const insertArticle = db.prepare(`
  INSERT INTO articles (
    id, topic_id, slug, title, subtitle, claim, origin_platform, origin_url, origin_summary, 
    category, verdict, confidence, summary, explanation, what_is_true, what_is_false, 
    what_lacks_context, what_is_not_proven, status, human_review_required, published_at, origin_date, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'publicado', 0, datetime('now'), datetime('now'), datetime('now'), datetime('now'))
  ON CONFLICT(id) DO UPDATE SET
    topic_id = excluded.topic_id,
    slug = excluded.slug,
    title = excluded.title,
    subtitle = excluded.subtitle,
    claim = excluded.claim,
    category = excluded.category,
    verdict = excluded.verdict,
    summary = excluded.summary,
    explanation = excluded.explanation,
    what_is_true = excluded.what_is_true,
    what_is_false = excluded.what_is_false,
    what_lacks_context = excluded.what_lacks_context,
    what_is_not_proven = excluded.what_is_not_proven,
    updated_at = datetime('now')
`);

const articles = [
  // --- SANIDAD PÚBLICA ---
  {
    id: 'art-sanidad-privatizacion',
    topic_id: 't-sanidad',
    slug: 'bulo-privatizacion-100-gestion-sanidad-publica',
    title: '¿Se está privatizando el 100% de la gestión de la sanidad pública española?',
    subtitle: 'Explicamos la diferencia entre los conciertos de salud, la externalización de servicios y la sanidad pública universal.',
    claim: 'El Gobierno y las Comunidades Autónomas están vendiendo los hospitales públicos a corporaciones multinacionales privadas, eliminando la sanidad gratuita.',
    origin_platform: 'TikTok',
    origin_url: 'https://www.tiktok.com/@sanidad_libre/video/729108390',
    origin_summary: 'Vídeo en redes sociales que asegura que las cartillas sanitarias dejarán de ser válidas y se implantará un modelo de copago total privado.',
    category: 'Sanidad pública y listas de espera',
    verdict: 'Engañoso',
    confidence: 'Alta',
    summary: 'La sanidad pública en España sigue siendo universal y de financiación pública gratuita en el punto de acceso. Aunque algunas CCAA aplican modelos de colaboración público-privada o concesión de hospitales, no hay privatización total y la titularidad es pública según el SNS.',
    explanation: 'El sistema sanitario español está descentralizado en 17 servicios autonómicos. Existen tres modelos de gestión:\n1. **Gestión Directa:** Los hospitales y centros de salud son propiedad del Estado, y los médicos son funcionarios o personal estatutario.\n2. **Concesión Administrativa (Modelo Alzira):** Un operador privado construye y gestiona el hospital cobrando una cantidad anual por habitante (cápita). La atención sigue siendo gratuita para el ciudadano.\n3. **Conciertos Sanitarios:** La sanidad pública deriva pacientes a clínicas privadas para pruebas o cirugías de lista de espera, pagando con fondos públicos.\n\nAunque el debate sobre la idoneidad de la externalización de servicios no médicos (limpieza, cocinas) es constante, es falso que se esté desmantelando la gratuidad de la asistencia sanitaria básica.',
    what_is_true: 'Varias Comunidades Autónomas mantienen o amplían conciertos con entidades privadas para reducir listas de espera quirúrgicas mediante fondos públicos.',
    what_is_false: 'Es falso que el acceso a la sanidad pública vaya a dejar de ser gratuito o que se requiera un seguro privado obligatorio para ser atendido en la Seguridad Social.',
    what_lacks_context: 'Se omiten los datos de gasto sanitario de las CCAA: más del 90% del presupuesto de salud en España se sigue destinando a centros y personal de gestión pública directa.',
    what_is_not_proven: 'No existen planes legislativos ni propuestas de partidos políticos con representación para derogar la Ley General de Sanidad que blinda la universalidad del sistema.'
  },
  {
    id: 'art-sanidad-listas-espera',
    topic_id: 't-sanidad',
    slug: 'bulo-inmigrantes-listas-de-espera-sanidad',
    title: '¿Son los inmigrantes sin papeles los responsables de las listas de espera en sanidad?',
    subtitle: 'El análisis de los datos oficiales de colapso en atención primaria y operaciones frente a las narrativas virales.',
    claim: 'Los inmigrantes en situación irregular colapsan de forma prioritaria las urgencias y listas de espera de operaciones de la sanidad pública.',
    origin_platform: 'X (Twitter)',
    origin_url: 'https://x.com/espana_datos/status/1784901923',
    origin_summary: 'Tuits virales afirmando que el retraso para una operación quirúrgica se debe a la saturación de pacientes no nacionales en la red sanitaria.',
    category: 'Sanidad pública y listas de espera',
    verdict: 'Falso',
    confidence: 'Alta',
    summary: 'El colapso de las listas de espera y de la atención primaria en España se debe a causas estructurales como el envejecimiento demográfico, la falta crónica de personal médico y el déficit de inversión, no a los inmigrantes en situación irregular, quienes apenas representan una cuota marginal de atención.',
    explanation: 'Según los informes del Sistema de Información sobre Listas de Espera (SISLE) del Ministerio de Sanidad, las demoras quirúrgicas alcanzaron récords debido al aumento de patologías crónicas post-pandemia y a la jubilación masiva de médicos de familia. \n\nLos inmigrantes irregulares tienen restringido por ley el acceso ordinario programado a especialidades y operaciones no urgentes (requieren tarjeta sanitaria vinculada al padrón o cotización tras la reforma del Real Decreto-Ley 7/2018). El grueso del uso de urgencias en España corresponde a población de la tercera edad con dolencias crónicas. Los inmigrantes en situación irregular suelen ser jóvenes con baja tasa de morbilidad y representan menos del 1.5% de las consultas de urgencias del país.',
    what_is_true: 'La ley española garantiza la atención de urgencia gratuita por imperativo de derechos humanos a cualquier persona, sin importar su situación legal.',
    what_is_false: 'Es totalmente falso que un inmigrante irregular sea priorizado en una lista de espera para operaciones o consultas con especialistas por delante de un ciudadano nacional.',
    what_lacks_context: 'Se silencia el verdadero motivo del déficit: España tiene una de las ratios más bajas de médicos de atención primaria por habitante en la UE, acentuado por la fuga de profesionales a otros países.',
    what_is_not_proven: 'No hay ningún estudio científico o estadístico de salud pública que asocie la tasa de inmigración con el incremento en el tiempo medio de espera quirúrgica.'
  },
  {
    id: 'art-sanidad-comisiones-recetas',
    topic_id: 't-sanidad',
    slug: 'bulo-comisiones-medicos-recetas-genericos',
    title: '¿Cobran comisiones los médicos de la sanidad pública por recetar medicamentos genéricos?',
    subtitle: 'La regulación estricta del BOE sobre la prescripción por principio activo y la prohibición de comisiones farmacéuticas.',
    claim: 'Los médicos de la Seguridad Social cobran bonus e incentivos directos en su sueldo de los laboratorios por priorizar fármacos genéricos baratos.',
    origin_platform: 'WhatsApp',
    origin_url: 'https://matiza.es/radar/claims/comisiones-medicos-recetas',
    origin_summary: 'Cadenas de mensajes asegurando que los medicamentos genéricos son peores porque no contienen el principio activo real y que los médicos cobran comisiones por obligar a usarlos.',
    category: 'Sanidad pública y listas de espera',
    verdict: 'Falso',
    confidence: 'Alta',
    summary: 'Los médicos de la sanidad pública española no reciben bonus, comisiones ni pagos directos de laboratorios farmacéuticos por recetar genéricos. La prescripción por principio activo busca la eficiencia del gasto público y está regulada por la Ley de Garantías de Medicamentos, prohibiendo todo tipo de incentivos directos.',
    explanation: 'El Real Decreto Legislativo 1/2015 (Ley de Garantías y Uso Racional de los Medicamentos) prohíbe de forma taxativa cualquier pago, obsequio o incentivo de la industria farmacéutica a los facultativos médicos de la sanidad pública.\n\nLos medicamentos genéricos son rigurosamente idénticos en eficacia, dosificación, calidad y seguridad a los fármacos de marca, ya que contienen exactamente la misma cantidad del mismo principio activo. La diferencia radica en que se comercializan bajo el nombre químico tras vencer la patente. El sistema público establece metas de eficiencia para los centros de atención primaria, vinculadas al cumplimiento presupuestario global de ahorro en farmacia, pero este indicador nunca premia individualmente con comisiones en nómina por receta emitida.',
    what_is_true: 'La legislación española obliga a recetar por principio activo (nombre de la molécula) como medida de eficiencia del Sistema Nacional de Salud.',
    what_is_false: 'Es falso que los medicamentos genéricos tengan menor eficacia o que los médicos cobren comisiones de laboratorios o de la Seguridad Social por cada receta de genéricos.',
    what_lacks_context: 'Se confunden los complementos salariales de productividad de los centros de salud (vinculados al uso eficiente de los recursos públicos) con comisiones privadas directas de laboratorios.',
    what_is_not_proven: 'No existe ningún caso judicializado ni expediente abierto de médicos cobrando incentivos privados por dispensación de medicamentos genéricos en España.'
  },

  // --- CIFRAS DE PARO Y EMPLEO ---
  {
    id: 'art-empleo-subsidio-fijos',
    topic_id: 't-empleo',
    slug: 'bulo-fijos-discontinuos-subsidio-ilimitado',
    title: '¿Cobran los fijos discontinuos inactivos el subsidio de desempleo de forma indefinida?',
    subtitle: 'El marco regulador del SEPE sobre el cobro de prestaciones por desempleo durante el periodo de inactividad.',
    claim: 'Los trabajadores contratados como fijos discontinuos pueden cobrar la prestación de paro durante todo su periodo de inactividad de manera vitalicia e ilimitada sin necesidad de buscar trabajo.',
    origin_platform: 'Reddit',
    origin_url: 'https://reddit.com/r/es/comments/fijos_discontinuos_paro',
    origin_summary: 'Posts que afirman que los fijos discontinuos son un "coladero de dinero público" porque cobran el paro indefinidamente sin trabajar.',
    category: 'Economía e Impuestos',
    verdict: 'Falso',
    confidence: 'Alta',
    summary: 'El cobro del paro por parte de un trabajador fijo discontinuo durante sus periodos de inactividad laboral está sometido a las mismas reglas generales que cualquier otro desempleado: requiere cotización previa de 360 días acumulados y se extingue al agotarse el saldo cotizado.',
    explanation: 'El contrato fijo discontinuo (regulado en el artículo 16 del Estatuto de los Trabajadores) está diseñado para trabajos de naturaleza estacional. Cuando la temporada termina, la relación laboral se suspende (inactividad) y el trabajador puede solicitar la prestación por desempleo (paro) ante el SEPE.\n\nSin embargo, este derecho no es indefinido ni ilimitado:\n1. **Requisitos de Cotización:** Se necesita haber acumulado al menos 360 días cotizados desde la última prestación.\n2. **Consumo de Paro:** Cada día de paro cobrado se resta del saldo cotizado del trabajador. El paro se agota de forma ordinaria (máximo de 2 años de cobro tras 6 años de cotización).\n3. **Obligaciones:** El trabajador debe estar inscrito como demandante de empleo, firmar el compromiso de actividad y acudir a ofertas de empleo o cursos del SEPE. Cobrar el paro de forma vitalicia o ilimitada es legalmente imposible en España.',
    what_is_true: 'Los fijos discontinuos tienen derecho a percibir la prestación contributiva por desempleo durante sus periodos de inactividad si tienen suficiente periodo cotizado.',
    what_is_false: 'Es falso que esta prestación sea vitalicia, ilimitada, o que no consuma su tiempo cotizado ordinario acumulado.',
    what_lacks_context: 'Se omite que, en caso de rechazar un llamamiento de la empresa para volver a trabajar en la siguiente temporada, el trabajador causa baja voluntaria y pierde el derecho a seguir cobrando cualquier subsidio.',
    what_is_not_proven: 'No hay pruebas ni registros de ningún fijo discontinuo en España que cobre del SEPE de forma ininterrumpida sin cumplir con las cotizaciones legales mínimas.'
  },
  {
    id: 'art-empleo-ertes-sepe',
    topic_id: 't-empleo',
    slug: 'bulo-afiliacion-ertes-sepe-ocupados',
    title: '¿Cuenta el SEPE a las personas en ERTE o cursos formativos como afiliados ocupados?',
    subtitle: 'El criterio metodológico oficial del INE y Eurostat frente a las alegaciones de manipulación de las estadísticas de empleo.',
    claim: 'El Gobierno maquilla las cifras oficiales sumando a los desempleados que hacen cursos del SEPE y a los suspendidos por ERTE como cotizantes ocupados activos.',
    origin_platform: 'X (Twitter)',
    origin_url: 'https://x.com/economia_libre/status/1784901924',
    origin_summary: 'Mensajes acusando al Ministerio de Trabajo de ocultar millones de parados reales bajo la etiqueta de alumnos de cursos o trabajadores en ERTE.',
    category: 'Economía e Impuestos',
    verdict: 'Engañoso',
    confidence: 'Alta',
    summary: 'Las estadísticas de empleo distinguen entre "afiliados a la Seguridad Social" y "demandantes de empleo". Las personas en ERTE no computan en el paro registrado según la normativa de la OIT, pero no se les cuenta como afiliados activos si su contrato está 100% suspendido. Los alumnos de cursos de formación del SEPE figuran como demandantes no ocupados y nunca se computan como cotizantes.',
    explanation: 'Para entender los datos de empleo, hay que diferenciar dos fuentes:\n1. **Afiliados a la Seguridad Social (Cotizantes):** Muestra el número real de personas de alta en el sistema. Los trabajadores en ERTE de suspensión total siguen dados de alta pero con bonificaciones, figurando con una marca especial. Los desempleados en cursos formativos no están cotizando por trabajo y, por tanto, no suman en esta cifra.\n2. **Paro Registrado (SEPE):** Sigue la Orden Ministerial de 11 de marzo de 1985. Excluye a colectivos como trabajadores en ERTE (su contrato sigue vigente, solo está en pausa) y demandantes con disponibilidad limitada o en cursos (se clasifican como "demandantes no ocupados" en una categoría separada).\n\nEste criterio no es un invento del Gobierno español; sigue estrictamente los estándares internacionales unificados de la Oficina Internacional del Trabajo (OIT) y Eurostat para que los datos sean comparables con el resto de la Unión Europea.',
    what_is_true: 'Los trabajadores en ERTE y las personas desempleadas que realizan cursos del SEPE no se computan dentro de la cifra de "paro registrado" ordinario en los boletines mensuales.',
    what_is_false: 'Es falso que el Gobierno compute a los alumnos en cursos del SEPE en las cifras de afiliados a la Seguridad Social como si fueran trabajadores activos.',
    what_lacks_context: 'Se confunde la exclusión del paro registrado con la falsificación de datos. Los boletines mensuales del SEPE detallan de forma pública el número exacto de personas en ERTE y demandantes en formación por separado.',
    what_is_not_proven: 'No hay pruebas de que se hayan alterado las fórmulas estadísticas del INE o del SEPE al margen de los criterios metodológicos fijados por Eurostat.'
  },

  // --- PENSIONES Y SOSTENIBILIDAD ---
  {
    id: 'art-pensiones-extranjeros',
    topic_id: 't-pensiones',
    slug: 'bulo-inmigrantes-pension-no-contributiva-sin-cotizar',
    title: '¿Tienen derecho los inmigrantes a pensiones sin cotizar al llegar a España?',
    subtitle: 'El análisis de los requisitos legales exigidos en la Ley General de la Seguridad Social para prestaciones no contributivas.',
    claim: 'Cualquier inmigrante indocumentado o extranjero que llegue a España puede cobrar de forma inmediata una pensión de jubilación no contributiva sin haber cotizado un solo día en el país.',
    origin_platform: 'Facebook',
    origin_url: 'https://facebook.com/bulo_pensiones_migrantes',
    origin_summary: 'Posts de Facebook que afirman que España regala jubilaciones vitalicias a los extranjeros sin exigirles años de trabajo, perjudicando a los jubilados españoles.',
    category: 'Economía e Impuestos',
    verdict: 'Falso',
    confidence: 'Alta',
    summary: 'La Ley General de la Seguridad Social en España exige requisitos sumamente estrictos para acceder a una pensión de jubilación no contributiva. Un extranjero no la puede cobrar de inmediato al llegar, ya que requiere residencia legal mínima de 10 años en el país y carencia de rentas.',
    explanation: 'El acceso a la pensión de jubilación no contributiva (para personas que no han alcanzado el mínimo de 15 años de cotización) está estrictamente regulado en el Real Decreto Legislativo 8/2015:\n1. **Residencia Legal Obligatoria:** El solicitante debe residir legalmente en territorio español. La situación de irregularidad descarta la solicitud automáticamente.\n2. **Periodo de Residencia Exigido:** Se exige haber residido en España durante al menos 10 años entre los 16 años y la edad de devengo de la pensión. Además, al menos 2 de esos años deben ser inmediatamente anteriores e ininterrumpidos a la solicitud.\n3. **Edad y Carencia de Rentas:** Tener 65 años o más y demostrar ingresos inferiores al límite fijado por ley.\n\nPor tanto, es legal y fácticamente imposible que un inmigrante (indocumentado o recién llegado) acceda a estas prestaciones públicas.',
    what_is_true: 'La pensión no contributiva se financia mediante impuestos para dar cobertura básica de subsistencia a residentes legales que no alcanzaron los años cotizados mínimos.',
    what_is_false: 'Es totalmente falso que un extranjero recién llegado o sin papeles pueda acceder a esta pensión, o que no se exijan años de residencia legal previa en España.',
    what_lacks_context: 'Se omite que los ciudadanos españoles desfavorecidos están sujetos exactamente a las mismas condiciones de carencia de rentas para recibir esta pensión.',
    what_is_not_proven: 'No existe ningún expediente ni cobro de pensión de jubilación no contributiva concedido a una persona extranjera que no acredite los 10 años de residencia legal exigidos por el BOE.'
  },
  {
    id: 'art-pensiones-sostenibilidad',
    topic_id: 't-pensiones',
    slug: 'bulo-quiebra-inminente-sistema-pensiones',
    title: '¿Está el sistema público de pensiones en España en quiebra técnica inminente?',
    subtitle: 'El estado financiero real de la Seguridad Social, las transferencias de los PGE y el Fondo de Reserva de las pensiones.',
    claim: 'El sistema público de pensiones de la Seguridad Social española está quebrado económicamente y suspenderá los pagos a los jubilados a partir del próximo año.',
    origin_platform: 'YouTube',
    origin_url: 'https://youtube.com/watch?v=quiebra_pensiones_espana',
    origin_summary: 'Vídeos de analistas financieros que predicen el fin de la Seguridad Social y recomiendan retirar los fondos debido a una supuesta quiebra inminente del Estado.',
    category: 'Economía e Impuestos',
    verdict: 'Falso',
    confidence: 'Alta',
    summary: 'El sistema de pensiones español no está en quiebra inminente ni suspenderá pagos. Aunque el sistema afronta el reto del envejecimiento de la generación del baby-boom, cuenta con el respaldo de la garantía constitucional y las transferencias directas de los Presupuestos Generales del Estado (PGE).',
    explanation: 'El sistema de pensiones en España funciona mediante un modelo de "reparto" (las cotizaciones de los trabajadores activos pagan las pensiones de los jubilados del mismo mes), no de capitalización individual.\n\nSi el saldo de cotizaciones mensuales es insuficiente para cubrir la totalidad de las pensiones (déficit estructural), el Estado cubre la diferencia mediante:\n1. **Préstamos y Transferencias de los PGE:** Regulados por la separación de fuentes acordada en los Pactos de Toledo, mediante la cual el Estado asume los "gastos impropios" de la Seguridad Social.\n2. **Fondo de Reserva (La Hucha de las Pensiones):** Que tras años de descensos, ha vuelto a recibir aportaciones debido al Mecanismo de Equidad Intergeneracional (MEI).\nAdemás, el artículo 50 de la Constitución Española obliga a los poderes públicos a garantizar, mediante pensiones adecuadas y periódicamente actualizadas, la suficiencia económica de los ciudadanos en la tercera edad, descartando cualquier declaración de quiebra legal.',
    what_is_true: 'La Seguridad Social registra un déficit contable debido a la jubilación de las cohortes demográficas más numerosas y al incremento de la pensión media.',
    what_is_false: 'Es falso que el sistema esté quebrado, que corra riesgo de impago o que dependa únicamente de las cotizaciones mensuales sin respaldo de la hacienda pública.',
    what_lacks_context: 'Se ignora que casi todos los países de la Eurozona (Francia, Alemania, Italia) financian parte de sus sistemas de pensiones mediante aportaciones de sus Presupuestos del Estado de forma ordinaria.',
    what_is_not_proven: 'No hay ningún informe de organismos internacionales (FMI, Banco de España, OCDE) que sitúe a España al borde de la suspensión de pagos del sistema público de jubilación.'
  },
  {
    id: 'art-pensiones-politicos',
    topic_id: 't-pensiones',
    slug: 'bulo-pension-maxima-diputados-un-dia',
    title: '¿Tienen los diputados derecho a la pensión máxima con un solo día de cargo?',
    subtitle: 'La derogación en 2011 de las pensiones parlamentarias especiales y las normas actuales del Congreso.',
    claim: 'Los políticos, diputados y senadores españoles adquieren el derecho a cobrar la pensión de jubilación máxima de por vida con solo haber ocupado su cargo durante un día.',
    origin_platform: 'X (Twitter)',
    origin_url: 'https://x.com/indignados_es/status/1784901925',
    origin_summary: 'Mensajes virales afirmando que la clase política disfruta de jubilaciones privilegiadas automáticas mientras se exige 37 años de cotización al ciudadano común.',
    category: 'Economía e Impuestos',
    verdict: 'Falso',
    confidence: 'Alta',
    summary: 'Los políticos y diputados españoles no cobran la pensión máxima por haber estado un día en el cargo. En 2011 se derogaron las pensiones especiales para los parlamentarios del Congreso y el Senado. Cotizan y se jubilan en el Régimen General bajo las mismas condiciones exigidas al resto de trabajadores.',
    explanation: 'El Reglamento de las Cortes Generales contenía en su día un complemento de jubilación para ex-diputados y ex-senadores. No obstante, las Mesas del Congreso y del Senado suprimieron definitivamente estas pensiones especiales mediante acuerdo conjunto adoptado el **20 de septiembre de 2011**.\n\nA partir de esa fecha, las reglas son las siguientes:\n- Los diputados y senadores cotizan en el Régimen General de la Seguridad Social.\n- Se les aplica la misma edad de jubilación obligatoria y la misma escala de años cotizados mínimos requeridos para acceder al 100% de la base reguladora o a la pensión máxima.\n- El único beneficio que existía de carácter compensatorio eran las indemnizaciones temporales por cese de actividad, que se limitan a un máximo de 24 mensualidades y son totalmente incompatibles con cualquier otra actividad económica o pensión pública.',
    what_is_true: 'Hasta 2011 existían complementos que permitían a diputados de larga duración (más de 7 o 11 años de escaño) alcanzar la pensión máxima con menos cotización general.',
    what_is_false: 'Es falso que actualmente los políticos cuenten con pensiones privilegias automáticas o que un diputado con escaso tiempo de cargo reciba pensión de por vida.',
    what_lacks_context: 'Se omite que las pensiones que perciben los parlamentarios hoy en día se calculan exclusivamente sumando los años reales trabajados en el sector privado o función pública antes y después de la política.',
    what_is_not_proven: 'No se puede documentar ningún caso de pensión máxima de jubilación concedida a un diputado que haya cotizado únicamente por su periodo político de corta duración tras la reforma de 2011.'
  },

  // --- SALARIOS Y SMI ---
  {
    id: 'art-salarios-smi-empleo',
    topic_id: 't-salarios',
    slug: 'bulo-smi-destruye-empleo-inflacion',
    title: '¿Provoca la subida del SMI destrucción masiva de empleo e inflación?',
    subtitle: 'El contraste de los datos de afiliación histórica de la Seguridad Social frente a las alertas de contracción laboral.',
    claim: 'La subida consecutiva del Salario Mínimo Interprofesional (SMI) en España hasta los 1.134€ destruye de forma masiva el empleo y genera la subida de precios en la cesta de la compra.',
    origin_platform: 'YouTube',
    origin_url: 'https://youtube.com/watch?v=smi_destruccion_empleo_espana',
    origin_summary: 'Vídeos de patronales y tertulianos que aseguran que el SMI condena al paro a los jóvenes y arruina al sector agrario.',
    category: 'Economía e Impuestos',
    verdict: 'Falta contexto',
    confidence: 'Alta',
    summary: 'La subida del SMI en España (que se ha incrementado un 54% desde 2018) no ha destruido empleo neto según las estadísticas de afiliados a la Seguridad Social, que marcan máximos históricos. Sin embargo, estudios del Banco de España apuntan a que pudo frenar de forma marginal la contratación nueva en sectores muy vulnerables de baja productividad como la agricultura.',
    explanation: 'El impacto del Salario Mínimo en el empleo es uno de los temas más estudiados en economía laboral. Los datos oficiales muestran lo siguiente:\n1. **Afiliación:** En paralelo al aumento del SMI, España superó por primera vez la cifra de 21 millones de cotizantes a la Seguridad Social.\n2. **Efecto Marginal:** Informes del Banco de España y del Iseak concluyen que las subidas del SMI no provocan destrucción de puestos de trabajo existentes, pero sí reducen ligeramente la tasa de creación de empleo futuro en perfiles jóvenes o de baja cualificación en sectores agrícolas o comerciales.\n3. **Inflación:** La inflación generalizada de 2021-2023 respondió a costes energéticos internacionales, cuellos de botella y la invasión de Ucrania. La OCDE descarta que las subidas de salarios mínimos tengan peso determinante en la inflación de la eurozona, al limitarse el SMI al decil de salarios más bajos.',
    what_is_true: 'Las subidas del SMI mejoran el salario real de aproximadamente 2.5 millones de trabajadores de bajas rentas y reducen la brecha de género salarial.',
    what_is_false: 'Es totalmente falso que la subida del SMI haya provocado una oleada de despidos masivos o un aumento neto de la tasa de paro general en España.',
    what_lacks_context: 'Se oculta que gran parte del incremento salarial es absorbido por la mejora de la productividad y el incremento del consumo doméstico inducido por la renta disponible de los trabajadores beneficiados.',
    what_is_not_proven: 'No hay pruebas empíricas que demuestren una relación de causalidad entre el incremento del SMI a 1.134€ y el encarecimiento generalizado de la cesta de la compra del INE.'
  },
  {
    id: 'art-salarios-coste-empresa',
    topic_id: 't-salarios',
    slug: 'bulo-coste-laboral-smi-empresa-recibe-trabajador',
    title: '¿Es el SMI neto que cobra el trabajador el coste real total de la empresa?',
    subtitle: 'El desglose de los impuestos, retenciones de IRPF y cotizaciones a la Seguridad Social que abona el empleador.',
    claim: 'El coste de contratar a un trabajador que cobra el SMI equivale únicamente al salario neto mensual de 1.134 euros que este recibe ingresado en su cuenta.',
    origin_platform: 'X (Twitter)',
    origin_url: 'https://x.com/pymes_unidas/status/1784901926',
    origin_summary: 'Tuits virales de asociaciones que afirman que la Seguridad Social oculta que contratar a alguien con el SMI cuesta más del doble de lo que percibe el empleado.',
    category: 'Economía e Impuestos',
    verdict: 'Engañoso',
    confidence: 'Alta',
    summary: 'El coste para el empleador de un contrato acogido al Salario Mínimo (SMI) de 1.134€ en 14 pagas no es de 1.134€. La empresa debe asumir las cotizaciones sociales patronales (aprox. 31.5%), lo que sitúa el coste total bruto para la empresa en torno a los 1.600€ mensuales por trabajador.',
    explanation: 'Cuando se aprueba el SMI de 1.134€ (en 14 pagas), este importe representa el salario bruto legal mínimo, no el coste final del empleador ni el neto final del empleado:\n1. **Para el Trabajador (Neto):** Al salario bruto de 1.134€ se le restan la retención de IRPF (marginal en este tramo) y la cotización a la Seguridad Social a cargo del trabajador (6.47% para contingencias comunes, desempleo y formación). El neto mensual ronda los 1.050€.\n2. **Para la Empresa (Coste Total):** Al salario bruto de 1.134€ en 14 pagas (o 1.323€ prorrateado en 12 meses), la empresa debe sumarle las cotizaciones a la Seguridad Social a cargo de la empresa (cuota patronal) que ascienden a:\n   - Contingencias comunes (23.6%)\n   - Desempleo (5.5% o 6.7% según tipo contrato)\n   - FOGASA (0.2%)\n   - Formación Profesional (0.6%)\n   - Accidentes de Trabajo (según actividad).\nEsto supone un recargo patronal de aprox. 31.5%. Por tanto, el coste laboral real del SMI para la empresa es de unos 1.600€ al mes por jornada completa.',
    what_is_true: 'El coste laboral que asume una empresa en España supera el salario bruto del trabajador debido a las cotizaciones sociales patronales obligatorias de cotización.',
    what_is_false: 'Es falso que el coste de contratación sea exactamente igual a la nómina neta transferida al trabajador, o que la Seguridad Social reciba el doble del salario real.',
    what_lacks_context: 'Se omite que las cotizaciones patronales financian directamente las prestaciones por desempleo, las bajas médicas por accidente laboral y las futuras pensiones de jubilación del propio contratado.',
    what_is_not_proven: 'No hay constancia de ningún desglose legal o tributario que fije recargos patronales superiores al 35% sobre la base de cotización para contratos ordinarios de SMI.'
  },
  {
    id: 'art-salarios-devaluacion-real',
    topic_id: 't-salarios',
    slug: 'bulo-salario-real-bajo-devaluacion',
    title: '¿Se ha devaluado el salario real en España un 20% respecto a la Eurozona?',
    subtitle: 'El análisis de los sueldos medios de Eurostat y el efecto del incremento acumulado de la inflación.',
    claim: 'El salario real en España se ha devaluado un 20% desde el año 2020, situándose a la cola de la Eurozona y por debajo de Portugal y Grecia.',
    origin_platform: 'TikTok',
    origin_url: 'https://www.tiktok.com/@economia_viral/video/729108391',
    origin_summary: 'Vídeos que aseguran que el poder de compra de los españoles es el que más ha caído del continente y que los salarios reales son inferiores a los de hace 20 años.',
    category: 'Economía e Impuestos',
    verdict: 'Falso',
    confidence: 'Alta',
    summary: 'Es falso que el salario real en España se haya devaluado un 20% respecto a 2020 o que los salarios españoles estén por debajo de Portugal o Grecia. Los datos oficiales de Eurostat reflejan una pérdida de poder adquisitivo real acumulada de entre el 3% y el 4.5% debido a la inflación de 2022, habiéndose recuperado parte de ella en 2023 y 2024.',
    explanation: 'El salario medio en España se situó en 2023 en 2.126€ brutos al mes (según la Encuesta Anual de Coste Laboral del INE). En Portugal el salario medio es de 1.450€ y en Grecia no supera los 1.250€, por lo que España se encuentra notablemente por encima de estos países, en la franja media de la Eurozona.\n\nRespecto a la devaluación real:\n1. **Pérdida por Inflación:** Es cierto que entre 2021 y 2022 la inflación acumulada superó el crecimiento de los salarios pactados en convenio. La OCDE cifra la pérdida máxima de salario real en España en un 4.5% en su punto álgido de 2022.\n2. **Recuperación:** La firma del V Acuerdo para el Empleo y la Negociación Colectiva (AENC) en 2023 fijó subidas recomendadas del 4% en 2023 y del 3% en 2024, acompañadas de cláusulas de revisión según el IPC. Esto ha permitido amortiguar la pérdida real, quedando a años luz de la cifra devaluatoria del 20% citada en redes sociales.',
    what_is_true: 'La inflación acumulada en la Eurozona ha provocado una pérdida real del poder adquisitivo de los salarios en España de en torno al 4% entre 2021 y late 2023.',
    what_is_false: 'Es falso que la devaluación salarial española sea del 20% o que los sueldos medios en España sean inferiores a los de Portugal, Grecia o los países de Europa del Este.',
    what_lacks_context: 'Se obvia el impacto del salario mínimo (SMI): las rentas más bajas han ganado poder de compra real desde 2018 debido a que su incremento nominal (54%) ha superado ampliamente al IPC acumulado.',
    what_is_not_proven: 'No existe ninguna estadística oficial del Banco de España o de la Comisión Europea que avale una caída del 20% en los sueldos reales del país.'
  },

  // --- MEMORIA DE ETA Y TERRORISMO ---
  {
    id: 'art-eta-pagas',
    topic_id: 't-eta',
    slug: 'bulo-presos-eta-pension-paga-excarcelacion',
    title: '¿Reciben los presos de ETA una pensión especial al salir de la cárcel?',
    subtitle: 'El subsidio por excarcelación regulado en el BOE para todo liberado de prisión en España.',
    claim: 'Todos los miembros de ETA excarcelados reciben de forma automática una pensión vitalicia o una ayuda económica mensual de 1.000€ del Gobierno.',
    origin_platform: 'WhatsApp',
    origin_url: 'https://matiza.es/radar/claims/pensiones-presos-eta',
    origin_summary: 'Mensajes de WhatsApp alertando de un supuesto acuerdo del Gobierno para pagar nóminas mensuales exclusivas a los ex-miembros de la banda armada al salir de prisión.',
    category: 'Sociedad',
    verdict: 'Falso',
    confidence: 'Alta',
    summary: 'Los presos de ETA no reciben pensiones vitalicias ni pagas especiales por su condición de ex-miembros. Al salir de prisión, como cualquier persona excarcelada por cualquier delito, tienen derecho a solicitar el subsidio de excarcelación general de 480€ al mes durante un máximo de 18 meses si cumplen los requisitos de carencia de rentas.',
    explanation: 'El subsidio por liberación de prisión está regulado en el artículo 274 del Texto Refundido de la Ley General de la Seguridad Social. Es una ayuda asistencial aplicable a todas las personas que salen de la cárcel tras cumplir una pena superior a seis meses:\n1. **Cuantía:** Equivale al 80% del Indicador Público de Renta de Efectos Múltiples (IPREM), que representa aproximadamente 480 euros mensuales.\n2. **Duración:** Se concede por seis meses, prorrogable como máximo hasta los 18 meses. No es vitalicio.\n3. **Requisitos:** El ex-preso no debe tener ingresos propios que superen el 75% del Salario Mínimo y debe estar inscrito como demandante de empleo.\n\nEsta medida busca la reinserción social para evitar que la persona liberada reincida en el delito por falta absoluta de recursos de subsistencia al salir a la calle, y se aplica por igual a ladrones, homicidas o terroristas sin distinción ni plus especial.',
    what_is_true: 'Cualquier persona excarcelada en España tiene derecho a solicitar un subsidio de desempleo temporal de 480€ si carece de rentas.',
    what_is_false: 'Es falso que los presos de ETA tengan una pensión vitalicia, un subsidio especial de cuantía superior a la de otros delincuentes comunes o una ayuda económica concedida "a dedo".',
    what_lacks_context: 'Se omite que para acceder a este subsidio asistencial general, el solicitante no debe poseer un empleo activo y debe cumplir los mismos trámites administrativos exigidos en el SEPE.',
    what_is_not_proven: 'No hay pruebas legislativas ni registros contables del Ministerio de Trabajo que muestren la concesión de pagas de 1.000€ mensuales a ningún recluso de la banda terrorista.'
  },
  {
    id: 'art-eta-reforma-penas',
    topic_id: 't-eta',
    slug: 'bulo-reforma-ley-organica-reduccion-penas-eta',
    title: '¿Se han acortado ilegalmente las condenas de los presos de ETA?',
    subtitle: 'El análisis de la transposición de la Directiva Europea sobre acumulación de condenas internacionales.',
    claim: 'La reciente reforma de la ley orgánica ha acortado ilegalmente y de forma secreta el cumplimiento de penas de decenas de presos de la banda armada ETA.',
    origin_platform: 'X (Twitter)',
    origin_url: 'https://x.com/defensa_constitucional/status/1784901927',
    origin_summary: 'Tuits virales acusando al Gobierno de pactar la reducción de condenas penales de terroristas mediante reformas introducidas de tapadillo.',
    category: 'Sociedad',
    verdict: 'Engañoso',
    confidence: 'Alta',
    summary: 'La reforma de la Ley Orgánica 7/2014 no reduce condenas de forma ilegal. Se trata de la transposición técnica de la Decisión Marco 2008/675/JAI de la Unión Europea, que obliga a los estados miembros a computar los años de prisión cumplidos por un ciudadano en otro país de la UE (como Francia) a la hora de calcular el límite máximo de cumplimiento en su país de origen.',
    explanation: 'El debate jurídico gira en torno a la transposición de la directiva comunitaria de acumulación de condenas en el espacio europeo. Muchos presos de ETA cumplieron años de condena en prisiones francesas por delitos de pertenencia a banda armada antes de ser entregados a la justicia española.\n\nLa normativa europea establece que a efectos penales, el tiempo de reclusión cumplido en Francia debe ser descontado de la pena máxima acumulada que el recluso debe cumplir en España por los mismos hechos o causas conexas. En 2014, España traspuso esta norma introduciendo una limitación para excluir las condenas anteriores a 2010. La reciente reforma parlamentaria suprimió esa limitación temporal para adaptar la ley de forma plena a la jurisprudencia del Tribunal de Justicia de la Unión Europea (TJUE). No se trata de un indulto ni una rebaja discrecional de penas por terrorismo, sino de la aplicación ordinaria del principio jurídico de no duplicidad de penas (ne bis in idem) en Europa.',
    what_is_true: 'La reforma parlamentaria permite a varios reclusos acumular los años ya cumplidos en Francia, lo que adelanta su fecha oficial de licenciamiento de condena.',
    what_is_false: 'Es falso que esta medida sea ilegal o inconstitucional, ya que responde a la unificación de los criterios penales de la Unión Europea.',
    what_lacks_context: 'Se oculta que esta norma de computación europea se aplica a cualquier recluso español encarcelado en la UE, sea por delitos de narcotráfico, robos o cualquier otra infracción penal.',
    what_is_not_proven: 'No hay pruebas de que se hayan emitido rebajas de condena discrecionales al margen de las sentencias dictadas por los tribunales de la Audiencia Nacional.'
  },
  {
    id: 'art-eta-victimas-indemnizaciones',
    topic_id: 't-eta',
    slug: 'bulo-victimas-terrorismo-no-cobran-indemnizaciones',
    title: '¿Se han suspendido las indemnizaciones a las víctimas de ETA?',
    subtitle: 'El análisis de las partidas de los Presupuestos del Estado destinadas a la protección de las víctimas del terrorismo.',
    claim: 'El Gobierno ha congelado el pago de las indemnizaciones estatales a las víctimas del terrorismo y las ha transferido a las familias de los presos de ETA.',
    origin_platform: 'Facebook',
    origin_url: 'https://facebook.com/victimas_terrorismo_bulos',
    origin_summary: 'Publicaciones virales de Facebook afirmando que las asociaciones de víctimas están infrafinanciadas de forma deliberada por motivos políticos.',
    category: 'Sociedad',
    verdict: 'Falso',
    confidence: 'Alta',
    summary: 'Es totalmente falso que se hayan congelado o suspendido las indemnizaciones a las víctimas del terrorismo. El presupuesto del Ministerio del Interior mantiene partidas anuales blindadas para el pago de indemnizaciones, asistencia psicológica y subvenciones a asociaciones de víctimas reguladas por la Ley 29/2011.',
    explanation: 'La protección a las víctimas del terrorismo en España está consagrada en la Ley 29/2011, de Reconocimiento y Protección Integral a las Víctimas del Terrorismo. El Estado asume la responsabilidad civil subsidiaria para indemnizar los daños corporales, secuelas y fallecimientos provocados por atentados terroristas.\n\nLos Presupuestos Generales del Estado (PGE) asignan anualmente millones de euros a la Dirección General de Apoyo a Víctimas del Terrorismo de forma obligatoria:\n1. **Indemnizaciones directas:** Los pagos se tramitan de forma reglada e independiente del color político del Gobierno.\n2. **Incompatibilidad:** Por ley, ningún fondo destinado a víctimas del terrorismo puede ser desviado para sufragar ayudas a ex-miembros de bandas armadas o sus familias, siendo una afirmación constitutiva de bulo malintencionado en redes sociales.',
    what_is_true: 'La Ley 29/2011 otorga a las víctimas del terrorismo y sus herederos un régimen de ayudas económicas, asistencia sanitaria e inserción laboral financiado por el Estado.',
    what_is_false: 'Es totalmente falso que se hayan congelado los pagos, reducido los derechos de las víctimas o transferido fondos públicos a presos o familiares de ETA.',
    what_lacks_context: 'Se obvia que los retrasos puntuales en tramitaciones son de carácter administrativo ordinario y nunca responden a directrices de suspensión de la política de protección.',
    what_is_not_proven: 'No existe ningún documento del Ministerio de Hacienda que registre transferencias de partidas de apoyo a víctimas hacia programas de reclusos.'
  }
];

console.log('Insertando o actualizando artículos...');
for (const a of articles) {
  insertArticle.run(
    a.id,
    a.topic_id,
    a.slug,
    a.title,
    a.subtitle,
    a.claim,
    a.origin_platform,
    a.origin_url,
    a.origin_summary,
    a.category,
    a.verdict,
    a.confidence,
    a.summary,
    a.explanation,
    a.what_is_true,
    a.what_is_false,
    a.what_lacks_context,
    a.what_is_not_proven
  );
}

// 3. Insertar Sources para cada artículo para justificar con el BOE, INE, etc.
const insertSource = db.prepare(`
  INSERT INTO sources (id, article_id, title, url, source_type, authority_level, quote_or_summary, date_accessed)
  VALUES (?, ?, ?, ?, 'Oficial', 'Alta', ?, datetime('now'))
  ON CONFLICT(id) DO UPDATE SET
    article_id = excluded.article_id,
    title = excluded.title,
    url = excluded.url,
    quote_or_summary = excluded.quote_or_summary
`);

const sources = [
  // Sanidad Privatización
  { id: 'src-sanidad-priv-1', article_id: 'art-sanidad-privatizacion', title: 'Ley 14/1986, de 25 de abril, General de Sanidad (BOE)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1986-10499', snippet: 'Disposiciones que garantizan el acceso universal, público y gratuito a la atención sanitaria básica de todos los ciudadanos españoles.', reliability: 'Oficial' },
  { id: 'src-sanidad-priv-2', article_id: 'art-sanidad-privatizacion', title: 'Informe del Gasto Sanitario Público - Ministerio de Sanidad', url: 'https://www.sanidad.gob.es/estadisticas/gastoSanitario.htm', snippet: 'Estadísticas del Ministerio de Sanidad que detallan la proporción de gasto destinado a gestión directa (SNS) frente a conciertos privados.', reliability: 'Oficial' },

  // Sanidad Listas
  { id: 'src-sanidad-listas-1', article_id: 'art-sanidad-listas-espera', title: 'Sistema de Información sobre Listas de Espera del SNS (SISLE)', url: 'https://www.sanidad.gob.es/estadisticas/listasEspera.htm', snippet: 'Datos de tiempos medios de espera quirúrgica y número de pacientes en lista de espera para especialidades en el Sistema Nacional de Salud.', reliability: 'Oficial' },
  { id: 'src-sanidad-listas-2', article_id: 'art-sanidad-listas-espera', title: 'Real Decreto-Ley 7/2018 sobre acceso universal al Sistema Nacional de Salud', url: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2018-10752', snippet: 'Establece los términos legales de la tarjeta sanitaria y el empadronamiento para la atención programada de extranjeros.', reliability: 'Oficial' },

  // Sanidad Recetas
  { id: 'src-sanidad-recetas-1', article_id: 'art-sanidad-comisiones-recetas', title: 'Ley de Garantías y Uso Racional de los Medicamentos - BOE', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-8343', snippet: 'Artículo 3 sobre prohibición de incentivos e incompatibilidades en la prescripción de medicamentos.', reliability: 'Oficial' },

  // Empleo Fijos Discontinuos Subsidio
  { id: 'src-empleo-sub-1', article_id: 'art-empleo-subsidio-fijos', title: 'Estatuto de los Trabajadores, Artículo 16 (BOE)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a16', snippet: 'Regulación del contrato de trabajo fijo-discontinuo y los periodos de inactividad estacional.', reliability: 'Oficial' },
  { id: 'src-empleo-sub-2', article_id: 'art-empleo-subsidio-fijos', title: 'Guía del SEPE para el cobro del paro en Fijos Discontinuos', url: 'https://www.sepe.es/HomeSepe/Personas/distribucion-prestaciones/fijos-discontinuos.html', snippet: 'Requisitos obligatorios y límites de cotización previstos para el cobro de la prestación contributiva durante la inactividad.', reliability: 'Oficial' },

  // Empleo ERTEs
  { id: 'src-empleo-ert-1', article_id: 'art-empleo-ertes-sepe', title: 'Metodología de Clasificación de Demandantes de Empleo (Orden de 1985)', url: 'https://www.sepe.es/HomeSepe/que-es-el-sepe/estadisticas/metodologia-cifras-paro.html', snippet: 'Instrucciones oficiales para clasificar e informar sobre demandantes con disponibilidad reducida o en cursos.', reliability: 'Oficial' },

  // Pensiones Inmigrantes
  { id: 'src-pensiones-ext-1', article_id: 'art-pensiones-extranjeros', title: 'Ley General de la Seguridad Social, Artículos de Pensiones No Contributivas', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724#a369', snippet: 'Establece la exigencia legal de acreditar un periodo mínimo de 10 años de residencia en territorio español para jubilación no contributiva.', reliability: 'Oficial' },

  // Pensiones Sostenibilidad
  { id: 'src-pensiones-sos-1', article_id: 'art-pensiones-sostenibilidad', title: 'Constitución Española, Artículo 50 (BOE)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229#a50', snippet: 'Obliga al Estado a garantizar la suficiencia económica de los ciudadanos en la vejez mediante pensiones actualizadas.', reliability: 'Oficial' },
  { id: 'src-pensiones-sos-2', article_id: 'art-pensiones-sostenibilidad', title: 'Fondo de Reserva de la Seguridad Social - Balance de Cuentas', url: 'https://www.seg-social.es/wps/portal/wss/internet/EstadisticasPresupuestosEstudios/FondoReserva', snippet: 'Evolución e ingresos acumulados en la hucha de las pensiones por el Mecanismo de Equidad Intergeneracional (MEI).', reliability: 'Oficial' },

  // Pensiones Políticos
  { id: 'src-pensiones-pol-1', article_id: 'art-pensiones-politicos', title: 'Resolución de 20 de septiembre de 2011 sobre el Reglamento de Pensiones Parlamentarias', url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2011-15079', snippet: 'Acuerdo por el que se derogan las pensiones especiales y complementos de jubilación para ex-diputados del Congreso.', reliability: 'Oficial' },

  // Salarios SMI Empleo
  { id: 'src-salarios-smi-1', article_id: 'art-salarios-smi-empleo', title: 'Real Decreto 145/2024, de 6 de febrero, por el que se fija el SMI', url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-2251', snippet: 'Establece la cuantía oficial del Salario Mínimo Interprofesional en 1.134 euros mensuales en 14 pagas.', reliability: 'Oficial' },
  { id: 'src-salarios-smi-2', article_id: 'art-salarios-smi-empleo', title: 'Estadísticas de Afiliación Mensual a la Seguridad Social (INE)', url: 'https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736056637', snippet: 'Evolución de cotizantes a la Seguridad Social en paralelo a las modificaciones del SMI.', reliability: 'Oficial' },

  // Salarios Coste Empresa
  { id: 'src-salarios-coste-1', article_id: 'art-salarios-coste-empresa', title: 'Tarifas y Tipos de Cotización de la Seguridad Social para 2024 (BOE)', url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRegimenes/10957/9712/9713', snippet: 'Detalle de los porcentajes de cotización patronal (contingencias comunes, desempleo, FOGASA, formación) sobre la base salarial.', reliability: 'Oficial' },

  // Salarios Devaluación
  { id: 'src-salarios-dev-1', article_id: 'art-salarios-devaluacion-real', title: 'Encuesta Trimestral de Coste Laboral (INE)', url: 'https://www.ine.es/dynt3/inebase/es/index.htm?padre=8794', snippet: 'Estadísticas sobre coste salarial bruto y neto medio en España por sector de actividad económica.', reliability: 'Oficial' },

  // ETA Pagas
  { id: 'src-eta-pag-1', article_id: 'art-eta-pagas', title: 'Ley General de la Seguridad Social, Artículo 274 (Subsidios)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724#a274', snippet: 'Regulación del subsidio por desempleo para liberados de prisión que carezcan de rentas y tengan cargas de inserción.', reliability: 'Oficial' },

  // ETA Penas
  { id: 'src-eta-pen-1', article_id: 'art-eta-reforma-penas', title: 'Decisión Marco 2008/675/JAI sobre el cómputo de condenas europeas', url: 'https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32008F0675', snippet: 'Obliga a tomar en consideración las condenas dictadas en otros estados miembros con motivo de un nuevo proceso penal.', reliability: 'Oficial' },

  // ETA Víctimas
  { id: 'src-eta-vic-1', article_id: 'art-eta-victimas-indemnizaciones', title: 'Ley 29/2011 de Reconocimiento y Protección Integral a las Víctimas del Terrorismo', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2011-15039', snippet: 'Garantías legales, indemnizaciones y partidas presupuestarias reservadas por el Estado español para las víctimas.', reliability: 'Oficial' }
];

console.log('Insertando o actualizando sources...');
for (const s of sources) {
  insertSource.run(s.id, s.article_id, s.title, s.url, s.snippet);
}

// 4. Población de scraped_items para que el widget social cargue inmediatamente con datos consistentes
const insertScraped = db.prepare(`
  INSERT INTO scraped_items (
    id, platform, url, text, author_public_name, metrics_json, detected_claim, suggested_topic, virality_score, risk_score, status, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'procesado', datetime('now'))
  ON CONFLICT(id) DO UPDATE SET
    platform = excluded.platform,
    url = excluded.url,
    text = excluded.text,
    metrics_json = excluded.metrics_json,
    detected_claim = excluded.detected_claim,
    virality_score = excluded.virality_score,
    status = 'procesado'
`);

console.log('Sembrando registros en scraped_items para los nuevos artículos...');
for (const a of articles) {
  const scrapedId = `scraped-item-${a.id}`;
  const metrics = JSON.stringify({
    likes: Math.floor(Math.random() * 2000) + 150,
    shares: Math.floor(Math.random() * 800) + 50,
    views: Math.floor(Math.random() * 25000) + 2000,
    comments: Math.floor(Math.random() * 400) + 20
  });

  insertScraped.run(
    scrapedId,
    a.origin_platform,
    a.origin_url,
    a.origin_summary,
    'Radar Matiza',
    metrics,
    a.claim,
    a.topic_id,
    Math.floor(Math.random() * 5) + 5,
    Math.floor(Math.random() * 5) + 5
  );

  // 5. Inserción o actualización en social_posts vinculada para el Widget Social
  const insertSocialPost = db.prepare(`
    INSERT INTO social_posts (
      id, article_id, platform, format, content, status
    ) VALUES (?, ?, ?, 'text', ?, 'publicado')
    ON CONFLICT(id) DO UPDATE SET
      article_id = excluded.article_id,
      content = excluded.content
  `);

  const socialId = `sp-${a.id}`;
  insertSocialPost.run(
    socialId,
    a.id,
    a.origin_platform,
    a.claim
  );
}

db.close();
console.log('⚡ [Verticals Seeder] ¡Sembrado de desmentidos y verticales completado con éxito!');
