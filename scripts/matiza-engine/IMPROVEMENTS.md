# MATIZA Engine 2 — análisis y mejoras aplicadas

## Diagnóstico del paquete original

El motor original tenía una estructura de fases razonable, pero no ejecutaba un flujo real y fiable de búsqueda/verificación:

- `run-hourly.js`, `run-daily.js` y `run-manual-item.js` contenían resultados simulados o hardcodeados.
- La búsqueda de evidencia dependía casi exclusivamente del HTML de DuckDuckGo y de snippets, sin leer de forma consistente las páginas seleccionadas.
- El caché podía reutilizar fuentes de cualquier artículo del mismo tema aunque no respaldaran el claim concreto.
- El router y el filtro de relevancia estaban condicionados por nombres, verticales y palabras escritas a mano.
- El supuesto sistema multiagente era, en la práctica, una única inferencia por fase.
- El `quality-gate` podía aprobar por defecto cuando fallaba la IA: un fallo crítico de seguridad editorial.
- La cola permitía conservar estados publicados en elementos que todavía debían revisarse.
- El radar del proyecto principal generaba consultas fijas, añadía “bulo” a las tendencias y asignaba verticales con `if/else`, por lo que solo encontraba lo que el desarrollador ya había previsto.

## Qué cambia en esta versión

### 1. Paneles multiagente concurrentes

Las decisiones importantes ya no dependen de una sola llamada. `lib/multi-agent.js` lanza roles especializados simultáneamente, con concurrencia limitada:

- impacto público;
- daño potencial;
- ruido y publicidad;
- origen del claim;
- fuentes primarias;
- contraevidencia;
- contexto;
- metodología;
- neutralidad;
- riesgo editorial/legal.

Un coordinador sintetiza después los desacuerdos. No es una “votación ciega”: se conserva la incertidumbre.

### 2. Búsqueda en enjambre

`lib/search-swarm.js` crea estrategias de búsqueda separadas para:

- localizar el origen;
- encontrar fuentes primarias;
- buscar evidencia contraria;
- aportar contexto y metodología.

Las consultas se ejecutan en paralelo. Después se descargan las páginas, se puntúan por autoridad y relación semántica, y varios agentes auditan las fuentes.

Una cita solo se marca como verificada cuando aparece literalmente en el contenido descargado. Un snippet o una portada genérica no se consideran evidencia suficiente.

### 3. Proveedores de búsqueda configurables

Orden de uso:

1. `ANTIGRAVITY_SEARCH_URL` o `SEARCH_API_URL`, si existe un gateway HTTP real y ejecutable en producción.
2. `SEARXNG_URL`, si se dispone de una instancia SearXNG.
3. DuckDuckGo HTML como último recurso.

Antigravity es el entorno que construye y prueba el código; no se presupone que su buscador interno sea invocable por un cron. Para usarlo en producción hace falta una URL/API/CLI real. El motor no inventa esa integración.

### 4. Radar dinámico

`integration/radar-intelligence.js` y `integration/radar-cron-v2.js` sustituyen:

- consultas fijas;
- listas cerradas de nombres;
- obligación de incluir la palabra “bulo”;
- verticales hardcodeados;
- métricas sociales inventadas.

El radar usa agentes simultáneos para proponer consultas a partir de señales recientes, verticales existentes y preocupaciones emergentes. Después aplica relevancia, ruido, extracción de claim y routing semántico.

Cuando no existen visitas/likes reales, la recurrencia en buscadores se guarda como señal de descubrimiento, no como “viralidad real”.

### 5. Router semántico abierto

El router intenta primero reutilizar verticales existentes por similitud. Si la confianza es baja, consulta un panel de agentes. No contiene una lista cerrada de personas ni temas.

Mantiene compatibilidad con `topic_match` y `topic_matches` para evitar romper código anterior.

### 6. Caché prudente

Las fuentes conocidas se usan como candidatos, nunca como prueba automática. El claim actual debe seguir coincidiendo con el documento y pasar la auditoría.

Esto evita que una fuente válida para una pieza del mismo vertical termine “probando” otra afirmación distinta.

### 7. Quality gate cerrado

Si el revisor falla, no aprueba. El artículo queda bloqueado para revisión.

También comprueba de forma determinista:

- que el veredicto y el texto no se contradigan;
- que haya fuentes realmente recuperadas;
- que no se inventen porcentajes o certezas;
- que no se presente una acusación como hecho;
- que exista revisión humana.

### 8. Runners reales

- `run-hourly.js`: toma items pendientes de la base de datos y ejecuta el pipeline real en paralelo.
- `run-daily.js`: detecta temas calientes y actualiza verticales de forma limitada.
- `run-manual-item.js`: procesa un item real por ID o texto.
- `run-item-pipeline.js`: coordina todas las fases y guarda artefactos por fase.

Todo se guarda como `borrador`, `revision_humana` o `necesita_revision_ia`. Nunca se publica automáticamente.

## Qué no puede resolver el ZIP por sí solo

- Acceso real a X, Instagram o TikTok sin APIs/conectores válidos.
- Uso del buscador interno de Antigravity desde un cron si Antigravity no expone una API o CLI.
- Verificación completa de PDFs escaneados, vídeo o audio sin conectores específicos.
- Pruebas end-to-end contra tu base de datos y tus claves reales, que no se incluyen en el archivo.

El código deja puntos de extensión explícitos para esas integraciones y evita fingir que están funcionando.
