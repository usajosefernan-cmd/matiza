MATIZA funciona así:

```text
1. Detectar qué preocupa hoy en España.
2. Crear o actualizar verticales vivos.
3. Recoger piezas virales dentro de cada vertical.
4. Filtrar por relevancia antes de gastar tokens.
5. Reutilizar caché, fuentes y estrategias ya aprendidas.
6. Solo investigar/redactar lo que supera el umbral.
7. Mandar todo a aprobación rápida humana.
```

Pégale este prompt a Hermes/Antigravity:

```text
# MATIZA — REORGANIZACIÓN DEL MOTOR DINÁMICO
# Objetivo: estabilizar el motor sin romper la web

El problema actual es que el motor piensa desde cero cada vez, gasta tokens en cosas sin importancia y mezcla scraping, clasificación, fuentes, verificación, redacción y publicación.

Quiero que refactorices MATIZA sin rehacer toda la web.

IMPORTANTE:
No crees patrones cerrados basados solo en ejemplos.
No hardcodees una lista fija de temas.
No hagas que el sistema solo detecte los casos que aparecen en este prompt.
El motor debe ser dinámico, semántico y adaptable.

Tampoco quiero que la web se divida primero en secciones clásicas tipo política, internacional o deporte.
MATIZA debe organizarse primero por TEMAS PREOCUPANTES PARA LA SOCIEDAD EN ESPAÑA.

Las categorías clásicas solo son etiquetas secundarias.

==================================================
1. PRIORIDAD ABSOLUTA: CRON DE TEMAS CALIENTES
==================================================

Antes de redactar artículos o buscar bulos sueltos, debe existir un cron principal que detecte cada día qué temas preocupan en España.

Crear un módulo:

scripts/matiza-engine/00-hot-topics-cron.js

Función:
Detectar, agrupar y priorizar los temas sociales calientes del día/semana en España.

Entrada:
- redes sociales públicas disponibles,
- RSS,
- medios,
- buscadores/trends,
- YouTube,
- Telegram público si procede,
- fuentes oficiales,
- items enviados por usuarios,
- histórico interno de MATIZA.

Salida:
Una lista de verticales sugeridos o actualizados.

Cada vertical debe tener:

{
  "topic_id": "",
  "slug": "",
  "title": "",
  "public_concern_summary": "",
  "why_it_matters": "",
  "main_confusions": [],
  "source_map_status": "",
  "priority_score": 0,
  "social_heat_score": 0,
  "risk_score": 0,
  "evergreen_score": 0,
  "needs_new_vertical": true,
  "merge_with_existing_topic": null
}

Regla:
El sistema debe distinguir entre:
- un tema social importante,
- una noticia puntual,
- un rumor menor,
- contenido comercial,
- contenido sin relevancia pública.

No todo lo viral merece artículo.
No todo lo detectado merece gastar tokens.

==================================================
2. MODELO DE WEB: VERTICALES VIVOS + PIEZAS INTERNAS
==================================================

La web debe parecer una web de noticias, pero organizada por verticales vivos.

Un vertical es una cabecera explicativa estable sobre un tema social importante.

Cada vertical debe contener:
- explicación base,
- contexto,
- cronología,
- fuentes principales,
- preguntas frecuentes,
- confusiones habituales,
- últimas piezas publicadas,
- claims relacionados,
- actualizaciones.

Dentro de cada vertical entran piezas/noticias concretas:
- una afirmación viral,
- un vídeo,
- una declaración,
- una captura,
- un dato dudoso,
- una acusación,
- una fuente de confusión.

Flujo:

tema social preocupante
→ vertical vivo
→ piezas concretas dentro
→ actualización continua del vertical

No crear una pieza aislada si ya existe un vertical apropiado.
No crear vertical nuevo si debe fusionarse con uno existente.

==================================================
3. MOTOR DE RELEVANCIA ANTES DE GASTAR TOKENS
==================================================

Crear un módulo:

scripts/matiza-engine/01-relevance-gate.js

Antes de investigar o redactar, todo item debe pasar un filtro de relevancia.

Entrada:
- texto/link/item detectado,
- métricas de viralidad si existen,
- plataforma,
- señales sociales,
- tema sugerido,
- riesgo potencial,
- histórico interno.

Salida:

{
  "should_process": true,
  "reason": "",
  "priority": "alta|media|baja|descartar",
  "public_interest_score": 0,
  "virality_score": 0,
  "harm_score": 0,
  "verification_value_score": 0,
  "commercial_noise_score": 0,
  "recommended_action": "process|queue|ignore|monitor_only"
}

Criterios:
- procesar si hay alta viralidad o alto riesgo social;
- procesar si afecta a mucha gente;
- procesar si puede confundir sobre salud, dinero, derechos, justicia, elecciones, colectivos o seguridad;
- ignorar contenido puramente promocional salvo que sea muy viral o pueda causar daño;
- ignorar contenido irrelevante aunque sea fácil de analizar;
- monitorizar si todavía no hay suficiente viralidad.

No gastar tokens en contenido de baja relevancia.

==================================================
4. RADAR DE USUARIOS
==================================================

Crear un radar público para usuarios:

/radar

El usuario puede pegar:
- enlace,
- texto,
- captura,
- noticia,
- comentario,
- vídeo,
- publicación social.

El sistema NO debe investigarlo todo automáticamente.

Primero debe hacer triage:

1. ¿Es verificable?
2. ¿Tiene interés público?
3. ¿Hay señales de viralidad?
4. ¿Encaja en un vertical existente?
5. ¿Puede causar daño o confusión?
6. ¿Merece gastar tokens?

Resultado para el usuario:
- ya existe explicación,
- está en cola,
- no parece relevante todavía,
- necesita más datos,
- se ha enviado a revisión.

Tabla sugerida:

user_submissions
- id
- submitted_url
- submitted_text
- detected_claim
- suggested_topic_id
- virality_status
- relevance_score
- status
- reason
- created_at

Estados:
- recibido
- descartado_por_baja_relevancia
- monitorizando
- en_cola
- investigando
- publicado
- fusionado_con_vertical_existente

==================================================
5. ROUTER SEMÁNTICO DINÁMICO
==================================================

Crear:

scripts/matiza-engine/02-semantic-router.js

No usar solo keywords.
No crear reglas rígidas.
Debe combinar:

- embeddings o similitud semántica si está disponible,
- histórico de verticales,
- fuente/plataforma,
- intención del contenido,
- tipo de claim,
- categoría secundaria,
- sensibilidad,
- señales de viralidad.

Salida:

{
  "content_type": "",
  "claim_type": "",
  "topic_match": {
    "existing_topic_id": "",
    "confidence": 0,
    "should_merge": true
  },
  "category_tags": [],
  "needs_new_topic": false,
  "routing_reason": ""
}

Regla:
El sistema debe aprender de verticales existentes.
Si un item se parece a un tema ya creado, debe entrar ahí.
Si no existe tema parecido pero se repite o preocupa, debe sugerir nuevo vertical.

==================================================
6. CACHÉ INTELIGENTE
==================================================

Crear una capa de caché semántica.

No quiero que el motor busque las mismas fuentes o piense la misma estrategia cada vez.

Crear tablas o JSON:

topic_cache
- topic_id
- canonical_summary
- trusted_sources_json
- recurring_confusions_json
- known_claims_json
- source_strategy_json
- last_updated

claim_cache
- normalized_claim_hash
- similar_claims_json
- previous_verdict
- previous_sources_json
- previous_article_id
- reuse_allowed
- last_seen

source_strategy_cache
- semantic_area
- source_types_json
- preferred_sources_json
- validation_rules_json
- last_successful_use

Redactar reglas:

Si el claim ya existe o es muy parecido:
- reutilizar veredicto y fuentes,
- actualizar viralidad,
- crear nueva pieza solo si aporta algo nuevo,
- si no aporta nada, añadirlo como nueva aparición del mismo claim.

Si el tema ya tiene fuentes base:
- usar esas fuentes primero,
- no volver a pedir a la IA que invente fuentes.

Si no existe estrategia:
- crear estrategia dinámica,
- guardarla si funciona,
- reutilizarla cuando aparezcan casos semánticamente parecidos.

==================================================
7. ESTRATEGIA DINÁMICA DE FUENTES
==================================================

Crear:

scripts/matiza-engine/03-source-strategy-planner.js

No usar ejemplos cerrados.
No usar una lista fija como única verdad.

El sistema debe decidir qué tipos de fuentes necesita según:

- tipo de claim,
- tema,
- sensibilidad,
- contenido,
- país,
- periodo temporal,
- si es dato, declaración, vídeo, imagen, acusación, promesa política, producto, salud, dinero, justicia o historia.

Salida:

{
  "source_strategy": {
    "required_source_types": [],
    "preferred_authority_level": "",
    "minimum_sources": 0,
    "needs_original_source": true,
    "needs_context_source": true,
    "needs_counter_source": false,
    "manual_check_required": false
  },
  "search_queries": [],
  "reuse_from_cache": true,
  "reason": ""
}

Regla:
El motor debe poder cambiar de fuentes según el contenido concreto.
No todos los vídeos se verifican igual.
No todas las noticias necesitan las mismas fuentes.
No todo contenido comercial merece investigación.
No todo tema político es verificable de la misma forma.

==================================================
8. DETECTOR DE RUIDO Y CONTENIDO NO PRIORITARIO
==================================================

Crear:

scripts/matiza-engine/04-noise-filter.js

Objetivo:
Evitar que MATIZA desperdicie tiempo en contenido sin relevancia pública.

Debe detectar:
- contenido comercial menor,
- reseñas normales,
- productos sin viralidad,
- entretenimiento sin daño,
- noticias locales sin impacto social,
- repeticiones sin novedad,
- contenido que no puede verificarse,
- opinión pura.

Salida:

{
  "is_noise": true,
  "noise_reason": "",
  "keep_monitoring": false,
  "requires_processing": false
}

Regla:
Un contenido de consumo, producto o recomendación solo se procesa si:
- tiene mucha viralidad,
- puede provocar daño económico/sanitario/social,
- oculta incentivos comerciales,
- engaña de forma clara,
- afecta a mucha gente.

==================================================
9. PIPELINE CORRECTO
==================================================

Nuevo flujo del motor:

00-hot-topics-cron
→ 01-relevance-gate
→ 02-semantic-router
→ 03-source-strategy-planner
→ 04-noise-filter
→ 05-claim-extractor
→ 06-evidence-finder
→ 07-verifier
→ 08-article-writer
→ 09-quality-gate
→ 10-review-queue
→ 11-social-writer
→ 12-topic-updater

Cada fase:
- entrada JSON,
- salida JSON,
- log,
- error controlado,
- no modifica fases ajenas.

No meter toda la lógica en ai-pipeline.js.
ai-pipeline.js debe quedar como orquestador o wrapper, no como cerebro entero.

==================================================
10. VERTICAL UPDATER
==================================================

Crear:

scripts/matiza-engine/12-topic-updater.js

Cuando se publica o aprueba una pieza, actualizar el vertical padre.

Actualizar:
- resumen del tema,
- lista de claims,
- cronología,
- confusiones recurrentes,
- fuentes principales,
- últimas piezas,
- preguntas frecuentes.

No reescribir todo el vertical desde cero.
Actualizar secciones concretas.

==================================================
11. APROBACIÓN HUMANA RÁPIDA
==================================================

En admin, añadir aprobación rápida.

El humano no debe revisar letra a letra salvo casos sensibles.
Debe ver:

- claim,
- vertical sugerido,
- veredicto,
- fuentes clave,
- nivel de confianza,
- riesgos,
- formatos sociales,
- checklist.

Botones:
- aprobar web y redes,
- aprobar solo web,
- aprobar solo redes,
- editar rápido,
- pedir más fuentes,
- fusionar con tema existente,
- descartar por baja relevancia,
- bloquear.

Checklist:
- fuente original suficiente,
- veredicto coherente,
- titular neutral,
- no hay acusación sin prueba,
- no hay riesgo legal evidente,
- encaja en el vertical correcto,
- merece publicarse.

==================================================
12. ADMIN DEL MOTOR
==================================================

Crear en /admin una sección:

Motor MATIZA

Debe mostrar cada item con:

- fase actual,
- vertical asignado,
- puntuación de relevancia,
- viralidad,
- riesgo,
- caché usada,
- fuentes usadas,
- warnings,
- errores,
- coste IA estimado,
- acción recomendada.

Debe permitir:
- reejecutar solo una fase,
- cambiar vertical,
- fusionar verticales,
- marcar como ruido,
- forzar investigación,
- aprobar rápido.

Esto es clave:
No quiero que para arreglar una cosa el sistema rehaga todo.
Debe poder reprocesar solo una fase.

==================================================
13. CONTROL DE CAMBIOS
==================================================

Prohibido:
- rehacer todo el proyecto,
- cambiar todo el diseño,
- tocar muchas fases a la vez,
- publicar automáticamente sin revisión,
- crear listas cerradas basadas en ejemplos,
- gastar IA en contenido no relevante,
- borrar caché sin motivo.

Cada cambio debe tocar solo una fase.

Después de cada cambio:
- npm run build
- explicar archivos tocados
- explicar qué fase cambió
- explicar qué se mantiene intacto.

==================================================
14. ORDEN DE IMPLEMENTACIÓN
==================================================

Loop 1:
Crear estructura del motor dinámico:
- config/
- scripts/matiza-engine/
- JSON contracts
- logs
- wrapper de pipeline.

Loop 2:
Crear cron de temas calientes y modelo de verticales.

Loop 3:
Crear relevance-gate, noise-filter y semantic-router.

Loop 4:
Crear caché semántica y source-strategy-cache.

Loop 5:
Crear source-strategy-planner dinámico.

Loop 6:
Conectar con claim-extractor, verifier, writer y quality-gate.

Loop 7:
Añadir admin del motor y aprobación rápida.

Loop 8:
Build, tests/manual checks y README técnico.

==================================================
15. RESULTADO ESPERADO
==================================================

MATIZA debe pasar de:

"scraper + IA que redacta cosas"

a:

"radar social inteligente + verticales vivos + verificación con fuentes + publicación rápida con aprobación humana".

La IA no debe decidir todo desde cero.
El sistema debe:
- detectar qué preocupa,
- filtrar qué merece atención,
- reutilizar caché,
- adaptar fuentes dinámicamente,
- evitar ruido,
- priorizar impacto social,
- crear verticales vivos,
- publicar piezas dentro de esos verticales,
- permitir aprobación rápida humana.
```

