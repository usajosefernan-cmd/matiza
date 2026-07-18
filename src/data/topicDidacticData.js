export const topicDidacticData = {
  'vivienda-y-okupacion': {
    what_is_happening: 'El debate social sobre la okupación de viviendas, los precios de los alquileres y la nueva Ley de Vivienda (Ley 12/2023) polariza la opinión pública. Mientras proliferan discursos de alarma sobre allanamientos constantes, los datos del INE y el marco legal diferencian claramente el asalto a moradas habitadas de la usurpación de pisos vacíos de fondos o bancos.',
    what_we_know: 'Sabemos que la Constitución protege la inviolabilidad del domicilio (Art. 18.2 CE) de forma absoluta. Las segundas residencias gozan de la misma protección. La ocupación de una vivienda habitada es allanamiento de morada (Art. 202 CP) y la policía desaloja inmediatamente de oficio. La usurpación (Art. 245 CP) se aplica a inmuebles abandonados sin uso de vivienda y requiere orden judicial.',
    what_we_do_not_know: 'No está cuantificado con exactitud el impacto a largo plazo de la declaración de zonas tensionadas para topar precios del alquiler en el stock de viviendas ofertadas, ya que las competencias son autonómicas y muchas Comunidades Autónomas rechazan aplicar los índices oficiales.',
    key_facts: [
      'El 98.5% de los desahucios o desalojos policiales corresponden a impagos de rentas de alquiler o hipotecas, no a okupaciones ilegales por desconocidos.',
      'La Instrucción 6/2020 de Interior faculta el desalojo policial inmediato en allanamientos sin límite de tiempo (el mito de las 48 horas no existe en la ley).',
      'Las segundas residencias (pisos de vacaciones) están protegidas como morada del titular.'
    ],
    main_sources: [
      { name: 'Índice del Alquiler - Ministerio de Vivienda y Agenda Urbana', url: 'https://serpavi.mivau.gob.es/' },
      { name: 'Estadísticas del CGPJ sobre Lanzamientos y Ejecuciones Hipotecarias', url: 'https://www.poderjudicial.es/' },
      { name: 'Instrucción 6/2020 de la Secretaría de Estado de Seguridad', url: 'https://www.boe.es/' }
    ],
    chronology: [
      { date: 'Mayo 2023', event: 'Entrada en vigor de la Ley de Vivienda estatal (Ley 12/2023).' },
      { date: 'Septiembre 2020', event: 'Fiscalía General emite la Instrucción 1/2020 para agilizar desalojos cautelares en usurpaciones.' }
    ],
    frequent_confusions: [
      { confusion: 'Si te vas a comprar el pan, pueden okupar tu piso y no podrás echarles.', reality: 'Falso. Eso constituye allanamiento de morada. El desalojo policial es inmediato y se detiene a los usurpadores de forma directa.' },
      { confusion: 'No se puede echar a los okupas de una segunda residencia vacacional sin orden judicial.', reality: 'Falso. La Fiscalía General del Estado y el Tribunal Supremo equiparan la segunda residencia a la morada habitual, amparada por la inviolabilidad del domicilio. El desalojo es inmediato.' },
      { confusion: 'La Ley de Vivienda ampara y legaliza a las mafias de la okupación.', reality: 'Falso. La ley introduce trámites adicionales y plazos de conciliación únicamente para procesos de desahucio civil por impago de alquiler a inquilinos vulnerables, no ampara delitos de ocupación ilegal ni allanamientos.' }
    ],
    quick_replies: 'La okupación de una morada en España (sea primera o segunda residencia) constituye allanamiento de morada y la policía actúa de forma directa e inmediata. Los procesos lentos corresponden únicamente a demandas civiles por impago de alquiler (inquiokupación) o usurpación de inmuebles vacíos de bancos.',
    pending_questions: 'Regulación del alquiler turístico y de temporada que elude los topes de precios de la Ley de Vivienda.'
  },
  'inmigracion-y-convivencia': {
    what_is_happening: 'La llegada de inmigrantes a través de las rutas atlántica y mediterránea, y la saturación de los recursos de acogida en Canarias y Ceuta, genera un intenso debate. Los discursos de odio difunden bulos sobre supuestas pagas directas de 4.200€ al mes a menores extranjeros no acompañados (MENAS) y sobre su supuesta relación causal con la delincuencia general.',
    what_we_know: 'Los menores extranjeros no acompañados están tutelados legalmente por las Comunidades Autónomas (Art. 172 Código Civil) bajo el principio del interés superior del menor. No reciben una ayuda directa de 4.200€; esa cantidad corresponde al coste de mantenimiento del centro de acogida por plaza (cuidado, personal, educación). Para acceder al IMV o ayudas contributivas se exige residencia legal (más de 1 año).',
    what_we_do_not_know: 'El número real de menores que logran una integración laboral estable una vez cumplen la mayoría de edad debido a la falta de un registro nacional unificado de seguimiento posterior.',
    key_facts: [
      'Los afiliados extranjeros representan el 13.4% del total de cotizantes a la Seguridad Social en España, sosteniendo el ratio de pensiones.',
      'Para recibir ayudas no contributivas del SEPE o el IMV se requiere residencia legal en España, los sin papeles no pueden acceder a ellas.',
      'El reparto de menores entre CCAA sigue atascado por falta de consenso para modificar el Art. 35 de la Ley de Extranjería.'
    ],
    main_sources: [
      { name: 'Portal de Inclusión y Migraciones - Estadísticas de la Secretaría de Estado', url: 'https://inclusion.seg-social.es/' },
      { name: 'Memorias de la Fiscalía General del Estado (Sección Menores)', url: 'https://www.fiscal.es/' },
      { name: 'Ley de Extranjería (LO 4/2000) y Reglamento del BOE', url: 'https://www.boe.es/' }
    ],
    chronology: [
      { date: 'Julio 2024', event: 'Rechazo parlamentario a la toma en consideración de la reforma urgente del Art. 35 de la Ley de Extranjería.' },
      { date: 'Año 2024', event: 'Las afiliaciones de extranjeros baten récord histórico superando los 2.8 millones de cotizantes activos.' }
    ],
    frequent_confusions: [
      { confusion: 'Los inmigrantes irregulares reciben una paga directa de 600 euros al mes del gobierno por llegar.', reality: 'Falso. Ningún inmigrante irregular tiene acceso a sueldos, subsidios por desempleo o al Ingreso Mínimo Vital (IMV), el cual exige residencia legal previa de al menos un año ininterrumpido.' },
      { confusion: 'El coste de mantener un menor tutelado (MENA) se les ingresa a ellos en efectivo en una tarjeta.', reality: 'Falso. Los 4.200€ mensuales estimados de coste por menor corresponden al gasto operativo de la plaza (mantenimiento del inmueble, sueldos de educadores, psicólogos, seguridad y alimentación). El menor solo percibe de dinero de bolsillo entre 10 y 30 euros semanales según la CCAA.' },
      { confusion: 'La delincuencia en España ha aumentado exponencialmente debido en exclusiva a las oleadas migratorias.', reality: 'Falso. Los balances del Ministerio del Interior muestran una tasa de criminalidad estable. Las estadísticas de condenados del INE ratifican que más del 70% de los delitos del país son cometidos por ciudadanos de nacionalidad española.' }
    ],
    quick_replies: 'Ningún inmigrante recibe subsidios del Estado por el simple hecho de entrar a España. Las ayudas sociales están vinculadas al nivel de renta y vulnerabilidad de las familias bajo residencia legal estricta.',
    pending_questions: 'Estabilidad presupuestaria para la acogida temporal a largo plazo por las CCAA receptoras.'
  },
  'economia-espanola': {
    what_is_happening: 'España lidera el crecimiento económico de la eurozona con alzas del PIB por encima del 2.5%, pero el debate gira en torno al incremento del coste de la vida (inflación acumulada) y al volumen de la deuda pública (107% del PIB). Los discursos políticos confrontan el "éxito macroeconómico" con la "realidad del bolsillo ciudadano".',
    what_we_know: 'El PIB español se calcula según el Sistema Europeo de Cuentas (SEC-2010) por el INE. La deuda del Estado se reporta al Banco de España siguiendo los criterios del Protocolo de Déficit Excesivo del Tratado de Maastricht. La inflación interanual se ha moderado al entorno del 2% tras alcanzar picos del 10.8% en 2022.',
    what_we_do_not_know: 'La evolución de la tasa de ahorro de las familias y la capacidad de amortización de hipotecas en caso de que los tipos de interés se mantengan altos por periodos prolongados.',
    key_facts: [
      'El sector servicios y el turismo aportan más del 67% del valor añadido bruto al PIB nacional.',
      'La deuda de las administraciones públicas se mantiene en niveles altos (107% del PIB) pero con una senda decreciente en ratio por el crecimiento del PIB.',
      'Las reglas fiscales de la UE limitan el déficit al 3% y obligan a planes de ajuste fiscal estructural.'
    ],
    main_sources: [
      { name: 'INE - Índices de Precios de Consumo (IPC) y Crecimiento del PIB', url: 'https://www.ine.es/' },
      { name: 'Banco de España - Estadísticas de Deuda de las Administraciones Públicas (PDE)', url: 'https://www.bde.es/' },
      { name: 'Comisión Europea - Marco de Vigilancia Fiscal y Reglas de Maastricht', url: 'https://ec.europa.eu/' }
    ],
    chronology: [
      { date: 'Junio 2024', event: 'La Comisión Europea reactiva formalmente las reglas de disciplina fiscal del Tratado de Maastricht.' },
      { date: 'Julio 2022', event: 'España registra su inflación máxima en 37 años con un 10.8% interanual.' }
    ],
    frequent_confusions: [
      { confusion: 'España está en quiebra técnica porque la deuda supera el 100% de la economía.', reality: 'Falso. Muchos países avanzados operan por encima del 100% de deuda. La solvencia la determina la capacidad de refinanciación en los mercados y el crecimiento del PIB.' },
      { confusion: 'La economía española va mal porque el consumo de los hogares ha caído a cero.', reality: 'Falso. El consumo privado mantiene un crecimiento positivo sostenido apuntalado por el récord de empleo (21.3 millones de afiliados), aunque la inflación acumulada reduce el margen de ahorro.' },
      { confusion: 'El PIB de España crece artificialmente por el aumento masivo del empleo público.', reality: 'Falso. Más del 85% del crecimiento del empleo neto de los últimos dos años corresponde al sector privado, liderado por la informática, los servicios técnicos y la hostelería.' }
    ],
    quick_replies: 'La macroeconomía española crece a buen ritmo liderando la eurozona, impulsada por el sector servicios, las exportaciones y la creación de empleo. Sin embargo, las rentas bajas sufren la pérdida de poder adquisitivo acumulado por la crisis de precios.',
    pending_questions: 'Reducción estructural de la deuda pública una vez se aplique la senda de consolidación fiscal europea.'
  },
  'franquismo-y-memoria-historica': {
    what_is_happening: 'La aplicación de la Ley de Memoria Democrática (Ley 20/2022) suscita una fuerte controversia en comunidades autónomas gobernadas por coaliciones que impulsan "Leyes de Concordia". El debate gira sobre el reconocimiento histórico, el coste de las exhumaciones y la retirada de simbología dictatorial.',
    what_we_know: 'La Ley 20/2022 asume como responsabilidad del Estado la búsqueda e identificación de las víctimas de la Guerra Civil y la Dictadura (estimadas en 114.000 desaparecidos en fosas comunes). El TC mantiene paralizada la Ley de Concordia de Aragón tras recurso del Gobierno central por presunta invasión de competencias exclusivas sobre derechos humanos fundamentales.',
    what_we_do_not_know: 'El censo total definitivo de fosas comunes pendientes de excavación, dado que muchas se ubican en terrenos privados de difícil acceso legal.',
    key_facts: [
      'España es el segundo país con más desaparecidos sin identificar del mundo, solo superado por Camboya.',
      'El Instituto Nacional de Previsión (origen de la Seguridad Social) se creó en 1908 por Maura, no por el Franquismo.',
      'Las sentencias de los tribunales de represión franquistas (Tribunal de Orden Público) están declaradas formalmente nulas e ilegales.'
    ],
    main_sources: [
      { name: 'Mapa de Fosas de España - Buscador y Localización Oficial de Víctimas', url: 'https://mapadefosas.mpr.gob.es/' },
      { name: 'Secretaría de Estado de Memoria Democrática - Estadísticas y ADN', url: 'https://www.mpr.gob.es/' },
      { name: 'ONU - Recomendaciones del Comité contra la Desaparición Forzada', url: 'https://www.ohchr.org/' }
    ],
    chronology: [
      { date: 'Octubre 2022', event: 'Entrada en vigor de la Ley de Memoria Democrática.' },
      { date: 'Mayo 2024', event: 'El Tribunal Constitucional suspende cautelarmente la ley de Aragón.' }
    ],
    frequent_confusions: [
      { confusion: 'Franco creó el sistema de pensiones y las pagas extraordinarias en España.', reality: 'Falso. Las bases se remontan al Retiro Obrero de 1919 (Alfonso XIII). La dictadura unificó las mutuas en un sistema de reparto único en 1963.' },
      { confusion: 'La Ley de Memoria Democrática busca reabrir heridas y dividir a los españoles.', reality: 'Falso. El texto de la ley y las recomendaciones de la ONU (Consejo de Derechos Humanos) buscan el derecho a la verdad, la reparación de las víctimas y la localización de desaparecidos sepultados de forma ilegal.' },
      { confusion: 'Las exhumaciones de las fosas comunes cuestan miles de millones de dinero público injustificado.', reality: 'Falso. El presupuesto de Memoria Democrática se sitúa en torno a los 14 millones de euros anuales, destinados principalmente a las pruebas genéticas de identificación de restos y a subvenciones de arqueología forense.' }
    ],
    quick_replies: 'La búsqueda de desaparecidos en fosas comunes es una obligación humanitaria internacional. Atribuir la Seguridad Social a la dictadura es falso: el Retiro Obrero fue decretado obligatorio en 1919.',
    pending_questions: 'Exhumaciones y dignificación de las criptas del Valle de Cuelgamuros por dificultades geológicas.'
  },
  'cataluna-y-convivencia-territorial': {
    what_is_happening: 'El debate territorial catalán ha entrado en una nueva fase con la aprobación de la Ley de Amnistía (LO 1/2024) y la propuesta de una financiación singular para Cataluña.',
    what_we_know: 'La Ley de Amnistía extingue la responsabilidad penal y contable por los actos vinculados al proceso independentista entre 2011 y 2023. La financiación autonómica ordinaria se rige por la LOFCA, mientras que el País Vasco y Navarra operan bajo el sistema de Concierto Foral amparado constitucionalmente.',
    what_we_do_not_know: 'La aplicación concreta de la amnistía al delito de malversación, que sigue sujeta a la interpretación judicial y prejudiciales ante la justicia de la Unión Europea.',
    key_facts: [
      'La amnistía extingue la responsabilidad penal de forma retroactiva, no anula el orden constitucional ni la soberanía del Estado.',
      'El modelo de financiación autonómica común está caducado y pendiente de renovación desde el año 2014.',
      'El Concierto Económico Vasco recauda el 100% de los tributos y aporta al Estado una cuantía anual (el Cupo) por servicios no transferidos.'
    ],
    main_sources: [
      { name: 'Boletín Oficial del Estado - Ley Orgánica 1/2024 de Amnistía', url: 'https://www.boe.es/' },
      { name: 'Ministerio de Hacienda - Balances y Liquidación de Financiación Autonómica', url: 'https://www.hacienda.gob.es/' },
      { name: 'Constitución Española de 1978 - Artículos 137, 138 y 139 sobre la organización territorial', url: 'https://www.boe.es/' }
    ],
    chronology: [
      { date: 'Junio 2024', event: 'Publicación en el BOE y entrada en vigor de la Ley de Amnistía.' },
      { date: 'Agosto 2024', event: 'Acuerdo político para explorar un modelo de financiación singular y hacienda propia para Cataluña.' }
    ],
    frequent_confusions: [
      { confusion: 'La amnistía es inconstitucional porque la Constitución prohíbe expresamente los indultos generales.', reality: 'Falso/En debate. La Constitución prohíbe los indultos generales (Art. 62.i), pero la amnistía es una norma con rango de ley orgánica aprobada por el Parlamento que extingue el delito, no un indulto dictado por el Gobierno. El TC debe dirimir su constitucionalidad.' },
      { confusion: 'Cataluña recibe una sobredotación fiscal sistemática a costa de empobrecer a Madrid.', reality: 'Falso. Según los balances de balanza fiscal, la Comunidad de Madrid es la mayor aportadora neta al sistema común de solidaridad debido al efecto sede de grandes corporaciones y altos salarios, seguida por Cataluña y Baleares.' },
      { confusion: 'El concierto catalán propuesto romperá la caja única de la Seguridad Social.', reality: 'Falso. Las pensiones y prestaciones de la Seguridad Social se gestionan en una caja única centralizada de carácter estatal, la cual no está sujeta al debate de la hacienda propia para tributos ordinarios (IRPF, IVA).' }
    ],
    quick_replies: 'La Ley de Amnistía extingue cargos penales ligados al procés de forma definitiva. El debate de financiación busca dotar a Cataluña de gestión tributaria propia sin afectar los fondos comunes estatales de pensiones.',
    pending_questions: 'Encuadre constitucional de una hacienda singular catalana fuera del régimen de la LOFCA.'
  },
  'memoria-de-eta-y-terrorismo': {
    what_is_happening: 'El debate sobre las víctimas del terrorismo en España, el acercamiento de presos de la extinta banda ETA al País Vasco y la reducción de sus condenas por la convalidación de penas cumplidas en el extranjero polariza la agenda nacional.',
    what_we_know: 'ETA anunció el cese definitivo de su actividad armada en octubre de 2011 y se disolvió en 2018. Las víctimas de terrorismo están amparadas por la Ley 29/2011, que contempla pensiones, indemnizaciones de hasta 250.000€ y exenciones fiscales. La transferencia de la gestión de las prisiones al Gobierno Vasco se completó en 2021.',
    what_we_do_not_know: 'El esclarecimiento final de más de 300 crímenes cometidos por la banda terrorista cuya autoría material sigue sin sentencia judicial en firme.',
    key_facts: [
      'ETA asesinó a 853 personas a lo largo de su historia de violencia armada en España.',
      'El acercamiento de los presos a prisiones vascas es un criterio penitenciario general una vez disuelta la organización criminal.',
      'Las transferencias de prisiones no alteran las condenas impuestas por la Audiencia Nacional, que siguen bajo supervisión judicial estatal.'
    ],
    main_sources: [
      { name: 'Centro para la Memoria de las Víctimas del Terrorismo', url: 'https://www.memorialvictimas.org/' },
      { name: 'Ley 29/2011 de Reconocimiento y Protección Integral a las Víctimas del Terrorismo (BOE)', url: 'https://www.boe.es/' },
      { name: 'Convenio Europeo para la Represión del Terrorismo del Consejo de Europa', url: 'https://www.coe.int/' }
    ],
    chronology: [
      { date: 'Octubre 2011', event: 'ETA anuncia el cese definitivo de su actividad armada.' },
      { date: 'Mayo 2018', event: 'Disolución formal y definitiva de la organización terrorista ETA.' }
    ],
    frequent_confusions: [
      { confusion: 'El gobierno actual ha amnistiado o indultado de forma directa a presos de ETA.', reality: 'Falso. Ningún preso de ETA ha sido amnistiado ni indultado. Los beneficios penitenciarios (tercer grado) o el acercamiento de prisiones son decididos bajo la legislación penitenciaria común y fiscalizados por la Audiencia Nacional.' },
      { confusion: 'La reforma de 2024 rebaja las penas de prisión de los etarras de forma discrecional.', reality: 'Falso. Es la transposición obligatoria de la Directiva Europea 2008/675/JAI sobre acumulación de condenas en la UE: se computa el tiempo que un preso ya cumplió en cárceles de otro país miembro (Francia) para evitar la doble penalización del mismo delito.' },
      { confusion: 'Las víctimas del terrorismo en España no reciben ayuda económica del Estado.', reality: 'Falso. España tiene una de las legislaciones más garantistas del mundo (Ley 29/2011): otorga indemnizaciones de oficio y pensiones extraordinarias compatibles con cualquier otra prestación pública.' }
    ],
    quick_replies: 'ETA está disuelta desde 2018 y no comete atentados. Los presos cumplen sus condenas en cárceles vascas bajo el régimen general. La reforma de acumulación de condenas europeas aplica una directiva obligatoria de la UE de rango superior.',
    pending_questions: 'Esclarecimiento de los crímenes de ETA sin autor conocido y la deslegitimación social del terrorismo.'
  },
  'salarios-smi-y-coste-laboral': {
    what_is_happening: 'La evolución del Salario Mínimo Interprofesional (SMI), las subidas salariales colectivas para paliar el coste de la vida y el diferencial del salario medio en España frente a la media europea centran el debate laboral y empresarial.',
    what_we_know: 'El Salario Mínimo Interprofesional (SMI) en España ha subido más de un 50% desde 2018 hasta situarse en 1.134€ mensuales en 14 pagas. El coste laboral medio por trabajador lo mide el INE trimestralmente e incluye el salario bruto más las cotizaciones empresariales a la Seguridad Social.',
    what_we_do_not_know: 'El efecto definitivo de las subidas del SMI en el empleo de sectores agrarios con escasa productividad o de microempresas en regiones con salarios medios bajos.',
    key_facts: [
      'El salario medio bruto mensual en España ronda los 2.128 euros, situándose un 20% por debajo de la media europea.',
      'El IRPF exime de retención a rentas inferiores a 15.876 euros anuales desde 2024 para adaptarlo al SMI.',
      'Las cotizaciones sociales a cargo de la empresa representan aproximadamente el 30% del salario bruto del trabajador.'
    ],
    main_sources: [
      { name: 'INE - Encuesta Trimestral de Coste Laboral (ETCL)', url: 'https://www.ine.es/' },
      { name: 'Real Decreto 145/2024 por el que se fija el Salario Mínimo Interprofesional (BOE)', url: 'https://www.boe.es/' },
      { name: 'Ministerio de Trabajo y Economía Social - Informes sobre Salario Mínimo', url: 'https://www.mites.gob.es/' }
    ],
    chronology: [
      { date: 'Febrero 2024', event: 'Aprobación de la subida del SMI para 2024 fijado en 1.134 euros mensuales en 14 pagas.' },
      { date: 'Año 2023', event: 'El salario medio en España registra la mayor subida de la década con un incremento del 5.4%.' }
    ],
    frequent_confusions: [
      { confusion: 'Subir el Salario Mínimo (SMI) destruye empleo masivamente de forma demostrada.', reality: 'Falso. Las estadísticas oficiales de cotizantes (TGSS) y la EPA muestran que el número de afiliados a la Seguridad Social ha superado los 21 millones a la par de las subidas del SMI, con efectos residuales limitados en sectores puntuales de baja productividad.' },
      { confusion: 'El salario neto que recibe el trabajador es el coste total que paga la empresa por contratarle.', reality: 'Falso. El coste de contratación incluye el salario bruto (sobre el que se descuentan el IRPF e impuestos del empleado) más un coste de cotización empresarial del 30-33% abonado directamente a la Seguridad Social.' },
      { confusion: 'El salario mínimo en España se sitúa en la banda alta de los salarios mínimos de la UE.', reality: 'Verdadero. Medido en paridad de poder de compra, el SMI español se sitúa en el grupo de cabeza de los países de la UE, aunque el salario medio general sigue por debajo de las economías centrales (Alemania, Francia).' }
    ],
    quick_replies: 'El SMI en España ha subido sustancialmente hasta los 1.134€ al mes sin frenar la afiliación general a la Seguridad Social. Los salarios medios siguen por debajo de la media de la UE pero muestran una tendencia al alza.',
    pending_questions: 'Brecha salarial y productividad del tejido de pymes de menos de 10 trabajadores.'
  },
  'caso-begona-gomez': {
    what_is_happening: 'La investigación judicial a Begoña Gómez por presuntos delitos de tráfico de influencias y corrupción en los negocios genera una tormenta política en torno al papel de las acusaciones populares y los límites del ejercicio profesional de los familiares de los altos cargos.',
    what_we_know: 'El delito de tráfico de influencias (Art. 429 CP) exige prevalimiento efectivo de una relación de jerarquía o familiar para forzar una resolución favorable. La causa se inició por denuncia de Manos Limpias sustentada en recortes de prensa. La Fiscalía y la Audiencia Provincial delimitaron la causa excluyendo el bloque de los contratos de Red.es tras asumir su control la Fiscalía Europea.',
    what_we_do_not_know: 'El resultado final de los recursos de apelación interpuestos ante el Tribunal Supremo sobre la actuación del juez instructor y la constitucionalidad de admitir querellas sin indicios materiales directos.',
    key_facts: [
      'La firma de cartas de interés de adhesión a licitaciones públicas es un cauce habitual para consorcios universitarios y UTEs.',
      'La UCO no halló pruebas de trato de favor en la licitación del expediente de Red.es adjudicado al empresario Barrabés.',
      'La investigación judicial está sujeta al secreto de las actuaciones decretado en sus fases iniciales.'
    ],
    main_sources: [
      { name: 'Código Penal de España - Artículo 429 sobre Tráfico de Influencias', url: 'https://www.boe.es/' },
      { name: 'Auto de la Audiencia Provincial de Madrid delimitando la causa de instrucción', url: 'https://www.poderjudicial.es/' },
      { name: 'Informe de la Unidad Central Operativa (UCO) de la Guardia Civil sobre Red.es', url: 'https://www.guardiacivil.es/' }
    ],
    chronology: [
      { date: 'Abril 2024', event: 'El Juzgado de Instrucción número 41 de Madrid abre diligencias previas.' },
      { date: 'Junio 2024', event: 'La Fiscalía Europea reclama la competencia sobre la parte principal del sumario vinculada a fondos de la UE.' }
    ],
    frequent_confusions: [
      { confusion: 'La UCO concluyó en su informe que Begoña Gómez cometió cohecho y malversación.', reality: 'Falso. El informe preliminar de la UCO (Unidad Central Operativa de la Guardia Civil) indicó que no se detectaron indicios de trato de favor ni desvíos financieros sospechosos en las licitaciones públicas de Red.es investigadas.' },
      { confusion: 'Firmar una carta de apoyo en una licitación pública constituye automáticamente un delito.', reality: 'Falso. La firma de cartas de recomendación o interés no es delictiva per se; solo constituye tráfico de influencias si se acredita que se ejerció una presión indebida en favor del adjudicatario aprovechando el cargo de un tercero.' },
      { confusion: 'Begoña Gómez recibió una subvención de 56.000€ del Ministerio de Trabajo en 2024.', reality: 'Falso. Se trató de una ayuda del BOE para una empresaria de Cantabria que comparte el mismo nombre y primer apellido. La base nacional de subvenciones confirmó el error de homonimia.' }
    ],
    quick_replies: 'La causa judicial contra Begoña Gómez investiga si medió trato de favor en contratos públicos. Los informes de la Guardia Civil no detectaron irregularidades en la adjudicación de las licitaciones de Red.es.',
    pending_questions: 'Delimitación definitiva de la causa judicial tras la inhibición de los contratos de la UE a la Fiscalía Europea.'
  },
  'investigacion-judicial-david-sanchez': {
    what_is_happening: 'La investigación penal a David Sánchez (hermano del Presidente del Gobierno) por presunta malversación, prevaricación y fraude fiscal en su puesto en la Diputación de Badajoz centra las críticas por la tributación en el extranjero de trabajadores fronterizos.',
    what_we_know: 'David Sánchez ostenta el puesto de Coordinador de Conservatorios en la Diputación de Badajoz mediante contrato laboral de alta dirección. Declaró su residencia fiscal en Portugal (Elvas). El Juzgado de Instrucción de Badajoz abrió diligencias y ordenó a la UCO recabar correos oficiales y registros del cumplimiento de su jornada laboral.',
    what_we_do_not_know: 'Si las inspecciones de la Agencia Tributaria detectarán que el núcleo de su actividad económica o su estancia efectiva superó los límites de la residencia transfronteriza.',
    key_facts: [
      'La Diputación de Badajoz autorizó la realización de tareas mediante teletrabajo no presencial bajo el convenio de la institución.',
      'Los puestos directivos de alta dirección están exentos de oposiciones ordinarias pero sujetos a acreditación de perfil profesional.',
      'La residencia fiscal en Portugal permite acogerse al régimen especial de residentes no habituales con tipos de IRPF reducidos.'
    ],
    main_sources: [
      { name: 'Diputación de Badajoz - Portal de Transparencia y Relación de Puestos de Trabajo', url: 'https://www.dip-badajoz.es/' },
      { name: 'Convenio entre España y Portugal para Evitar la Doble Imposición (BOE)', url: 'https://www.boe.es/' },
      { name: 'Agencia Tributaria - Criterios de residencia fiscal habitual y Convenios', url: 'https://sede.agenciatributaria.gob.es/' }
    ],
    chronology: [
      { date: 'Junio 2024', event: 'El Juzgado de Instrucción número 3 de Badajoz abre diligencias de investigación penal.' },
      { date: 'Julio 2024', event: 'Agentes de la UCO registran la Diputación de Badajoz para volcar correos y actas laborales.' }
    ],
    frequent_confusions: [
      { confusion: 'El hermano del presidente fue nombrado funcionario de carrera sin aprobar ninguna oposición pública.', reality: 'Falso. Ocupa un puesto de personal de alta dirección regulado laboralmente (RD 1382/1985), no es funcionario de carrera con plaza en propiedad, lo que permite su libre designación y cese.' },
      { confusion: 'Su patrimonio de 2 millones de euros en cuentas es imposible de justificar con su sueldo público.', reality: 'Falso. Según los bienes declarados, la mayor parte de su patrimonio proviene de una herencia familiar legítima y de sus ingresos profesionales previos en el extranjero como director de orquesta.' },
      { confusion: 'Residir en Portugal trabajando en España es un delito fiscal grave en todos los casos.', reality: 'Falso. Es una práctica legal regulada transfronteriza siempre que se cumplan las reglas físicas de residencia efectiva de más de 183 días anuales en territorio portugués y el pago de tributos comunes.' }
    ],
    quick_replies: 'La investigación penal a David Sánchez dirime el cumplimiento real de sus funciones y la legalidad de su régimen de residencia fiscal transfronteriza en Portugal. Su patrimonio procede en gran parte de herencias declaradas.',
    pending_questions: 'Verificación del registro de fichajes físicos e informes de actividades presentados por el directivo.'
  },
  'inflacion-y-coste-de-vida': {
    what_is_happening: 'El debate de precios en España se centra en el encarecimiento de la cesta de la compra y de la energía acumulado, pese a la reducción interanual del IPC general por debajo de la media europea.',
    what_we_know: 'El IPC es calculado mensualmente por el INE. El Gobierno aplicó medidas correctoras como la reducción del IVA de alimentos básicos (pan, leche, huevos al 0%) y rebajas al impuesto de la electricidad y gas natural.',
    what_we_do_not_know: 'El efecto final que tendrá la retirada paulatina de las bonificaciones fiscales sobre el IPC general del próximo ejercicio.',
    key_facts: [
      'La inflación subyacente (que excluye energía y alimentos frescos) muestra mayor resistencia a la baja.',
      'El aceite de oliva registró un encarecimiento superior al 150% interanual en origen debido a la sequía prolongada.',
      'La cesta de la compra oficial de España consta de cerca de 1.000 artículos ponderados según el gasto familiar medio.'
    ],
    main_sources: [
      { name: 'INE - Índices de Precios de Consumo (IPC) y Cesta de la Compra', url: 'https://www.ine.es/' },
      { name: 'Real Decreto-ley 8/2023 de Medidas de Alivio e Impuestos (BOE)', url: 'https://www.boe.es/' },
      { name: 'CNMC - Informes de seguimiento de los precios de venta al público en distribución', url: 'https://www.cnmc.es/' }
    ],
    chronology: [
      { date: 'Diciembre 2023', event: 'Prórroga de la supresión del IVA para alimentos básicos de primera necesidad.' },
      { date: 'Junio 2024', event: 'El BCE acuerda la primera rebaja de tipos de interés tras dos años de subidas continuas.' }
    ],
    frequent_confusions: [
      { confusion: 'Que el IPC baje al 2% significa que los precios de los supermercados están bajando.', reality: 'Falso. Significa que los precios suben de forma más lenta (un 2% anual en lugar de un 8%), pero el coste acumulado sigue siendo el mismo.' },
      { confusion: 'El gobierno manipula el IPC excluyendo el precio del aceite de oliva de las estadísticas.', reality: 'Falso. El INE incluye el aceite de oliva dentro del grupo de "aceites y grasas" de la cesta de la compra oficial y publica mensualmente su encarecimiento detallado.' },
      { confusion: 'La bajada del IVA de los alimentos se la quedaron en su totalidad los supermercados subiendo márgenes.', reality: 'Falso. Los informes de la CNMC y del Banco de España concluyeron que el descuento fiscal se trasladó en más del 95% a los precios de venta al público en el momento de su aplicación.' }
    ],
    quick_replies: 'Una bajada del IPC no es una bajada de precios, sino una ralentización en su ritmo de subida. Las medidas de rebaja del IVA amortiguaron parcialmente los precios de alimentos básicos, pero el coste acumulado desde 2022 es severo.',
    pending_questions: 'Evolución de los márgenes comerciales de las distribuidoras en origen agropecuario.'
  },
  'sanidad-publica': {
    what_is_happening: 'La saturación de la atención primaria, el récord histórico de las listas de espera para operaciones y el debate sobre la derivación de fondos a conciertos con la sanidad privada centran la agenda sanitaria.',
    what_we_know: 'El Sistema Nacional de Salud (SNS) está transferido en su gestión a las CCAA. El Ministerio de Sanidad unifica los datos de listas de espera (SISLE) reflejando más de 849.000 pacientes esperando quirófano. El gasto público sanitario equivale al 7.8% del PIB.',
    what_we_do_not_know: 'La efectividad de los planes de choque autonómicos para reducir las listas de espera ante la falta crónica de médicos especialistas disponibles en bolsa laboral.',
    key_facts: [
      'El tiempo medio de espera quirúrgica se sitúa en 128 días, con diferencias de más de 60 días entre CCAA.',
      'La sanidad privada realiza más del 30% de la actividad quirúrgica del país mediante seguros colectivos o conciertos públicos.',
      'El gasto público sanitario por habitante varía significativamente entre autonomías, superando los 2.000€ en algunas.'
    ],
    main_sources: [
      { name: 'Ministerio de Sanidad - Indicadores del Sistema Nacional de Salud (SISLE)', url: 'https://www.sanidad.gob.es/' },
      { name: 'INE - Estadísticas de Gasto Sanitario Público y Privado', url: 'https://www.ine.es/' },
      { name: 'Ley de Cohesión y Calidad del Sistema Nacional de Salud - BOE', url: 'https://www.boe.es/' }
    ],
    chronology: [
      { date: 'Año 2023', event: 'Las listas de espera para cirugía no urgente marcan el récord de la serie histórica en España.' },
      { date: 'Noviembre 2023', event: 'El Ministerio de Sanidad actualiza los informes de ratios de profesionales de atención primaria.' }
    ],
    frequent_confusions: [
      { confusion: 'El Estado puede obligar a un médico a trabajar en la sanidad pública prohibiéndole la privada.', reality: 'Falso. La ley de incompatibilidades permite trabajar en ambos sectores siempre que no haya coincidencia de horarios o conflicto de intereses directos según la plaza autonómica.' },
      { confusion: 'La sanidad pública de España es totalmente gratuita para los ciudadanos de forma incondicional.', reality: 'Falso. Se financia íntegramente mediante los impuestos generales del sistema tributario (no mediante cotizaciones de la SS), y contempla copagos variables en farmacias según el nivel de renta.' },
      { confusion: 'Los inmigrantes sin papeles colapsan las listas de espera de los hospitales.', reality: 'Falso. Los inmigrantes irregulares solo acceden por urgencias de forma ordinaria o bajo tarjetas de protección temporal autonómicas específicas, representando menos del 5% del gasto hospitalario total.' },
      { confusion: 'El Gobierno ha privatizado la gestión de los hospitales públicos para regalárselo a multinacionales extranjeras.', reality: 'Falso. La titularidad y el derecho de acceso a la salud siguen siendo 100% públicos y universales. Lo que existe son modelos de concesión de gestión indirecta del servicio o conciertos con mutuas regulados por leyes autonómicas específicas.' }
    ],
    quick_replies: 'Las listas de espera quirúrgica marcan máximos históricos por la falta de personal y la ineficiencia organizativa de las transferencias sanitarias. El gasto público equivale al 7.8% del PIB.',
    pending_questions: 'Armonización de las ratios de personal de enfermería y facultativos entre CCAA.'
  },
  'justicia-imputado-condenado': {
    what_is_happening: 'El debate judicial sobre la presunción de inocencia, los juicios paralelos en medios de comunicación y el uso político de la figura de la querella popular divide la opinión sobre el funcionamiento de los tribunales.',
    what_we_know: 'La LECrim regula las fases procesales. La condición de investigado garantiza el derecho a declarar con asistencia legal. El auto de procesamiento formaliza los cargos criminales para ir a juicio. La presunción de inocencia (Art. 24 CE) prevalece hasta que exista una sentencia firme.',
    what_we_do_not_know: 'El porcentaje exacto de querellas archivadas preliminarmente frente a las que terminan en apertura de juicio oral debido a la falta de registros anuales del CGPJ por tipología de delito.',
    key_facts: [
      'El término legal "imputado" fue sustituido en 2015 por el de "investigado" para evitar el estigma social anticipado.',
      'Las acusaciones populares deben depositar fianza para personarse en la causa penal, aunque el juez puede eximirles o reducirla.',
      'Una condena penal requiere prueba de cargo suficiente y no puede fundamentarse únicamente en especulaciones de prensa.'
    ],
    main_sources: [
      { name: 'Ley de Enjuiciamiento Criminal - Artículos de la Fase de Instrucción (BOE)', url: 'https://www.boe.es/' },
      { name: 'Consejo General del Poder Judicial - Memorias Estadísticas Anuales', url: 'https://www.poderjudicial.es/' },
      { name: 'Constitución Española de 1978 - Artículo 24 sobre la tutela judicial efectiva', url: 'https://www.boe.es/' }
    ],
    chronology: [
      { date: 'Octubre 2015', event: 'Reforma de la LECrim que introduce los términos de investigado y encausado.' },
      { date: 'Enero 2024', event: 'El Tribunal Supremo publica directrices para unificar el criterio sobre el levantamiento de medidas cautelares.' }
    ],
    frequent_confusions: [
      { confusion: 'Que un juez admita a trámite una querella contra ti significa que eres culpable del delito.', reality: 'Falso. La admisión a trámite solo indica que la querella cumple los requisitos formales mínimos y que los hechos narrados justifican iniciar una investigación preliminar.' },
      { confusion: 'La prisión provisional constituye una pena anticipada impuesta por el juez de instrucción.', reality: 'Falso. Es una medida cautelar excepcional que solo se decreta por riesgo de fuga, destrucción de pruebas o reiteración delictiva, no una condena en firme.' },
      { confusion: 'Los jueces en España son nombrados directamente a dedo por el Gobierno en activo.', reality: 'Falso. El acceso a la carrera judicial se realiza mediante oposición libre estatal ciega de méritos y exámenes. Solo los vocales del CGPJ y magistrados del TC tienen designación política parlamentaria.' }
    ],
    quick_replies: 'Estar investigado o imputado no prejuzga la culpabilidad, sino que otorga plenas garantías procesales de defensa. La presunción de inocencia exige pruebas de cargo válidas en juicio oral para dictar condena.',
    pending_questions: 'Reforma de la Ley de Enjuiciamiento Criminal para otorgar la dirección de la instrucción al Fiscal.'
  },
  'consumo-viral-productos-milagro': {
    what_is_happening: 'La proliferación de cuentas de influencers que recomiendan dietas curativas, suplementos alimenticios sin control y cosméticos con supuestas propiedades milagrosas elude los cauces farmacéuticos y la regulación publicitaria.',
    what_we_know: 'El Real Decreto 1907/1996 prohíbe la publicidad de productos alimenticios o cosméticos con propiedades preventivas o curativas de enfermedades. La AEMPS coordina las alertas sanitarias y ordena la retirada inmediata de lotes sospechosos.',
    what_we_do_not_know: 'El alcance real de los daños hepáticos o renales asociados a la ingesta masiva de suplementos adquiridos en portales extranjeros de internet que eluden los controles de aduanas.',
    key_facts: [
      'Los complementos alimenticios no requieren evaluación clínica previa de eficacia para salir al mercado, solo registro sanitario formal.',
      'La CNMC y Consumo sancionan la publicidad encubierta en redes que oculte la vinculación comercial del creador de contenido.',
      'La EFSA (Autoridad Europea de Seguridad Alimentaria) valida científicamente qué reclamos de salud se pueden etiquetar.'
    ],
    main_sources: [
      { name: 'AEMPS - Agencia Española de Medicamentos y Productos Sanitarios', url: 'https://www.aemps.gob.es/' },
      { name: 'Real Decreto 1907/1996 sobre Publicidad de Productos Milagro (BOE)', url: 'https://www.boe.es/' },
      { name: 'EFSA - Autoridad Europea de Seguridad Alimentaria (Alegaciones Nutricionales)', url: 'https://www.efsa.europa.eu/' }
    ],
    chronology: [
      { date: 'Año 2024', event: 'Entrada en vigor del nuevo Reglamento de Influencers de la Ley General de Comunicación Audiovisual.' },
      { date: 'Mayo 2024', event: 'Alertas sanitarias de Consumo ordenando el cese de campañas de suplementos de melatonina sobredimensionados.' }
    ],
    frequent_confusions: [
      { confusion: 'Cualquier producto vendido en herbolarios o farmacias está demostrado científicamente que cura.', reality: 'Falso. Los productos homeopáticos y fitoterapéuticos se registran bajo categorías de registro simplificadas que no exigen ensayos clínicos de eficacia curativa.' },
      { confusion: 'Las marcas de colágeno o batidos detox tienen aval médico oficial para sus reclamos de salud.', reality: 'Falso. La EFSA (Autoridad Europea de Seguridad Alimentaria) ha denegado más del 90% de las alegaciones de salud solicitadas por fabricantes de colágeno y detox por falta de rigor científico.' },
      { confusion: 'Los influencers pueden recomendar tratamientos médicos en sus perfiles sin titulación.', reality: 'Falso. La ley prohíbe la prescripción no oficial de medicamentos y la publicidad de tratamientos hospitalarios o médicos por personas no cualificadas.' }
    ],
    quick_replies: 'Los complementos de salud y colágenos no son medicamentos y la ley prohíbe atribuirles propiedades terapéuticas o curativas. Exige siempre el etiquetado de contenido patrocinado (#Publi) en influencers.',
    pending_questions: 'Sanción efectiva de las webs extranjeras que venden pseudoterapias curativas a enfermos terminales.'
  },
  'ciberestafas-y-dinero-facil': {
    what_is_happening: 'Las estafas de suplantación de identidad mediante SMS o correo (phishing/smishing), el secuestro de cuentas de WhatsApp y los fraudes de falsas inversiones en criptomonedas captan el dinero de miles de ciudadanos.',
    what_we_know: 'La Ley PSD2 obliga a los bancos a autenticar con doble factor las transferencias. Si el banco es hackeado o no detecta la brecha, es civilmente responsable de la devolución, salvo que demuestre negligencia grave del usuario. La CNMV mantiene una base de advertencias públicas sobre entidades no autorizadas.',
    what_we_do_not_know: 'El volumen de dinero transferido que logra ser recuperado una vez es desviado a cuentas bancarias ubicadas en paraísos fiscales o convertido a redes descentralizadas de criptomonedas.',
    key_facts: [
      'Las denuncias por ciberdelincuencia representan más del 20% del total de infracciones penales registradas en España.',
      'Los ciberestafadores utilizan números de teléfono y cuentas bancarias muleros falsas para dificultar su localización.',
      'El INCIBE opera un canal gratuito 017 de consulta directa para incidentes de ciberseguridad y estafas.'
    ],
    main_sources: [
      { name: 'INCIBE - Instituto Nacional de Ciberseguridad de España', url: 'https://www.incibe.es/' },
      { name: 'CNMV - Comisión Nacional del Mercado de Valores (Alertas de Inversión)', url: 'https://www.cnmv.es/' },
      { name: 'Directiva de Servicios de Pago Europea (PSD2) y sus normas de autenticación', url: 'https://ec.europa.eu/' }
    ],
    chronology: [
      { date: 'Año 2024', event: 'Las denuncias por phishing y estafas en tarjetas de crédito marcan el máximo histórico del país.' },
      { date: 'Enero 2024', event: 'La CNMV actualiza su buscador público de entidades financieras autorizadas y piratas.' }
    ],
    frequent_confusions: [
      { confusion: 'Si caes en un phishing y transfieres dinero, el banco no te devolverá nada en ningún caso.', reality: 'Falso. La jurisprudencia del Tribunal Supremo establece que el banco debe restituir el dinero a menos que pruebe que el cliente actuó de forma temeraria o con dolo directo.' },
      { confusion: 'Los bots o canales de Telegram que prometen duplicar tu capital con apuestas deportivas son legales.', reality: 'Falso. Constituyen chiringuitos de captación no autorizados y fraudes piramidales Ponzi exentos de la regulación y protección del inversor de la CNMV.' },
      { confusion: 'Una llamada con el número real de tu banco en pantalla garantiza que estás hablando con ellos.', reality: 'Falso. Es la técnica llamada "Caller ID Spoofing": los ciberdelincuentes suplantan el prefijo o el número real que aparece en tu móvil usando centralitas VoIP.' }
    ],
    quick_replies: 'Las ciberestafas representan la tipología delictiva de mayor crecimiento. No confíes en SMS urgentes ni llamadas entrantes solicitando tus claves personales. Tu banco nunca te pedirá contraseñas por teléfono.',
    pending_questions: 'Bloqueo automatizado de llamadas spoofing por los operadores de telecomunicaciones.'
  },
  'corrupcion-y-promesas-politicas': {
    what_is_happening: 'Las comisiones ilegales en compras de emergencia durante crisis, el desvío de subvenciones públicas y el incumplimiento de promesas electorales centran la desconfianza institucional en España.',
    what_we_know: 'La Ley de Contratos del Sector Público (LCSP) regula las licitaciones públicas. La contratación de emergencia exime de la licitación competitiva por urgencia, pero obliga a rendir cuentas a posteriori ante el Tribunal de Cuentas. La Fiscalía Anticorrupción investiga de oficio los indicios de cohecho o malversación.',
    what_we_do_not_know: 'El impacto real de los portales de transparencia municipales para evitar contratos menores fraccionados de forma arbitraria.',
    key_facts: [
      'La contratación menor por adjudicación directa está limitada por ley a 15.000€ en servicios y 40.000€ en obras.',
      'La malversación agravada tras la última reforma penal contempla penas de hasta 8 años de prisión y 20 de inhabilitación.',
      'El Tribunal de Cuentas fiscaliza el destino de todas las subvenciones públicas otorgadas en el territorio nacional.'
    ],
    main_sources: [
      { name: 'Ley 9/2017 de Contratos del Sector Público (LCSP) - BOE', url: 'https://www.boe.es/' },
      { name: 'Tribunal de Cuentas de España - Informes y Memorias de Fiscalización', url: 'https://www.tcu.es/' },
      { name: 'Fiscalía Especial contra la Corrupción y la Criminalidad Organizada', url: 'https://www.fiscal.es/' }
    ],
    chronology: [
      { date: 'Noviembre 2017', event: 'Aprobación de la Ley de Contratos del Sector Público para trasponer las directivas de la UE.' },
      { date: 'Marzo 2026', event: 'Sentencia de la Audiencia Nacional que reafirma las condenas por contratos menores fraudulentos.' }
    ],
    frequent_confusions: [
      { confusion: 'La contratación por vía de emergencia exime del deber de justificar en qué se gasta el dinero público.', reality: 'Falso. Exime de los trámites competitivos de licitación previa, pero obliga a rendir cuentas a posteriori justificando la necesidad, la entrega del material y los precios abonados.' },
      { confusion: 'Cualquier comisionista privado en el sector sanitario comete un delito penal de corrupción.', reality: 'Falso. La intermediación comercial privada es legal en España y se cobra comisión por facilitar suministros. Solo constituye delito de cohecho o tráfico de influencias si media soborno a funcionario o prevalecimiento.' },
      { confusion: 'El Tribunal de Cuentas dicta condenas de prisión para los políticos corruptos.', reality: 'Falso. El Tribunal de Cuentas tiene competencias exclusivas de jurisdicción contable civil: solo condena a reintegrar el dinero público desviado, el enjuiciamiento penal corresponde a los juzgados ordinarios.' }
    ],
    quick_replies: 'La contratación de emergencia exime de licitación por urgencia, pero obliga a fiscalización contable a posteriori. Las comisiones solo son delictivas si hay soborno, sobrecostes amañados o desvío de fondos a favor de cargos.',
    pending_questions: 'Endurecimiento de los requisitos de solvencia técnica de los proveedores en licitaciones exprés.'
  },
  'seguridad-obras-publicas': {
    what_is_happening: 'Los bulos y alertas sobre el colapso inminente de infraestructuras críticas (presas, viaductos de autovías) y las desinformaciones sobre la demolición intencionada de embalses en plena sequía generan alarma social.',
    what_we_know: 'La Directiva Europea de Aguas y la Estrategia de Biodiversidad de la UE exigen restaurar los ecosistemas fluviales. Esto obliga a la eliminación de pequeñas barreras en desuso (azudes, compuertas obsoletas). Las presas de abastecimiento no se demuelen. La vigilancia estructural de presas y viaductos se realiza con sensores láser continuos.',
    what_we_do_not_know: 'La inversión global total acumulada necesaria para renovar los miles de puentes de la red secundaria autonómica y local que muestran síntomas de envejecimiento.',
    key_facts: [
      'España es el país de Europa y el quinto del mundo con mayor número de grandes presas operativas (más de 1.200 embalses).',
      'Las obras de restauración fluvial retiraron más de 100 barreras fluviales en desuso en el último año natural.',
      'El Ministerio de Transportes realiza inspecciones técnicas de seguridad periódicas obligatorias en los puentes estatales.'
    ],
    main_sources: [
      { name: 'Ministerio para la Transición Ecológica - Inventario Oficial de Presas y Embalses', url: 'https://www.miteco.gob.es/' },
      { name: 'Dirección General del Agua - Normas sobre Obras y Restauración de Ríos', url: 'https://www.miteco.gob.es/' },
      { name: 'Ministerio de Transportes y Movilidad Sostenible - Seguridad de Puentes', url: 'https://www.transportes.gob.es/' }
    ],
    chronology: [
      { date: 'Año 2023', event: 'España encabeza la retirada de azudes obsoletos en Europa siguiendo las directrices ecológicas de la UE.' },
      { date: 'Enero 2024', event: 'El Gobierno aprueba planes de seguridad de presas para las confederaciones hidrográficas.' }
    ],
    frequent_confusions: [
      { confusion: 'El Gobierno ha demolido presas operativas llenas de agua en plena sequía extrema.', reality: 'Falso. Las demoliciones corresponden a pequeños azudes, azudes ruinosos o barreras fluviales inservibles que no retenían agua para regadío o abastecimiento. Ningún gran embalse de agua operativo ha sido destruido.' },
      { confusion: 'Cualquier grieta visible en el viaducto de una autovía implica que se va a derrumbar de inmediato.', reality: 'Falso. El hormigón armado presenta juntas de dilatación térmicas obligatorias y microfisuras superficiales. Solo las fisuras estructurales profundas bajo el nivel de fatiga comprometen la estabilidad.' },
      { confusion: 'La retirada de azudes e infraestructuras fluviales obsoletas perjudica el abastecimiento humano.', reality: 'Falso. Las barreras retiradas son obstáculos obsoletos que impedían la migración de peces y aceleraban la acumulación de sedimentos perjudiciales, sin aportar agua a la red de consumo de la población.' }
    ],
    quick_replies: 'España restaura sus ríos retirando obstáculos y azudes inservibles de escaso caudal en desuso. Las grandes presas de abastecimiento siguen operativas bajo monitorización láser estructural.',
    pending_questions: 'Financiación de las confederaciones para la limpieza de sedimentos pesados acumulados en el fondo de los embalses.'
  },
  'educacion-leyes-y-rendimiento': {
    what_is_happening: 'El debate educativo en España gira en torno a las sucesivas reformas (LOMLOE vs LOMCE), la tasa de abandono escolar temprano, el rendimiento académico del Informe PISA y la implantación de medidas de gratuidad en material o comedores escolares.',
    what_we_know: 'El sistema educativo español está descentralizado, siendo competencia de las CCAA gestionar y desarrollar las bases comunes del Ministerio de Educación. La ley LOMLOE prioriza el aprendizaje basado en competencias. España ha reducido el abandono escolar temprano en la última década hasta situarse en torno al 13%.',
    what_we_do_not_know: 'La viabilidad a largo plazo de un Pacto de Estado por la Educación consensuado entre todas las fuerzas parlamentarias que impida la inestabilidad de las leyes orgánicas con cada cambio de gobierno.',
    key_facts: [
      'Las competencias de gestión de la educación y contratación de docentes corresponden de forma exclusiva a las CCAA.',
      'El Informe PISA evalúa las competencias en matemáticas, lectura y ciencias de los alumnos de 15 años bajo el baremo común de la OCDE.',
      'La ley LOMLOE prohíbe expresamente que los colegios concertados cobren cuotas obligatorias por enseñanzas curriculares gratuitas.'
    ],
    main_sources: [
      { name: 'Ministerio de Educación, Formación Profesional y Deportes - Estadísticas y Leyes', url: 'https://www.educacionfpydeportes.gob.es/' },
      { name: 'INE - Estadísticas de Educación y Abandono Escolar Temprano', url: 'https://www.ine.es/' },
      { name: 'OCDE - Informes del Programa para la Evaluación Internacional de Alumnos (PISA)', url: 'https://www.oecd.org/' }
    ],
    chronology: [
      { date: 'Enero 2021', event: 'Entrada en vigor de la Ley Orgánica 3/2020 de Modificación de la Ley Orgánica de Educación (LOMLOE).' },
      { date: 'Diciembre 2023', event: 'Publicación de los resultados del Informe PISA 2022 que reflejan una bajada generalizada en la OCDE tras la pandemia.' }
    ],
    frequent_confusions: [
      { confusion: 'La ley LOMLOE (Ley Celaá) permite pasar de año con infinitos suspensos de forma automática.', reality: 'Falso. La ley establece que la promoción de curso recae en la valoración colegiada del equipo docente sobre la adquisición de competencias básicas del alumno, no es un aprobado general automático.' },
      { confusion: 'El llamado "pin parental" está aprobado y es de obligado cumplimiento en toda España.', reality: 'Falso. El pin parental (el requisito de autorización previa expresa de los padres para que los alumnos asistan a talleres extracurriculares obligatorios) no forma parte del marco legal estatal del Ministerio de Educación por vulnerar la competencia docente.' },
      { confusion: 'Las tasas universitarias españolas son las más elevadas y prohibitivas de la eurozona.', reality: 'Falso. Los precios públicos los regulan las CCAA dentro de unos límites estatales de precios máximos; España se sitúa en la banda media de la UE, existiendo exenciones del 100% de matrícula para becas por renta oficial.' }
    ],
    quick_replies: 'La educación española se gestiona de forma descentralizada por las autonomías. Las sucesivas leyes orgánicas buscan adecuar el sistema al marco competencial europeo, aunque la falta de consenso a largo plazo genera inestabilidad docente.',
    pending_questions: 'Homogeneización de los contenidos curriculares y de los exámenes de selectividad (EBAU) en todo el territorio.'
  },
  'cultura-subvenciones-y-patrimonio': {
    what_is_happening: 'El debate cultural en España suele centrarse en la financiación pública del cine español, las acusaciones de politización del sector audiovisual y la dotación y uso de programas como el Bono Cultural Joven.',
    what_we_know: 'Las ayudas públicas al cine las concede de forma reglada el ICAA mediante concurrencia competitiva basada en auditorías de taquilla y rodaje. La industria cultural representa el 3.2% del PIB de España. El Bono Cultural Joven concede 400€ a quienes cumplen 18 años, bajo plazos e itinerarios de gasto muy estrictos.',
    what_we_do_not_know: 'El porcentaje exacto de retorno indirecto de marcas y turismo que generan las producciones de gran repercusión rodadas en territorio español.',
    key_facts: [
      'El ICAA (Instituto de la Cinematografía) concede ayudas de producción basándose en criterios objetivos de puntuación y auditoría fiscal.',
      'El Bono Cultural Joven tiene vetada la compra de hardware de videojuegos, moda, espectáculos deportivos y apuestas.',
      'La Ley de Patrimonio Histórico Español de 1985 regula la conservación y el derecho de tanteo y retracto del Estado.'
    ],
    main_sources: [
      { name: 'Ministerio de Cultura - Presupuestos y Estadísticas Culturales', url: 'https://www.cultura.gob.es/' },
      { name: 'ICAA - Resoluciones de Ayudas y Estadísticas de Cine Español', url: 'https://www.cultura.gob.es/' },
      { name: 'Ley 16/1985 del Patrimonio Histórico Español - BOE', url: 'https://www.boe.es/' }
    ],
    chronology: [
      { date: 'Julio 2022', event: 'Lanzamiento de la primera convocatoria del Bono Cultural Joven en España.' },
      { date: 'Año 2023', event: 'El sector audiovisual español alcanza récord de rodajes internacionales atraídos por las deducciones fiscales.' }
    ],
    frequent_confusions: [
      { confusion: 'El cine español vive en exclusiva de subvenciones públicas y da pérdidas millonarias.', reality: 'Falso. La industria del cine y del videojuego genera más de 8.000 millones de euros anuales al PIB español y genera decenas de miles de empleos directos, siendo las ayudas estatales apenas el 8% del presupuesto total de las producciones.' },
      { confusion: 'El Bono Cultural Joven se puede canjear libremente por dinero en metálico o videojuegos de consola.', reality: 'Falso. Se concede mediante tarjeta virtual nominativa sujeta a límites rigurosos: máximo 200€ en artes en vivo, 100€ en productos físicos (libros) y 100€ en consumo digital. Las compras quedan registradas en el portal de Consumo.' },
      { confusion: 'La tauromaquia se lleva la mayor parte de las subvenciones del presupuesto del Ministerio de Cultura.', reality: 'Falso. Las partidas destinadas a espectáculos taurinos representan menos del 0.05% de los presupuestos globales de Cultura, centrándose los fondos principalmente en museos nacionales (Prado, Reina Sofía), archivos y fomento del libro.' }
    ],
    quick_replies: 'Las industrias culturales aportan el 3.2% del PIB nacional y se financian mediante capital privado e incentivos fiscales. El Bono Cultural Joven y las ayudas cinematográficas del ICAA están sujetas a auditorías de gasto estrictas.',
    pending_questions: 'Desarrollo de la Ley del Cine y del Estatuto del Artista pendiente de consolidación legislativa.'
  },
  'empleo-y-cifras-de-paro': {
    what_is_happening: 'El cómputo del desempleo en España y el impacto de los contratos fijos discontinuos tras la reforma laboral de 2021 centran el debate sobre la calidad de las cifras oficiales del paro registrado.',
    what_we_know: 'El INE elabora la Encuesta de Población Activa (EPA) con criterios de la OIT, siendo homologada por Eurostat. El SEPE reporta mensualmente el paro registrado, en el cual los fijos discontinuos inactivos no se computan como parados registrados (sino como demandantes no ocupados), lo cual sigue la misma metodología aplicada desde el año 1985.',
    what_we_do_not_know: 'El número exacto de fijos discontinuos inactivos en cada instante exacto del mes debido a la falta de cruce de datos en tiempo real entre la Tesorería de la Seguridad Social y las oficinas de empleo autonómicas.',
    key_facts: [
      'La EPA es una encuesta trimestral de hogares y no se basa en el registro de las oficinas públicas de empleo del SEPE.',
      'Los fijos discontinuos tienen una relación laboral activa por contrato e indefinida, alternando periodos de actividad e inactividad.',
      'El desempleo juvenil en España sigue triplicando la media general, siendo una de las tareas estructurales del mercado laboral.'
    ],
    main_sources: [
      { name: 'INE - Encuesta de Población Activa (EPA) trimestral', url: 'https://www.ine.es/' },
      { name: 'SEPE - Estadísticas oficiales de paro registrado y contratos', url: 'https://sepe.es/' },
      { name: 'Eurostat - Estadísticas armonizadas de desempleo en la UE', url: 'https://ec.europa.eu/eurostat/' }
    ],
    chronology: [
      { date: 'Diciembre 2021', event: 'Aprobación del Real Decreto-ley 32/2021 de medidas urgentes para la reforma laboral.' },
      { date: 'Junio 2024', event: 'España registra el mínimo histórico de tasa de temporalidad en el empleo asalariado general.' }
    ],
    frequent_confusions: [
      { confusion: 'El Gobierno oculta a millones de parados catalogándolos como fijos discontinuos.', reality: 'Falso. La clasificación de los fijos discontinuos como demandantes de empleo no ocupados (DENOS) está regulada por una Orden Estatal del Ministerio de Trabajo del año 1985. Además, la EPA (que es independiente del SEPE) mide la ocupación real preguntando directamente al trabajador y es inmune a las tipologías de contrato.' },
      { confusion: 'La EPA de España está totalmente manipulada por el gobierno para que el paro parezca menor.', reality: 'Falso. La EPA la realiza el INE con supervisión y validación continua de la Oficina de Estadísticas de la UE (Eurostat). Sería inviable manipular una encuesta sometida a control supranacional sin que saltaran las alarmas del Eurogrupo.' },
      { confusion: 'El empleo en España crece únicamente porque se trocean contratos indefinidos a tiempo parcial.', reality: 'Falso. Según los datos del INE, las horas totales trabajadas medidas por la Contabilidad Nacional muestran tasas de variación interanual positivas que confirman que el incremento del empleo es efectivo y no mero fraccionamiento contractual.' }
    ],
    quick_replies: 'Las cifras del desempleo las miden dos fuentes distintas: la EPA (encuesta oficial Eurostat) y el paro registrado del SEPE. Los fijos discontinuos inactivos no computan como parados de forma legal desde hace 40 años.',
    pending_questions: 'Cálculo de la tasa de subempleo y personas inactivas desanimadas que no buscan trabajo de forma activa.'
  },
  'autonomos-y-fiscalidad': {
    what_is_happening: 'La implantación del nuevo sistema de cotización por ingresos reales en el Régimen Especial de Trabajadores Autónomos (RETA) y el IVA en transacciones de servicios generan debates sobre el coste de emprender.',
    what_we_know: 'El sistema por ingresos reales establece una escala de cuotas mensuales en función de los rendimientos netos calculados por la Agencia Tributaria. La Tarifa Plana estatal permite a los nuevos autónomos pagar 80€/mes durante el primer año de actividad.',
    what_we_do_not_know: 'La efectividad de la futura exención de presentar declaraciones de IVA para los autónomos con facturaciones inferiores a 85.000€ anuales (directiva de franquicia fiscal).',
    key_facts: [
      'El nuevo sistema RETA consta de 15 tramos de cotización que van desde una cuota mínima de unos 230€ hasta más de 500€.',
      'Los gastos deducibles en el IRPF del autónomo deben estar estrictamente vinculados a la actividad económica y contar con factura.',
      'Las comunidades autónomas tienen la facultad de bonificar al 100% la cuota de autónomos mediante la llamada "Cuota Cero".'
    ],
    main_sources: [
      { name: 'Seguridad Social - Tabla de cotizaciones e Ingresos Reales RETA', url: 'https://www.seg-social.es/' },
      { name: 'Agencia Tributaria - Guía de obligaciones fiscales de empresarios autónomos', url: 'https://sede.agenciatributaria.gob.es/' },
      { name: 'Ley de Reformas Urgentes del Trabajo Autónomo (Ley 6/2017) - BOE', url: 'https://www.boe.es/' }
    ],
    chronology: [
      { date: 'Enero 2023', event: 'Entrada en vigor del Real Decreto-ley 13/2022 del nuevo sistema de cotización por ingresos reales.' },
      { date: 'Enero 2024', event: 'Actualización de las cuotas mínimas y máximas de cotización mensual para los tramos del RETA.' }
    ],
    frequent_confusions: [
      { confusion: 'Todos los autónomos en España tienen que pagar por ley una cuota fija obligatoria de 400€ al mes.', reality: 'Falso. Con el nuevo sistema progresivo de ingresos reales, los autónomos con rendimientos netos inferiores al Salario Mínimo (SMI) cotizan por bases reducidas que dan cuotas mensuales de unos 230€. Además, los nuevos autónomos cuentan con la tarifa plana de 80€ al mes.' },
      { confusion: 'El autónomo societario tributa el doble de impuestos que el autónomo físico.', reality: 'Falso. El autónomo societario tiene una base mínima de cotización superior en el RETA, pero la sociedad tributa por el Impuesto sobre Sociedades (tipo general del 25% o del 15% para nuevas empresas), lo cual es ventajoso para rentas elevadas en comparación con el IRPF progresivo.' },
      { confusion: 'Un autónomo puede deducir la compra de su coche personal y toda la gasolina al 100% en el IRPF.', reality: 'Falso. En el IRPF solo se permite deducir vehículos de uso exclusivo comercial (transportistas, comerciales). Para un turismo común, Hacienda exige acreditar el uso 100% profesional, rechazando deducciones parciales en el IRPF (a diferencia del IVA, donde sí se puede deducir el 50% de oficio).' }
    ],
    quick_replies: 'Las cuotas de autónomos en España varían ahora según sus ingresos netos reales declarados a Hacienda, partiendo de una base mínima para quienes ingresan por debajo del SMI y una tarifa plana de 80€/mes para emprendedores noveles.',
    pending_questions: 'Tratamiento de las cotizaciones en pluriactividad y plazos de regularización fiscal de las diferencias de ingresos.'
  },
  'menores-extranjeros-no-acompanados': {
    what_is_happening: 'El debate en torno a los menores extranjeros no acompañados (MENAS) se enfoca en el reparto territorial de la tutela, la saturación de los recursos asistenciales públicos y los discursos de crispación respecto a la seguridad ciudadana.',
    what_we_know: 'La legislación española y las convenciones internacionales imponen la protección de todo menor en desamparo en territorio nacional de forma incondicional, asumiendo su tutela la fiscalía y los servicios de bienestar de las CCAA. Su internamiento en centros cerrados de seguridad de adultos está terminantemente prohibido salvo por orden penal del juzgado de menores.',
    what_we_do_not_know: 'El volumen de integración laboral final de los jóvenes al cumplir los 18 años por la dispersión autonómica de los datos de seguimiento asistencial.',
    key_facts: [
      'La ley española asume de oficio la tutela y protección del menor por encima de las leyes ordinarias de extranjería.',
      'Las pruebas de determinación de edad se realizan bajo supervisión de la Fiscalía con exámenes médicos de contraste radiológico.',
      'La tasa de delincuencia de los menores tutelados extranjeros se sitúa en ratios similares a las de otros colectivos de alta vulnerabilidad.'
    ],
    main_sources: [
      { name: 'Memorias de la Fiscalía General del Estado (Sección Menores)', url: 'https://www.fiscal.es/' },
      { name: 'Ley Orgánica 1/1996 de Protección Jurídica del Menor - BOE', url: 'https://www.boe.es/' },
      { name: 'Protocolo Marco de Menores Extranjeros No Acompañados (BOE)', url: 'https://www.boe.es/' }
    ],
    chronology: [
      { date: 'Julio 2024', event: 'Las CCAA pactan la distribución voluntaria de un cupo de menores desde Canarias pero sin consenso para el reparto automático.' },
      { date: 'Noviembre 2021', event: 'El Gobierno reforma el Reglamento de Extranjería para facilitar los permisos de residencia y trabajo de jóvenes extutelados.' }
    ],
    frequent_confusions: [
      { confusion: 'El Gobierno regala de forma automática pisos y la nacionalidad a todo menor inmigrante que llega.', reality: 'Falso. La nacionalidad requiere residencia legal ordinaria ininterrumpida y examen de integración. A los menores tutelados únicamente se les documenta un permiso de residencia que no otorga ayudas en metálico directas.' },
      { confusion: 'La policía no puede detener a un menor extranjero si comete delitos graves en la calle.', reality: 'Falso. A partir de los 14 años se aplica la Ley de Responsabilidad Penal de los Menores. La policía procede a su detención habitual y los pone a disposición del Fiscal de Menores, decretándose internamientos cautelares y detenciones en calabozos específicos.' },
      { confusion: 'La mayoría de los delitos menores en España los cometen los menores no acompañados.', reality: 'Falso. Las memorias de la Fiscalía y las estadísticas judiciales del INE ratifican de forma inequívoca que la inmensa mayoría de las infracciones penales (más del 70%) en el territorio nacional son cometidas por adultos de nacionalidad española.' }
    ],
    quick_replies: 'Los menores no acompañados en España están protegidos por el Código Civil como huérfanos o desamparados. A partir de los 14 años son plenamente responsables penalmente ante los juzgados juveniles, no gozando de inmunidad legal.',
    pending_questions: 'Reforma del artículo 35 de la Ley de Extranjería para regular un sistema de reparto nacional vinculante por ley.'
  },
  'impuestos-y-ahorro': {
    what_is_happening: 'El debate fiscal se polariza entre quienes piden bajadas masivas de impuestos para fomentar el ahorro privado y la inversión, y quienes defienden la sostenibilidad de los servicios públicos, las pensiones y la progresividad tributaria.',
    what_we_know: 'El sistema de pensiones en España es un modelo público de reparto (las cotizaciones de los cotizantes actuales sufragan las pensiones en curso). La recaudación fiscal total sobre el PIB (presión fiscal) se sitúa en el entorno del 38%, por debajo de la media de la Eurozona (41%). El IRPF es un impuesto directo de carácter progresivo estatal y autonómico.',
    what_we_do_not_know: 'El efecto neto del gravamen especial a los beneficios extraordinarios de la banca y las energéticas en la inversión corporativa de capital a largo plazo.',
    key_facts: [
      'La Constitución Española prohíbe en su artículo 31 que el sistema tributario tenga alcance confiscatorio.',
      'El Mecanismo de Equidad Intergeneracional (MEI) recauda una aportación adicional en las nóminas para rellenar la hucha de pensiones.',
      'El ahorro personal de los españoles se canaliza principalmente a través de la inversión en propiedad inmobiliaria residencial.'
    ],
    main_sources: [
      { name: 'Eurostat - Recaudación tributaria y Presión Fiscal Comparada', url: 'https://ec.europa.eu/eurostat/' },
      { name: 'Agencia Tributaria - Estadísticas del IRPF e impuestos especiales', url: 'https://sede.agenciatributaria.gob.es/' },
      { name: 'Seguridad Social - Informes trimestrales de ingresos y gastos de cotización', url: 'https://www.seg-social.es/' }
    ],
    chronology: [
      { date: 'Enero 2023', event: 'Entrada en vigor del Mecanismo de Equidad Intergeneracional (MEI) para la sostenibilidad de las pensiones.' },
      { date: 'Año 2024', event: 'El Gobierno actualiza las escalas de retención del IRPF para adaptarlo a la subida de los salarios mínimos.' }
    ],
    frequent_confusions: [
      { confusion: 'España tiene los tipos de IRPF más altos de toda la Unión Europea para la clase media.', reality: 'Falso. Los tipos marginales máximos de España (que se aplican a rentas superiores a 300.000€) rondan el 47%, en la media de la UE y por debajo de países como Dinamarca (56%) o Francia (49%). Las rentas medias tributan por tipos efectivos inferiores al 18%.' },
      { confusion: 'El Estado ha vaciado y quebrado por completo la hucha de las pensiones en 2024.', reality: 'Falso. El Fondo de Reserva de la Seguridad Social (hucha de las pensiones) se ha reabierto y está acumulando recursos a través de la aportación del MEI, superando los 7.000 millones de euros en la actualidad con el objetivo de servir de colchón para el baby boom.' },
      { confusion: 'Las pensiones públicas se pagan de una cuenta de ahorro individual acumulada por el trabajador.', reality: 'Falso. En el sistema de reparto español, las pensiones se financian mediante las cotizaciones sociales mensuales de los trabajadores activos de hoy, no existiendo cuentas de ahorro cerradas individuales asignadas en propiedad al cotizante.' }
    ],
    quick_replies: 'España opera bajo un sistema tributario progresivo y un modelo público de reparto de pensiones. La presión fiscal agregada se sitúa por debajo de la media europea de países avanzados como Francia o Italia.',
    pending_questions: 'Sostenibilidad demográfica del sistema de pensiones de cara a la jubilación masiva de la generación del baby boom.'
  },
  'politica-y-leyes': {
    what_is_happening: 'El debate legal en España se centra en el uso de los Decretos-Leyes por el Ejecutivo, el respeto al principio de separación de poderes, el bloqueo de los órganos de gobierno judicial y la tramitación exprés de leyes orgánicas de alta crispación.',
    what_we_know: 'El Congreso de los Diputados y el Senado ostentan la potestad legislativa. El Decreto-ley es una norma provisional dictada por el Gobierno únicamente para casos de extraordinaria y urgente necesidad, que requiere ser validada por el Congreso en un plazo máximo de 30 días hábiles.',
    what_we_do_not_know: 'El desenlace político de los conflictos de competencias planteados entre la Mesa del Congreso y la del Senado respecto a la tramitación de enmiendas de ley.',
    key_facts: [
      'La validación de un Decreto-ley en el Congreso requiere mayoría simple de los diputados en votación formal.',
      'Las leyes orgánicas regulan los derechos fundamentales y exigen mayoría absoluta del Congreso en votación final.',
      'El Tribunal Constitucional es el intérprete supremo de la Constitución pero no es un órgano ordinario del Poder Judicial.'
    ],
    main_sources: [
      { name: 'Constitución Española de 1978 (BOE)', url: 'https://www.boe.es/' },
      { name: 'Tribunal Constitucional - Sentencias e informes competenciales', url: 'https://www.tribunalconstitucional.es/' },
      { name: 'Reglamento del Congreso de los Diputados - Procedimientos legislativos', url: 'https://www.congreso.es/' }
    ],
    chronology: [
      { date: 'Junio 2024', event: 'Renovación y acuerdo bipartidista del Consejo General del Poder Judicial (CGPJ) tras 5 años de mandato caducado.' },
      { date: 'Diciembre 1978', event: 'Ratificación constitucional de la separación de poderes en España mediante referéndum nacional.' }
    ],
    frequent_confusions: [
      { confusion: 'El Presidente del Gobierno puede aprobar leyes definitivas por decreto-ley a su antojo sin pasar por las Cortes.', reality: 'Falso. El Decreto-ley tiene carácter provisional. El Gobierno debe someterlo obligatoriamente a debate y votación en el Congreso dentro de los 30 días siguientes a su promulgación. Si la cámara baja lo deroga o no lo convalida, la norma queda anulada inmediatamente.' },
      { confusion: 'Las leyes orgánicas pueden ser aprobadas por mayoría simple si el Gobierno pacta con socios minoritarios.', reality: 'Falso. La aprobación, modificación o derogación de las leyes orgánicas (que afectan a derechos fundamentales y libertades públicas) exige obligatoriamente mayoría absoluta en el Congreso de los Diputados (mínimo 176 votos), independientemente de las alianzas políticas.' },
      { confusion: 'El Tribunal Constitucional juzga delitos penales y puede condenar a delincuentes o políticos a ir a prisión.', reality: 'Falso. El TC no forma parte del organigrama de juzgados ordinarios de la Justicia. Sus sentencias deciden únicamente si una ley vulnera la Constitución, o si se ha violado un derecho fundamental en un juicio previo mediante recursos de amparo, careciendo de competencia para instruir causas criminales.' }
    ],
    quick_replies: 'Las leyes en España son tramitadas y decididas en el Parlamento. Las normas excepcionales dictadas por el Gobierno en forma de decretos-leyes deben pasar el visto bueno obligatorio del Congreso de los Diputados en 30 días para no extinguirse.',
    pending_questions: 'Sectores legislativos prioritarios para limitar el uso de la vía de urgencia en el trámite de proyectos de ley ordinaria.'
  },
  'financiacion-autonomica-desigual': {
    what_is_happening: 'El reparto de recursos fiscales entre Comunidades Autónomas suscita un permanente debate en España. Las críticas giran en torno a la infrafinanciación estructural de ciertas regiones (como la Comunidad Valenciana o Murcia) en el régimen común, los privilegios atribuidos a los conciertos forales del País Vasco y Navarra, y el debate de las balanzas fiscales y balanzas de servicios públicos esenciales.',
    what_we_know: 'Sabemos que España cuenta con dos modelos diferenciados constitucionalmente: el Régimen Común (15 CCAA y Ceuta/Melilla, regulado por la LOFCA y gestionado mediante fondos de suficiencia y garantía) y el Régimen Foral (País Vasco y Navarra, que recaudan el 100% de impuestos y pagan un Cupo o Aportación al Estado por las competencias no transferidas). FEDEA y el Ministerio de Hacienda publican datos de financiación por habitante ajustado que muestran que las CCAA de régimen foral disponen de casi el doble de recursos por habitante que la media del régimen común.',
    what_we_do_not_know: 'No está definido un consenso metodológico sobre cómo computar las balanzas fiscales territoriales de forma neutral, ya que el cálculo varía según se use el método de "carga-beneficio" (que asigna el gasto del Estado donde reside el beneficiario) o el de "flujo monetario" (donde se realiza físicamente la inversión).',
    key_facts: [
      'La Comunidad de Madrid y Cataluña son los mayores aportadores netos al Fondo de Garantía de Servicios Públicos Fundamentales.',
      'El modelo de financiación común está caducado desde el año 2014 por falta de acuerdo político bipartidista para su renovación.',
      'La financiación por habitante ajustado del País Vasco duplica la de comunidades infrafinanciadas como la Comunidad Valenciana o Murcia.'
    ],
    main_sources: [
      { name: 'FEDEA - Análisis y Series de Financiación de las Comunidades Autónomas', url: 'http://www.fedea.net/' },
      { name: 'Ministerio de Hacienda - Informes de Balanzas Fiscales y Sistema LOFCA', url: 'https://www.hacienda.gob.es/' },
      { name: 'CGPJ - Ley Orgánica 8/1980 de Financiación de las Comunidades Autónomas (LOFCA)', url: 'https://www.boe.es/' }
    ],
    chronology: [
      { date: 'Año 2009', event: 'Aprobación del actual modelo de financiación del régimen común por el gobierno de Zapatero.' },
      { date: 'Año 2014', event: 'Expiración del período de vigencia de cinco años del sistema de financiación LOFCA sin renovación.' }
    ],
    frequent_confusions: [
      { confusion: 'La Comunidad de Madrid es deficitaria y recibe ayudas del resto de España por sus bajos impuestos.', reality: 'Falso. Madrid es la región que más aporta en términos netos a la caja común de la solidaridad (cerca del 70% del fondo de servicios esenciales), seguida por Cataluña y Baleares, debido a su mayor PIB y recaudación del IRPF.' },
      { confusion: 'Los impuestos que recauda el País Vasco se destinan a financiar los servicios de toda España.', reality: 'Falso. El País Vasco y Navarra operan bajo concierto foral, quedándose con el 100% de la recaudación de sus impuestos y transfiriendo únicamente una cantidad anual (el Cupo vasco y la Aportación navarra) para sufragar gastos del Estado no transferidos (como defensa, asuntos exteriores y la corona).' },
      { confusion: 'La desigualdad del sistema de financiación común se debe a que unas comunidades gastan más de lo debido.', reality: 'Falso. Los informes de FEDEA demuestran que la desigualdad procede de la distribución inicial de recursos del modelo LOFCA de 2009 (criterio del "statu quo"), que beneficia a regiones poco pobladas frente a las de rápido crecimiento demográfico como Valencia.' }
    ],
    quick_replies: 'El sistema de financiación autonómica presenta una brecha entre el régimen común de la LOFCA (con CCAA infrafinanciadas como la valenciana) y el régimen foral, que goza de autonomía tributaria plena y un saldo por habitante que dobla la media común.',
    pending_questions: 'Reforma del sistema LOFCA para garantizar la equidad por habitante ajustado y el encaje de la financiación singular catalana.'
  }
};