La frase que tienes que repetirle a Hermes es esta:

```text
No quiero patrones cerrados. Quiero un router dinámico con caché semántica: si algo se repite, reutiliza estrategia; si es nuevo, planifica fuentes; si no tiene relevancia social, no gasta tokens.
```

Y para tu caso concreto: **la secadora no entra**, salvo que sea viral, engañosa o peligrosa. Una recomendación comercial normal no es misión de Matiza. Pero una afirmación viral que puede engañar a mucha gente sí entra, aunque no sea política.

-----

En España la desconfianza en noticias online es alta, el consumo informativo se mueve mucho por vídeo/redes, y los jóvenes llegan a la actualidad por TikTok, Instagram, YouTube y creadores, no por portadas tradicionales. En España, según el informe Reuters citado por El País, el 74% duda de la veracidad de las noticias en internet, el 42% accede a noticias por redes y el vídeo informativo llega al 75% de usuarios digitales.

1. Verticales principales que debería tener Matiza

Estos no son “patrones cerrados”; son familias dinámicas iniciales. El motor debe descubrir nuevos verticales cuando vea repetición, viralidad y preocupación social.

Vertical    Qué debe cubrir    Fuentes base
Vivienda y vida imposible    alquiler, compra, fondos, okupación, alquiler turístico, jóvenes, sueldos vs vivienda    INE, Banco de España, MITMA, BOE, Eurostat, Idealista/Fotocasa como fuentes de mercado secundarias
Inmigración, MENAS y convivencia    criminalidad, ayudas, empleo, religión, integración, fronteras, bulos contra colectivos    INE, Ministerio del Interior, Fiscalía, Eurostat, Seguridad Social, Defensor del Pueblo
Economía real de España    “España se hunde”, paro, deuda, inflación, salarios, productividad, impuestos    INE, Banco de España, AIReF, Eurostat, SEPE, Seguridad Social, OCDE
Seguridad, delincuencia y ciberestafas    criminalidad, barrios, bandas, delitos sexuales, cibercrimen, estafas    Ministerio del Interior, Fiscalía, CGPJ, INE, Europol
Sanidad pública y listas de espera    esperas, privatización, médicos, urgencias, gasto por CCAA, medicamentos    Ministerio de Sanidad, CIS/Barómetro Sanitario, consejerías, BOE, AEMPS
Historia y memoria    franquismo, República, ETA, guerra civil, Seguridad Social, nostalgia histórica    BOE histórico, BNE, archivos oficiales, universidades, INE histórico, Congreso
Programas políticos y hechos    qué prometen partidos, qué votan, qué cumplen, qué contradicen    programas oficiales, Congreso, Senado, BOE, presupuestos, portales de transparencia
Corrupción y transparencia    contratos, patrimonio, familiares, subvenciones, financiación, puertas giratorias    BOE, Plataforma de Contratación, Tribunal de Cuentas, Congreso/Senado, portales autonómicos
Justicia y acusaciones públicas    imputado/investigado/condenado, denuncias, autos, bulos judiciales    CGPJ, Fiscalía, Tribunal Constitucional, sentencias, autos, comunicados oficiales
Cataluña, independentismo y convivencia territorial    amnistía, financiación, lengua, ETA/Cataluña cuando se mezcle, competencias    BOE, Congreso, Generalitat, Tribunal Constitucional, CIS/CEO
Clima, agua y energía    sequía, incendios, nucleares, renovables, precio luz, bulos climáticos    AEMET, MITECO, Red Eléctrica, OMIE, Eurostat, IPCC
Consumo, salud y promociones virales    productos milagro, suplementos, afiliados, cosmética, “mejor del mundo”, inversión/estafas    AESAN, AEMPS, EFSA, CNMC, Consumo, OCU/Facua como secundarias, estudios científicos

La selección debe seguir una lógica parecida a los verificadores profesionales: elegir contenidos difundidos, de interés general y con posible daño para la opinión pública; EFE Verifica, por ejemplo, estructura su método en selección, verificación, evaluación/revisión y publicación, y empieza por contenidos difundidos que pueden afectar a salud, educación, política u opinión pública.

2. Criterio inteligente: qué entra y qué no entra

Matiza necesita un score de interés público antes de gastar tokens.

MATIZA_SCORE = 
30% viralidad
25% daño potencial
20% interés público
15% verificabilidad
10% valor educativo

- ruido comercial
- repetición sin novedad

Procesar si:

afecta a muchas personas;
puede cambiar voto, consumo, salud, convivencia o percepción social;
tiene viralidad real;
tiene fuente verificable;
se repite en varias redes;
encaja en un vertical vivo.

No procesar si:

es una reseña irrelevante;
es opinión pura;
no tiene viralidad;
no afecta a salud, dinero, derechos, seguridad o convivencia;
no se puede verificar mínimamente.

Una secadora normal no entra. Una promoción viral de un producto dental, suplemento, crema o inversión con 200.000 visitas y posible engaño sí entra.

3. Patrones dinámicos a buscar en redes

No le des a Hermes una lista cerrada. Dale familias de señales:

Familia de señal    Qué detecta    Pregunta que debe hacerse
Afirmación absoluta    “todos”, “siempre”, “nunca”, “el único”, “el mejor”    ¿Hay datos que respalden una afirmación tan fuerte?
Culpa colectiva    un grupo social/religioso/nacional como causa de un problema    ¿Se confunde caso aislado con tendencia?
Dato sin denominador    “subió un 200%”, “hay miles”    ¿Sobre qué base? ¿Total, tasa, periodo, población?
Vídeo/foto sin contexto    clip recortado, fecha falsa, país falso    ¿Cuál es el original? ¿Cuándo y dónde ocurrió?
Promoción disfrazada    recomendación con afiliado, patrocinio oculto    ¿Hay incentivo económico? ¿Está declarado?
Producto milagro    cura, adelgaza, blanquea, rejuvenece, mejora rendimiento    ¿Está autorizado? ¿Tiene evidencia? ¿Promete efectos sanitarios?
Manipulación política    frase de programa, voto o promesa sacada de contexto    ¿Qué dice el documento original? ¿Qué se votó realmente?
Acusación personal    delito, agresión, corrupción, abuso    ¿Hay denuncia, auto, sentencia, vídeo completo o fuente primaria?
Nostalgia histórica    “antes se vivía mejor”, “X creó todo”    ¿Qué indicadores faltan? ¿Libertades, salarios, sanidad, vivienda, represión?
Pánico moral    menores, inmigrantes, religión, okupación, seguridad    ¿Hay datos oficiales o solo casos virales?

La idea técnica buena es: detectar patrón → buscar vertical parecido → usar caché → planificar fuentes → verificar → redactar → aprobar rápido. Reuters Tracer es una referencia útil porque no dependía solo de temas predefinidos: detectaba conversaciones emergentes, las clasificaba y estimaba noticiabilidad, veracidad, novedad y alcance.

4. Fuentes y preguntas por vertical
   Inmigración / MENAS / convivencia

Preguntas:

¿El claim habla de población total, extranjeros, nacidos fuera o nacionalidad?
¿Es tasa por habitante o número bruto?
¿Se compara con españoles, con otros grupos o con años anteriores?
¿Hay denuncia policial, sentencia o solo vídeo viral?
¿Se mezcla inmigración regular, irregular, religión y nacionalidad?

Fuentes: INE, Ministerio del Interior, Fiscalía, CGPJ, Eurostat, Seguridad Social.

Economía real

Preguntas:

¿El dato es PIB, PIB per cápita, deuda, déficit, salarios, paro o inflación?
¿Se compara con UE, con año anterior o con una etapa concreta?
¿Se usa dato nominal o real?
¿Se ocultan vivienda, productividad o salarios?

Fuentes: INE, Banco de España, Eurostat, AIReF, SEPE, Seguridad Social.

Vivienda

Preguntas:

¿Habla de alquiler o compra?
¿Se usa precio medio o esfuerzo salarial?
¿Hay diferencia por ciudad/CCAA?
¿Se mezcla okupación con impago o alquiler turístico?
¿Qué propone cada partido y qué se aprobó?

Fuentes: Banco de España, INE, MITMA, BOE, comunidades autónomas. El problema de vivienda debe ser vertical fuerte: se ha convertido en uno de los debates estructurales de España, con informes y estimaciones de déficit habitacional muy citadas en el debate público.

Justicia / corrupción / acusaciones

Preguntas:

¿Hay sentencia, auto, denuncia, investigación o solo acusación?
¿Se dice “condenado” cuando solo está “investigado”?
¿La fuente es judicial o mediática?
¿Hay derecho de réplica?
¿Es necesario revisión humana obligatoria?

Fuentes: CGPJ, Fiscalía, Tribunal Constitucional, BOE, Congreso/Senado, portales de transparencia.

Historia / franquismo / ETA / memoria

Preguntas:

¿La afirmación simplifica un periodo largo?
¿Se compara libertad política con indicadores económicos?
¿Hay fuente original o solo memes?
¿Se atribuye a una persona algo que era proceso histórico?
¿Hay consenso académico o debate abierto?

Fuentes: BOE histórico, BNE, INE histórico, archivos, universidades, libros académicos.

Programas políticos

Preguntas:

¿Qué dice literalmente el programa?
¿Qué significa en lenguaje claro?
¿Qué votó luego?
¿Gobernó y pudo hacerlo?
¿No cumplió por decisión propia o por falta de mayoría?
¿A quién beneficia/perjudica?

Fuentes: programas oficiales, BOE, Congreso, Senado, presupuestos, Tribunal de Cuentas, portales de transparencia.

5. Apartado especial: consumo y verificación comercial

Este apartado puede atraer mucho público joven porque conecta con TikTok, YouTube e Instagram. No debe verificar cualquier producto: solo los que tengan viralidad + posible daño económico, sanitario o social.

Subverticales de consumo
Subvertical    Qué verificar
Publicidad encubierta    afiliados, patrocinio oculto, “opinión sincera” pagada
Salud y productos milagro    suplementos, cremas, blanqueadores, adelgazantes, colágeno, detox
Tecnología y gadgets    claims exagerados, dropshipping, falsas reviews
Finanzas personales    cursos, trading, crypto, apuestas, ingresos fáciles
Belleza y estética    cosmética con promesas médicas, antes/después dudosos
Alimentación    “sin azúcar”, “natural”, “premium”, “quema grasa”, “antiinflamatorio”
Infancia/adolescentes    productos dirigidos a menores, manipulación de urgencia o estatus

Preguntas obligatorias:

¿Hay enlace de afiliado o descuento personal?
¿Se declara publicidad de forma visible?
¿La promesa es medible?
¿Promete beneficios de salud?
¿Hay evidencia independiente?
¿Hay alertas de AEMPS/AESAN/EFSA?
¿Se ocultan riesgos, costes, letra pequeña o suscripción?
¿Hay urgencia artificial: “solo hoy”, “últimas unidades”, “secreto”?

Esto es importante porque la publicidad encubierta en influencers ya está bajo lupa regulatoria. La CNMC ha requerido a influencers por no identificar correctamente comunicaciones comerciales, y se ha señalado que hashtags como “ad” o “#publi” mal ubicados pueden no ser suficientes para que el usuario entienda claramente que es publicidad. Además, los estudios sobre marketing de afiliados encuentran que muchas publicaciones no contienen revelaciones claras o entendibles para el usuario, lo que encaja con un módulo automático de detección de afiliados y publicidad encubierta.

6. Cómo debe verse visualmente el portal
   Home

La home debe parecer medio digital, pero con radar:

[Hero]
Hoy preocupa en España:

1. Vivienda
2. Inmigración y seguridad
3. Economía real
4. Corrupción
5. Salud/consumo viral

[Buscador grande]
Pega un enlace, vídeo, tweet, noticia o frase.

[Temas vivos]
Tarjetas grandes con:

- título
- resumen
- nivel de ruido
- últimas piezas
- fuentes principales

[Últimas verificaciones]
Formato noticia.

[Consumo bajo lupa]
Promociones virales verificadas.

[Programas políticos]
Qué promete cada partido / qué hizo.
Página vertical

Cada vertical debe tener siempre el mismo formato:

Cabecera visual:

- Título del tema
- Resumen claro
- Veredicto general si existe
- Nivel de ruido social
- Última actualización

Bloques:

1. Qué está pasando
2. Qué sabemos
3. Qué no sabemos
4. Datos clave
5. Fuentes principales
6. Cronología
7. Confusiones frecuentes
8. Noticias/piezas dentro del tema
9. Respuestas rápidas para redes
10. Preguntas pendientes
    Página de pieza/noticia
    [Veredicto]
    Falso / Engañoso / Falta contexto / Sin pruebas

[Claim]
Qué se está diciendo.

[Origen]
Dónde apareció y viralidad.

[Resumen en 30 segundos]
5 líneas.

[Explicación clara]
Sin tecnicismos.

[Qué es cierto]
[Qué es falso]
[Qué falta contexto]
[Qué no está probado]

[Fuentes originales]
Con prioridad visual.

[Cómo responder en redes]
Texto corto.

La estética debe ser constante: misma estructura en política, historia, consumo o salud. Eso evita que el usuario se pierda.

7. Sistema para atraer jóvenes

No lo llamaría “juego” puro. Lo haría con calificación visual + reto de pensamiento crítico.

Sistema de etiquetas
🔥 Caliente
🧊 Falta contexto
🧪 Necesita pruebas
🎭 Manipulación emocional
📉 Dato tramposo
🎬 Vídeo fuera de contexto
💸 Promo encubierta
⚖️ Revisión legal
🧠 Aprende el truco
Termómetro Matiza
0-20: ruido bajo
21-40: dudoso
41-60: confuso
61-80: viral y preocupante
81-100: prioridad alta
“Truco usado”

Cada pieza debe enseñar la técnica de manipulación, no solo desmentir. Por ejemplo:

cherry-picking,
falso dilema,
culpa colectiva,
dato sin base,
vídeo recortado,
autoridad falsa,
miedo/urgencia,
promoción encubierta.

Esto conecta con el prebunking: enseñar técnicas antes de que el usuario vea el siguiente bulo. Google/Jigsaw ha usado vídeos cortos de prebunking sobre técnicas como descontextualización, chivos expiatorios o exageración; campañas previas encontraron mejoras en la capacidad de detectar técnicas manipuladoras. También hay evidencia de intervenciones gamificadas como Bad News, donde el usuario aprende tácticas de desinformación desde dentro para volverse más resistente.

8. Motor recomendado
   00-hot-topics-cron
   Detecta qué preocupa hoy en España.

01-relevance-gate
Decide si merece tokens.

02-semantic-router
Asigna a vertical existente o sugiere nuevo.

03-cache-check
Busca claims parecidos, fuentes ya usadas, estrategia previa.

04-source-strategy-planner
Decide fuentes necesarias según el caso.

05-claim-extractor
Extrae afirmación verificable.

06-evidence-finder
Busca fuentes originales.

07-verifier
Compara claim vs fuentes.

08-article-writer
Redacta pieza.

09-quality-gate
Bloquea incoherencias.

10-human-fast-review
Aprobación rápida.

11-social-writer
Genera X, carrusel, TikTok, respuesta corta.

12-topic-updater
Actualiza vertical.

Regla clave para Hermes:

No crear patrones cerrados. Crear familias dinámicas de señales, verticales vivos y caché semántica. El sistema debe descubrir nuevos temas calientes, reutilizar estrategias cuando algo se repite y descartar ruido aunque sea fácil de procesar.
9. Los primeros verticales que yo montaría

Para MVP:

Vivienda en España
Inmigración, MENAS y criminalidad
Economía española: ¿va bien o mal?
Franquismo y nostalgia histórica
Corrupción y promesas políticas
Sanidad pública
Justicia: investigado, imputado, condenado
Consumo viral: promos, salud y productos milagro
Ciberestafas y dinero fácil
Cataluña, independencia y memoria de ETA

Con esos 10 verticales ya cubres la mayoría de discusiones calientes, y dentro puedes meter piezas concretas sin crear caos.

Mi recomendación final: Matiza debe venderse como “el radar de lo que te intentan colar”, no como “fact-checking tradicional”. La diferencia visual y juvenil está en enseñar el truco, mostrar fuentes originales y dar una respuesta corta para redes.

ADIMINISTRAR LA WEB-

Ah, vale. Entonces la arquitectura correcta cambia bastante:

**Antigravity construye y prueba.**  
**Hermes solo ejecuta crons/scripts ya hechos.**  
**El admin no programa; el admin controla.**

Dicho claro:

```text
Antigravity = desarrollador
Hermes = operador automático
Admin = panel de mando humano
Web pública = lo que ve la gente
Scripts/crons = motor que trabaja solo
```

Entonces se gestiona así:

## 1. Antigravity deja todo preparado

Antigravity debe crear:

```text
/scripts/matiza-engine/
  00-hot-topics-cron.js
  01-relevance-gate.js
  02-semantic-router.js
  03-cache-check.js
  04-source-strategy-planner.js
  05-claim-extractor.js
  06-evidence-finder.js
  07-verifier.js
  08-article-writer.js
  09-quality-gate.js
  10-review-queue.js
  11-social-writer.js
  12-topic-updater.js
  run-daily.js
  run-hourly.js
  run-manual-item.js
```

Y debe probarlos con:

```text
npm run build
npm run test
node scripts/matiza-engine/run-daily.js --dry-run
node scripts/matiza-engine/run-manual-item.js --dry-run
```

Hermes **no inventa lógica**. Solo ejecuta:

```text
Cada día:
node scripts/matiza-engine/run-daily.js

Cada hora:
node scripts/matiza-engine/run-hourly.js

Cuando llega un link manual:
node scripts/matiza-engine/run-manual-item.js --itemId=123
```

## 2. El admin no debe romper nada

El admin solo debe modificar datos/configuración, no código.

El admin sirve para:

```text
/admin/radar
Ver temas calientes detectados.

/admin/cola
Aprobar rápido borradores.

/admin/verticales
Crear, editar o fusionar temas vivos.

/admin/fuentes
Gestionar fuentes fiables y estrategias.

/admin/motor
Ver qué fase falló.

/admin/redes
Aprobar posts para redes.

/admin/politica
Programas, promesas, bienes declarados.
```

Pero el admin **no debe tener la lógica dentro**.

El admin llama a APIs como:

```text
/api/admin/approve-item
/api/admin/reject-item
/api/admin/reprocess-item
/api/admin/change-topic
/api/admin/update-source-strategy
/api/admin/run-manual-check
```

Y esas APIs solo lanzan scripts ya hechos o cambian estados en base de datos.

## 3. Flujo correcto

Ejemplo: alguien pega un enlace en el radar.

```text
Usuario pega enlace
↓
Admin/API guarda user_submission
↓
Hermes ejecuta run-manual-item.js
↓
El motor calcula relevancia
↓
Si no interesa: monitorizando o descartado
↓
Si interesa: busca vertical, fuentes, verifica, redacta
↓
Lo deja en cola
↓
Humano aprueba rápido
↓
Se publica web/redes
```

La aprobación humana no es revisar letra a letra. Es checklist:

```text
- ¿Fuente correcta?
- ¿Veredicto coherente?
- ¿Titular neutral?
- ¿Encaja en vertical?
- ¿Riesgo legal?
- ¿Publicar sí/no?
```

## 4. Prompt corregido para Antigravity

Pégale esto:

```text
ARQUITECTURA REAL MATIZA

Aclaración importante:
Hermes NO desarrolla código.
Hermes solo ejecuta crons/scripts que Antigravity deje creados, probados y documentados.

Por tanto:
- Antigravity construye.
- Antigravity prueba.
- Antigravity deja scripts ejecutables.
- Hermes solo ejecuta esos scripts por cron.
- El admin solo controla datos, estados y aprobación humana.

No metas lógica compleja dentro del admin.
No hagas que Hermes tenga que improvisar.
No hagas scripts gigantes imposibles de mantener.

Estructura obligatoria:

/scripts/matiza-engine/
  00-hot-topics-cron.js
  01-relevance-gate.js
  02-semantic-router.js
  03-cache-check.js
  04-source-strategy-planner.js
  05-claim-extractor.js
  06-evidence-finder.js
  07-verifier.js
  08-article-writer.js
  09-quality-gate.js
  10-review-queue.js
  11-social-writer.js
  12-topic-updater.js
  run-daily.js
  run-hourly.js
  run-manual-item.js

/config/
  editorial-policy.json
  source-catalog.json
  relevance-thresholds.json
  topic-rules.json
  social-templates.json

El script ai-pipeline.js actual debe quedar como wrapper o ser reemplazado poco a poco.
No debe contener toda la inteligencia mezclada.

Cada script debe:
- recibir entrada clara,
- devolver salida JSON,
- guardar logs,
- no publicar directamente,
- dejar borradores en cola,
- fallar sin romper el resto.

Hermes ejecutará:

node scripts/matiza-engine/run-daily.js
node scripts/matiza-engine/run-hourly.js
node scripts/matiza-engine/run-manual-item.js --itemId=ID

Crear admin:

/admin/radar
/admin/cola
/admin/verticales
/admin/fuentes
/admin/motor
/admin/redes
/admin/politica

El admin debe permitir:
- ver temas calientes,
- aprobar rápido,
- pedir más fuentes,
- cambiar vertical,
- reprocesar solo una fase,
- descartar ruido,
- publicar web,
- aprobar redes.

APIs necesarias:

/api/admin/approve-item
/api/admin/reject-item
/api/admin/reprocess-phase
/api/admin/change-topic
/api/admin/update-source-strategy
/api/admin/run-manual-check

Reglas:
- No publicar automático sin aprobación.
- No tocar web pública al cambiar motor.
- No tocar motor al cambiar admin visual.
- No rehacer todo.
- Cada cambio debe tocar una zona concreta.
- Después de cada cambio ejecutar npm run build.
- Dejar README explicando qué cron ejecuta Hermes y qué hace cada script.

Primera tarea:
Crear estructura segura de scripts y admin sin cambiar diseño público.
Después migrar el motor actual por fases.
```

La frase clave es:

**“Antigravity programa el sistema; Hermes solo lo ejecuta. El admin no contiene inteligencia, solo controla estados y aprobación.”**

Así evitas que cada cambio del IDE sea una demolición controlada… pero sin la parte de “controlada”.

--

## Matiza JudicialCheck

**Una capa especial para noticias judiciales donde ninguna resolución, denuncia, titular o acusación se trata como verdad cerrada hasta analizar fase, pruebas, firmeza, recursos y contexto.**

La frase base sería:

```text
Una resolución judicial es una fuente institucional importante, pero no una verdad automática.
Matiza analiza: documento, fase, pruebas, firmeza, contradicciones, recursos y contexto.
```

Eso encaja perfecto con Matiza porque la web quiere quitar bulos sin ser ingenua.

---

## 1. Idea editorial

Matiza debe tener esta regla:

```text
No damos por bueno automáticamente lo que dice:
- un político,
- un medio,
- una red social,
- una acusación,
- un juez,
- una filtración,
- una sentencia no firme.

Miramos qué está probado, qué está alegado, qué está en disputa y qué falta.
```

Eso es neutralidad fuerte. No es “anti justicia”. Es **verificación judicial responsable**.

---

## 2. Cómo se ve en la web

Cada noticia judicial tendría un bloque fijo:

```text
⚖️ Estado judicial del caso

Fase: Investigación / Sentencia no firme / Recurso pendiente
¿Hay condena firme?: Sí / No
¿Hay documento original?: Sí / No
Fuente principal: Auto / Sentencia / Fiscalía / Prensa / Filtración
Nivel de cautela: Bajo / Medio / Alto / Máximo

Qué está probado:
...

Qué solo son indicios:
...

Qué dice la acusación:
...

Qué dice la defensa:
...

Qué dice Fiscalía:
...

Qué dice el juez/tribunal:
...

Qué falta para afirmarlo con seguridad:
...
```

Y visualmente:

```text
Pruebas sólidas          ████░
Indicios                 ███░░
Contradicciones          ██░░░
Firmeza judicial         ██░░░
Riesgo de manipulación   ████░
```

Esto para jóvenes funciona muy bien porque no les sueltas un ladrillo legal: les das una **tarjeta clara de estado del caso**.

---

## 3. Veredictos especiales judiciales

No usar solo verdadero/falso. Para justicia usar:

```text
✅ Confirmado documentalmente
🟡 Hay indicios, falta prueba concluyente
🟠 Judicializado, no probado definitivamente
⚖️ Caso judicial controvertido
🧊 Sentencia no firme
🔴 Titular engañoso
⚫ Acusación presentada como hecho
❓ No verificable todavía
```

Ejemplo:

```text
“La mujer del presidente está condenada”
→ 🔴 Falso, si no hay condena.

“Está investigada”
→ ✅ Correcto, si existe resolución.

“Está demostrado que cometió X”
→ 🟠 Judicializado, no probado definitivamente, si solo hay indicios.

“El juez dice X”
→ ✅ Correcto como cita judicial, pero no equivale a hecho probado firme.
```

---

## 4. Motor interno

Crear un módulo:

```text
JudicialCheck Engine
```

Dentro del motor Matiza:

```text
judicial-detector
Detecta si una noticia es judicial.

procedural-stage-classifier
Clasifica fase: denuncia, investigado, juicio, sentencia no firme, sentencia firme, recurso, archivo.

judicial-source-checker
Comprueba si hay documento original.

evidence-ledger
Separa pruebas, indicios, testimonios, informes, inferencias y filtraciones.

judicial-context-analyzer
Añade contexto institucional: CGPJ, nombramientos, bloqueo, recursos, votos particulares, críticas europeas.

judicial-quality-gate
Bloquea titulares que confunden acusación con hecho probado.

judicial-public-card
Genera la tarjeta visual para el lector.
```

---

## 5. Datos que debe guardar cada caso

```text
judicial_cases
- id
- article_id
- case_name
- court
- judge_or_panel
- procedural_stage
- has_original_document
- document_type
- is_final_judgment
- appeal_status
- prosecution_position
- defense_position
- court_position
- proven_facts_json
- alleged_facts_json
- disputed_facts_json
- evidence_json
- missing_documents_json
- caution_level
- legal_risk
- human_review_required
```

Y en cada claim:

```text
judicial_claims
- claim_text
- claim_type
- proof_level
- source_type
- can_be_stated_as_fact
- safer_wording
```

Ejemplo:

```text
Claim:
“X cometió prevaricación”

can_be_stated_as_fact:
false

safer_wording:
“X ha sido acusado/investigado/condenado en sentencia no firme por...”
```

---

## 6. Admin judicial

En el admin, cuando entre un caso judicial, debe aparecer:

```text
MODO JUDICIAL ACTIVADO
```

Checklist rápido:

```text
- ¿Hay documento judicial original?
- ¿Es sentencia firme?
- ¿Hay recurso?
- ¿La Fiscalía discrepa?
- ¿Hay acusación popular?
- ¿Hay prueba directa o solo indicios?
- ¿La noticia confunde investigado con condenado?
- ¿Hay riesgo de difamación?
- ¿Hace falta segunda revisión humana?
```

Botones:

```text
Pedir documento original
Marcar como acusación no probada
Marcar como sentencia no firme
Marcar como falta contexto judicial
Aprobar con cautela
Bloquear
```

---

## 7. Contexto institucional sin sesgo

Aquí está la parte fina.

La web puede explicar:

```text
En España, los jueces de carrera no los elige directamente el Gobierno.
Pero los órganos de gobierno judicial y ciertos altos nombramientos tienen participación parlamentaria/institucional.
Por eso, en casos muy politizados, Matiza analiza también contexto institucional, recursos, composición, votos particulares y críticas de organismos independientes.
```

Eso es mucho más sólido que decir:

```text
“La justicia está comprada por X.”
```

Matiza debe decir:

```text
Este caso requiere cautela porque:
- no hay sentencia firme,
- hay recurso,
- Fiscalía discrepa,
- las pruebas son indiciarias,
- hay contexto político,
- la resolución está siendo discutida por juristas o instancias superiores.
```

---

## 8. Cómo titular sin manipular

El motor debe prohibir titulares tipo:

```text
“X es culpable”
“X robó”
“X cometió delito”
```

si no hay sentencia firme.

Debe sugerir:

```text
“Qué se sabe y qué no se sabe del caso X”
“Por qué este caso judicial aún no permite afirmar X”
“Investigado no significa condenado: claves del caso X”
“Qué dice el auto, qué dice Fiscalía y qué falta probar”
```

---

## 9. Lema interno

```text
Resolución judicial ≠ verdad automática.
Prueba + fase + firmeza + contexto = verificación responsable.
```

Y lema público:

```text
Matiza no juzga por titulares. Mira las pruebas.
```

---

## 10. Cómo se integra en Matiza

Dentro de los verticales:

```text
/tema/justicia-y-politica
/tema/corrupcion
/tema/casos-judiciales-mediaticos
/tema/cgpj-y-justicia
```

Y cada pieza judicial queda dentro de su tema.

Ejemplo:

```text
Tema: Justicia y política

Cabecera:
- cómo funciona el sistema judicial,
- qué es CGPJ,
- qué es Fiscalía,
- qué es sentencia firme,
- qué significa investigado,
- qué riesgos hay en titulares judiciales.

Piezas dentro:
- caso concreto 1,
- caso concreto 2,
- titular manipulado,
- sentencia no firme,
- investigación archivada,
- acusación sin pruebas.
```

---

## La idea final

**Matiza debe tener una capa judicial propia, igual que tendría una capa médica o de consumo.**

Porque justicia es zona de alto riesgo informativo.

Ahí la IA no puede funcionar como redactor normal. Tiene que funcionar como:

```text
analista de fase procesal
+ auditor de pruebas
+ detector de titulares engañosos
+ traductor legal a lenguaje claro
+ filtro de cautela
+ revisión humana obligatoria
```

Esta es la versión fuerte:

```text
JudicialCheck Engine convierte cada noticia judicial en una ficha clara:
qué se afirma, qué está probado, qué solo son indicios, qué dice cada parte, si hay sentencia firme y qué puede decirse sin manipular.
```

Eso haría a Matiza muy distinto a un fact-checker normal. Sería una web que no solo desmiente bulos, sino que enseña a leer justicia, política y medios sin tragarse titulares.

## Matiza — Mapa Judicial y Corrupción

Una sección dentro de Matiza que muestre, caso por caso:

```
Quién está implicadoDe qué partido o entorno políticoQué se investigaCuándo empezóCuánto tardaEn qué fase estáQué pruebas hayQué delitos se imputanQué pide FiscalíaQué pide la acusaciónQué decide el juezQué condena hubo, si la huboSi la sentencia es firme o recurribleCómo se compara con casos parecidos
```

Esto es defendible porque el propio CGPJ tiene un **repositorio de procesos por corrupción**, actualizado trimestralmente, con datos sobre procedimientos penales por delitos relacionados con corrupción, sentencias firmes y población reclusa por esos delitos.  
Y también tiene una página de **estimación de tiempos medios de duración de procedimientos judiciales**, expresados en meses y comparables por órgano, jurisdicción, año, materia y territorio.

La clave: **convertir sospechas en métricas**.

No decir:

> “Este caso se retrasa por interés político.”

Decir:

> “Este caso lleva X meses desde la denuncia, X meses desde la admisión, X meses sin juicio, y está por encima/debajo de la media comparable.”

Eso es mucho más fuerte.

---

## 1. Sección pública

Yo la llamaría:

```
/justicia-en-datos
```

O más potente:

```
/mapa-judicial/corrupcion-en-datos/judicialcheck
```

Dentro:

```
1. Casos judiciales activos2. Casos de corrupción por partido3. Cronología de cada caso4. Comparador de tiempos5. Comparador de penas6. Fiscalía vs juez vs acusación7. Sentencias firmes8. Sentencias recurribles9. Casos archivados10. Casos pendientes antes/después de elecciones
```

---

## 2. Lo más importante: comparador de tiempos

Cada caso debería tener una barra visual:

```
Denuncia     Investigación     Juicio oral     Sentencia     Recurso     Firmeza   |--------------|----------------|-------------|----------|---------|  fecha          fecha            fecha         fecha        fecha
```

Y debajo:

```
Duración total: 28 mesesMedia comparable: 16 mesesDiferencia: +12 mesesEstado: más lento que casos parecidos
```

Para esto usarías:

- datos del CGPJ sobre duración media,
- fechas reales del caso,
- tipo de procedimiento,
- órgano judicial,
- complejidad,
- número de investigados,
- recursos,
- diligencias pendientes.

---

## 3. Comparador de condenas

Esto sería brutal, pero delicado.

No puedes comparar “a este le caen 2 años y a este 30” sin más. Hay que normalizar.

Campos:

```
Delito exactoNúmero de delitosCantidad económicaCargo público o noConcurso de delitosAtenuantesAgravantesReparación del dañoColaboraciónSentencia firme o noTribunalAño
```

Y luego mostrar:

```
Pena impuesta: XRango legal: Y-ZCasos comparables: A, B, CSeveridad relativa: normal / alta / baja / no comparable
```

---

## 4. Base de datos

Tablas nuevas:

```
judicial_cases- id- slug- title- summary- political_area- party_related- persons_json- court- judge_or_panel- prosecutor_position- accusation_position- defense_position- procedural_stage- start_date- investigation_start_date- trial_date- sentence_date- final_judgment_date- appeal_status- is_final- source_urls_json- confidence- caution_level
```

```
judicial_events- id- case_id- event_date- event_type- title- description- source_url- document_type
```

```
judicial_charges- id- case_id- person_name- alleged_crime- amount_involved- requested_penalty- imposed_penalty- final_penalty- status
```

```
judicial_comparisons- id- case_id- comparable_case_id- similarity_score- similarity_reason- difference_in_duration_months- difference_in_penalty- warning_notes
```

```
corruption_cases- id- case_id- party_related- government_level- region- amount_involved- public_contracts_involved- final_status
```

---

## 5. Fuentes base

Orden de autoridad:

```
1. Sentencia / auto / documento judicial original2. CGPJ / CENDOJ / Poder Judicial3. Fiscalía / BOE / Congreso / Senado4. Tribunal de Cuentas / portales de contratación5. Informes UCO u oficiales si están publicados6. Prensa, solo como fuente secundaria
```

El CGPJ además explica que su Consejo tiene 20 vocales elegidos por Congreso y Senado entre jueces y juristas, más un presidente, y que los vocales se eligen por mayoría cualificada de tres quintos. Ese contexto institucional debe estar en una página educativa fija de Matiza, porque ayuda a entender por qué los nombramientos judiciales son políticamente sensibles.

Y la Comisión Europea, en su informe de Estado de derecho 2025, analiza los Estados miembros en cuatro áreas: sistema judicial, marco anticorrupción, pluralismo mediático y contrapesos institucionales. Esa fuente debería estar en el “contexto europeo” de la sección judicial.

---

## 6. Cómo tratar casos tipo Fiscal General / González Amador

La web no debe decir “esto es casualidad” ni “esto es persecución”. Debe hacer una ficha.

Ejemplo de métrica:

```
Caso A:Inicio: fechaProcesamiento: fechaJuicio: fechaSentencia: fechaDuración: X mesesCaso B:Inicio: fechaDiligencias: fechaJuicio previsto: no / síDuración actual: X mesesRetrasos relevantes: sí/noQuién los acuerda: juzgado / fiscalía / defensa / recurso / carga judicial
```

Sobre González Amador, fuentes recientes señalan que la UCO pidió acceso a información tributaria y de Seguridad Social, que inicialmente el juez autorizó solo parte de las medidas, y que Fiscalía y acusaciones criticaron la lentitud o falta de acceso a datos relevantes. Eso debe mostrarse como **incidencia procesal documentada**, no como conclusión política automática.

---

## 7. Visual para jóvenes

Esto tiene que parecer una ficha de videojuego/documental, no un PDF jurídico.

En cada caso:

```
⚖️ Estado del casoInvestigación / Juicio / Sentencia no firme / Firme⏱️ Velocidad judicialNormal / Lento / Muy lento / Acelerado📄 Pruebas disponiblesFuertes / Indiciarias / Contradictorias / Insuficientes🧭 ComparabilidadComparable / Parcialmente comparable / No comparable🔥 Ruido políticoBajo / Medio / Alto / Muy alto🚨 Cautela MatizaBaja / Media / Alta / Máxima
```

Ejemplo visual:

```
Duración del caso        ███████░░░  72%Pruebas documentales     ████░░░░░░  40%Sentencia firme          ██░░░░░░░░  20%Ruido político           █████████░  90%Riesgo de titular falso  ████████░░  80%
```

---

## 8. Admin

En el admin debe haber una sección:

```
/admin/judicial
```

Con pestañas:

```
CasosPersonasPartidosFasesTiemposCondenasComparacionesFuentesAlertas
```

Y botones:

```
Añadir casoAñadir evento judicialPedir documento originalComparar con casos similaresActualizar faseMarcar sentencia firmeMarcar recurso pendienteMarcar caso politizadoPublicar ficha
```

Muy importante: **comparar casos debe ser semiautomático**, no automático ciego. La IA propone comparables, pero el humano confirma.

---

## 9. Prompt para Antigravity

```
IMPLEMENTAR SECCIÓN JUDICIAL EN MATIZA: MAPA JUDICIAL Y CORRUPCIÓN EN DATOS.Objetivo:Crear una sección pública y un admin para registrar, visualizar y comparar casos judiciales políticos, corrupción, tiempos de procedimiento, fases procesales, condenas y diferencias entre casos similares.No quiero que el sistema afirme sesgo judicial sin datos.Quiero que convierta sospechas en métricas comparables:- duración del caso,- fase procesal,- pruebas disponibles,- sentencia firme o no,- recursos,- condena,- petición de Fiscalía,- posición de acusación y defensa,- comparación con casos similares.Crear rutas públicas:/justicia-en-datos/mapa-judicial/caso-judicial/[slug]/corrupcion-en-datos/comparador-judicialCrear admin:/admin/judicial/admin/judicial/casos/admin/judicial/comparador/admin/judicial/fuentes/admin/judicial/alertasCrear tablas:judicial_casesjudicial_eventsjudicial_chargesjudicial_sourcesjudicial_comparisonscorruption_casessentencing_metricscase_duration_metricsCada caso debe guardar:- partido o entorno político relacionado,- personas implicadas,- órgano judicial,- juez o tribunal,- fase procesal,- fechas clave,- delitos investigados,- petición de Fiscalía,- petición de acusación,- posición de defensa,- sentencia,- firmeza,- recurso,- fuentes originales,- nivel de cautela,- ruido político,- nivel de prueba.Cada caso debe mostrar:- timeline visual,- estado procesal,- mapa de pruebas,- fuentes,- comparación de duración,- comparación de pena,- advertencias de cautela.Crear motor:scripts/matiza-engine/judicial/  judicial-case-ingestor.js  judicial-event-extractor.js  procedural-stage-classifier.js  duration-comparator.js  sentence-comparator.js  corruption-case-classifier.js  judicial-source-checker.js  judicial-quality-gate.jsReglas editoriales:- No decir culpable si no hay sentencia firme.- No confundir investigado con condenado.- No comparar penas sin normalizar delito, cantidad, agravantes, atenuantes, número de delitos y firmeza.- No afirmar lawfare como hecho.- Sí mostrar señales objetivas:  - tiempos anómalos,  - decisiones recurridas,  - Fiscalía discrepante,  - falta de documento original,  - sentencia no firme,  - contradicciones probatorias,  - diferencias con casos comparables.Fuentes base:- CGPJ- CENDOJ- Poder Judicial- BOE- Fiscalía- Congreso- Senado- Tribunal de Cuentas- Comisión Europea Estado de Derecho- portales de transparencia- sentencias y autos originalesVisual:Cada caso debe tener tarjetas:- estado judicial,- duración,- pruebas,- firmeza,- ruido político,- cautela Matiza.No tocar la web pública general.No rehacer el diseño entero.Implementar esta sección como módulo separado.Ejecutar build.
```

---

## La idea final

Esto puede ser una de las partes más diferenciales de Matiza:

```
No solo verificamos bulos.También medimos cómo se mueve la justicia cuando afecta al poder.
```

Pero la frase pública debe ser prudente:

```
Matiza compara casos judiciales con datos: fases, tiempos, pruebas, recursos y condenas.
```

Eso te permite enseñar cosas muy graves sin caer en propaganda. Y si realmente hay patrones raros, los datos los mostrarán.

Sí, esta sección tiene que ser **un pilar de Matiza**, no un añadido. Y además puede ser más útil que muchas verificaciones diarias, porque ataca un problema enorme: la gente vota muchas veces por marca, cabreo o identidad, pero no por programa ni por historial real.

He mirado referencias: Newtral se dedica a verificación y trabaja mucho con redes y formatos de explicación; también hay medios que han hecho comparadores de propuestas por elecciones, y hay análisis públicos de patrimonio de diputados a partir de declaraciones oficiales del Congreso. Pero Matiza no debe copiar diseño ni estructura: debe crear su propio sistema de **programa explicado + historial real + comparador visual**. Newtral está reconocida como fact-checker y miembro de la IFCN, así que sirve como referencia de estándar, no como plantilla a clonar. ([Wikipedia](https://es.wikipedia.org/wiki/Newtral?utm_source=chatgpt.com "Newtral"))

La idea fuerte sería llamarlo:

## “Política en claro”

Dentro de Matiza:

```text
/programas-politicos
/partidos
/partido/[slug]
/comparador-politico
/promesas-y-hechos
/bienes-y-patrimonio
/votaciones
```

Y el lema:

```text
Antes de votar, entiende qué prometen, qué votan y qué hicieron.
```

## Cómo debería funcionar

Cada partido tendría una ficha muy visual. Por ejemplo:

```text
PP
PSOE
VOX
SUMAR
PODEMOS
ERC
JUNTS
PNV
BILDU
BNG / CC / UPN según prioridad electoral
```

No hace falta empezar con todos. Empieza con los 8-10 con más representación o impacto.

Cada partido tendría bloques por tema:

```text
Vivienda
Empleo
Salarios
Impuestos
Autónomos
Sanidad
Educación
Pensiones
Dependencia
Ayudas sociales
Inmigración
Seguridad
Justicia
Corrupción
Energía
Medio ambiente
Cataluña / territorial
Igualdad
Europa
```

Y cada bloque tendría siempre el mismo formato:

```text
1. Qué promete
2. Qué significa en lenguaje normal
3. A quién afecta
4. Qué hizo cuando gobernó
5. Qué votó en el Congreso/Senado
6. Qué fuentes lo prueban
7. Estado: cumplido / parcial / incumplido / bloqueado / no verificable
```

Esto es lo importante: no solo “programa electoral”, sino **programa contra realidad**.

## Ejemplo visual

Tema: vivienda.

```text
Vivienda — Comparador rápido

PSOE
Promete: más vivienda pública y límites al alquiler.
En claro: más intervención del mercado y ayudas públicas.
Cuando gobernó: aprobó Ley de Vivienda, pero el problema de precios siguió.
Estado: parcialmente cumplido.
Fuentes: BOE, MITMA, Congreso, INE.

PP
Promete: más oferta, menos burocracia y seguridad jurídica.
En claro: más construcción y menos regulación de precios.
Cuando gobernó en CCAA: revisar vivienda pública, suelo, ayudas autonómicas.
Estado: depende de territorio.
Fuentes: programas oficiales, boletines autonómicos.

VOX
Promete: endurecer okupación, bajar impuestos, priorizar nacionales en ayudas.
En claro: enfoque en seguridad jurídica y preferencia nacional.
Riesgo/impacto: puede afectar acceso a ayudas según situación administrativa.
Fuentes: programa oficial, votaciones.

SUMAR/PODEMOS
Promete: control de alquileres, parque público, límites a fondos.
En claro: intervención fuerte del mercado.
Cuando gobernó: medidas en coalición, ley vivienda, límites parciales.
Estado: parcial.
Fuentes: BOE, Congreso.
```

La clave es **explicarlo sin decir “vota a este”**.

## Apartado “qué hizo cuando gobernó”

Esto tiene que ser una base de datos, no texto suelto.

Campos:

```text
party_actions
- partido
- periodo
- nivel: nacional / autonómico / municipal
- cargo: gobierno / oposición / coalición
- área: vivienda, sanidad, impuestos...
- promesa relacionada
- acción realizada
- ley/decreto/votación/presupuesto
- fuente oficial
- impacto estimado
- estado
```

Ejemplo:

```text
Promesa:
Aumentar vivienda pública.

Hecho:
Se aprobó X ley / se presupuestó X / se ejecutó X.

Estado:
Cumplida parcialmente.

Explicación:
Prometer vivienda pública no es lo mismo que construirla. Hay que mirar presupuesto, suelo, ejecución y viviendas entregadas.
```

## Apartado “promesas y hechos”

Esto sería una página tipo ranking/checklist:

```text
/promesas-y-hechos
```

Filtros:

```text
Partido
Área
Elección
Estado
Nivel de gobierno
Promesa cumplida/parcial/incumplida
```

Visual:

```text
✅ Cumplida
🟡 Parcial
🔴 Incumplida
⚪ No verificable
🔵 Bloqueada por falta de mayoría
```

Muy importante: no poner “mintió” por defecto. Poner:

```text
Prometió X, pero no se aprobó.
Prometió X y se aprobó parcialmente.
Prometió X, pero necesitaba mayoría.
Prometió X, pero los datos no permiten confirmarlo.
```

## Bienes y patrimonio

Aquí mucho cuidado legal. Solo fuentes oficiales.

Página:

```text
/bienes-y-patrimonio
```

Debe mostrar:

```text
Político
Cargo
Partido
Declaración oficial
Inmuebles
Cuentas/depósitos
Acciones/participaciones
Deudas/hipotecas
Ingresos declarados
Fecha de declaración
Fuente oficial
```

Y avisos claros:

```text
Esto es patrimonio declarado oficialmente, no patrimonio total real.
Puede estar desactualizado si el cargo no ha actualizado declaración.
No implica delito ni irregularidad.
```

Hay análisis periodísticos basados en declaraciones patrimoniales del Congreso que muestran que estos datos existen y pueden convertirse en herramienta visual; por ejemplo, El País analizó las viviendas declaradas por diputados usando las declaraciones oficiales ante el Congreso. ([El País](https://elpais.com/espana/2024-10-06/615-casas-para-350-diputados-cuantas-viviendas-declaran-los-parlamentarios-ante-el-congreso.html?utm_source=chatgpt.com "615 casas para 350 diputados: ¿Cuántas viviendas declaran los parlamentarios ante el Congreso?"))

## Fuentes oficiales que debe usar

Para esta sección, orden de prioridad:

```text
1. Programa electoral oficial PDF/web del partido.
2. Congreso de los Diputados.
3. Senado.
4. BOE.
5. Presupuestos Generales.
6. Boletines autonómicos.
7. Parlamento autonómico correspondiente.
8. Tribunal de Cuentas.
9. Portal de Transparencia.
10. Declaraciones de bienes oficiales.
11. Votaciones parlamentarias.
12. INE / Eurostat / AIReF / Banco de España para impacto económico.
```

Los partidos en España tienen función constitucional de participación política y concurren a elecciones mediante programas y candidaturas; la sección debería partir siempre de documentos oficiales y no de propaganda de campaña o clips. ([Wikipedia](https://es.wikipedia.org/wiki/Partidos_pol%C3%ADticos_de_Espa%C3%B1a?utm_source=chatgpt.com "Partidos políticos de España"))

## Cómo lo implementaría técnicamente

Tablas:

```text
parties
- id
- slug
- name
- logo
- ideology_summary
- official_website
- current_leader

electoral_programs
- id
- party_id
- election
- year
- source_url
- pdf_path
- status

policy_areas
- id
- slug
- name
- description

policy_measures
- id
- party_id
- program_id
- area_id
- original_text
- plain_explanation
- affected_groups
- cost_or_impact
- source_page
- confidence

government_actions
- id
- party_id
- area_id
- period
- government_level
- action_title
- action_summary
- official_source_url
- related_measure_id
- result_status

parliament_votes
- id
- party_id
- area_id
- title
- date
- institution
- vote
- source_url

promise_tracking
- id
- measure_id
- action_id
- status
- explanation
- evidence_url

asset_declarations
- id
- person_name
- party_id
- role
- source_url
- assets_summary
- debts_summary
- income_summary
- date_declared
```

## Admin necesario

En el admin, sección:

```text
/admin/politica
```

Subsecciones:

```text
Partidos
Programas
Medidas extraídas
Traducción clara
Promesas vs hechos
Votaciones
Bienes declarados
Comparador
Revisión humana
```

Flujo:

```text
Subir programa PDF
↓
IA extrae medidas
↓
IA clasifica por área
↓
IA traduce a lenguaje claro
↓
IA detecta a quién afecta
↓
Humano aprueba medidas importantes
↓
Sistema las publica en ficha del partido
```

Para promesas vs hechos:

```text
Medida del programa
↓
Buscar BOE / Congreso / votaciones / presupuestos
↓
Relacionar acción real
↓
Clasificar estado
↓
Humano valida
```

## Visual para gente que “no tiene ni idea”

Esto es clave. Yo lo haría así:

### Nivel 1: tarjeta ultra simple

```text
Qué promete:
Bajar impuestos.

En claro:
El Estado recaudaría menos por esa vía.

Puede afectar a:
Servicios públicos, bolsillo individual, déficit o deuda.

Lo que falta saber:
Qué impuesto, cuánto baja y qué gasto se recorta o compensa.
```

### Nivel 2: detalle

```text
Texto del programa
Fuente oficial
Medida relacionada
Votaciones
Hechos cuando gobernó
```

### Nivel 3: datos

```text
BOE
Congreso
Presupuestos
Indicadores
```

Así una persona joven o poco politizada entiende rápido, y quien quiera profundizar tiene fuentes.

## Comparador visual potente

Página:

```text
/comparador-politico
```

La persona elige:

```text
Soy joven
Soy autónomo
Cobro ayuda
Tengo alquiler
Me preocupa sanidad
Me preocupan impuestos
Me preocupa inmigración
Soy pensionista
Tengo una pyme
```

Y ve:

```text
Qué propone cada partido
Qué hizo cuando gobernó
Qué votó
Qué puede cambiar para ti
Fuentes
```

Esto es brutal porque lo baja a la vida real.

Ejemplo:

```text
Si cobras una ayuda:

Partido A:
Propone mantener/ampliar.

Partido B:
Propone endurecer requisitos.

Partido C:
Propone eliminar ciertas ayudas o priorizarlas.

Ojo:
Mira si habla de ayuda concreta, renta mínima, dependencia, desempleo o subvenciones.
```

## Prompt para Antigravity

```text
IMPLEMENTAR SECCIÓN POLÍTICA CLARA EN MATIZA

Objetivo:
Crear una sección visual para explicar programas electorales, promesas, hechos de gobierno, votaciones y bienes declarados de políticos.

No copiar diseño ni estructura de Newtral/Neutral.
Crear una experiencia propia de Matiza: clara, visual, comparativa y basada en fuentes oficiales.

Rutas públicas:
- /programas-politicos
- /partidos
- /partido/[slug]
- /comparador-politico
- /promesas-y-hechos
- /bienes-y-patrimonio
- /votaciones

Objetivo editorial:
La gente debe poder entender qué propone cada partido aunque no sepa de política.
Explicar en lenguaje claro, no técnico.
No decir a quién votar.
No insultar.
No hacer propaganda.
Mostrar programa, hechos y fuentes.

Partidos iniciales:
Usar los principales partidos con representación nacional/autonómica relevante.
No hardcodear solo estos: permitir añadir más desde admin.

Áreas:
- vivienda
- empleo
- salarios
- impuestos
- autónomos
- sanidad
- educación
- pensiones
- dependencia
- ayudas sociales
- inmigración
- seguridad
- justicia
- corrupción
- energía
- medio ambiente
- territorial
- igualdad
- europa

Cada medida debe tener:
- texto original
- fuente oficial
- explicación clara
- a quién afecta
- posible impacto
- qué hizo el partido cuando gobernó
- votaciones relacionadas
- estado de cumplimiento

Crear tablas:
- parties
- electoral_programs
- policy_areas
- policy_measures
- government_actions
- parliament_votes
- promise_tracking
- asset_declarations

Crear admin:
- /admin/politica
- /admin/politica/partidos
- /admin/politica/programas
- /admin/politica/medidas
- /admin/politica/promesas
- /admin/politica/votaciones
- /admin/politica/bienes

Flujo admin:
1. Subir programa electoral PDF o URL oficial.
2. Extraer medidas con IA.
3. Clasificar por área.
4. Traducir a lenguaje claro.
5. Relacionar con hechos de gobierno.
6. Relacionar con votaciones.
7. Marcar estado:
   - cumplida
   - parcial
   - incumplida
   - bloqueada
   - no verificable
8. Aprobar para publicar.

Fuentes prioritarias:
- programa oficial del partido
- BOE
- Congreso
- Senado
- presupuestos
- boletines autonómicos
- Tribunal de Cuentas
- portales de transparencia
- declaraciones oficiales de bienes
- INE
- Eurostat
- AIReF
- Banco de España

Visual:
Cada partido debe tener tarjetas por área.
Cada área debe mostrar:
1. Qué promete.
2. En claro.
3. A quién afecta.
4. Qué hizo.
5. Qué votó.
6. Estado.
7. Fuentes.

Comparador:
Permitir comparar varios partidos por un tema.
Crear modo práctico:
- si eres joven
- si cobras ayudas
- si eres autónomo
- si alquilas
- si eres pensionista
- si tienes pyme

No tocar la web pública general salvo añadir enlaces.
No rehacer todo el diseño.
Implementar como módulo separado.
Ejecutar build.
```

Mi opinión: esta sección debería llamarse **“Política en claro”** o **“Antes de votar”**. Es el tipo de cosa que puede diferenciar Matiza de un fact-checker clásico: no solo desmiente bulos, sino que ayuda a entender **qué votas realmente**.