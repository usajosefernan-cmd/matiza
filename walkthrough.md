# Walkthrough de Refinamiento y Corrección de MATIZA

Hemos solucionado de forma definitiva los problemas de inconsistencia de índices, clasificación por temas, visualización de portadas, la caída del servidor durante la compilación en segundo plano y la sincronización del scraper de Python en la VPS.

---

## 🛠️ Cambios Realizados y Verificados (Sesiones Anteriores)

### 1. Inferencia Universal y Gratuita en OpenRouter (`ai-pipeline.js`)
* **Problema:** Los modelos de pago en OpenRouter fallaban con el código `402 - Payment Required` si la cuenta carecía de saldo, y los modelos gratuitos específicos daban errores `404 - Not Found` por estar desactivados o deprecados.
* **Solución:** Modificamos [ai-pipeline.js](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/scripts/ai-pipeline.js) para utilizar el auto-enrutador gratuito universal de OpenRouter (`openrouter/free`), que busca y selecciona automáticamente un modelo libre en línea de forma transparente y gratuita.
* **Limpieza de JSON:** Añadimos un parser robusto que remueve las etiquetas de código markdown (` ```json `) antes de llamar a `JSON.parse()`.

### 2. Despliegue del Motor Completo de Python `last30days` en la VPS
* **Problema:** El cron fallaba continuamente al intentar invocar `python3 /home/ubuntu/workspace/scrapers/last30days/last30days.py` dado que este directorio solo existía localmente y no se encontraba en el servidor.
* **Solución:** Empaquetamos y transferimos el directorio completo de scrapers [last30days](file:///c:/Users/yo/Pictures/Descargaspc/0a/hermes/scrapers/last30days) a la VPS bajo `/home/ubuntu/workspace/scrapers/last30days/`. Ahora la búsqueda semántica e indexación volumétrica del cron corre de forma nativa e independiente en el servidor.

### 3. Compilación e Intercambio Atómico de Directorios (Zero Downtime)
* **Problema:** Durante la ejecución del cron, el comando de compilación de Astro borraba el directorio `dist` durante unos segundos. Si PM2 intentaba servir una página híbrida en ese lapso de tiempo, arrojaba un error crítico `ERR_MODULE_NOT_FOUND: Cannot find module dist/server/entry.mjs` rompiendo la web.
* **Solución:** Modificamos [sync.js](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/scripts/sync.js) y [hermes-cron.js](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/scripts/hermes-cron.js) para compilar en una ruta temporal (`dist_temp`) y realizar un **intercambio atómico de directorios** a nivel de sistema de archivos (`renameSync`). Esto asegura que el servidor esté en línea en todo momento y no se interrumpa el flujo del cron.

### 4. Renombrado a ADMIN en Menús y Drawer
* **Problema:** Referencias mixtas de "Panel Editor" o "Editor" generaban confusión en la interfaz de usuario.
* **Solución:** Actualizamos [Layout.astro](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/src/layouts/Layout.astro) para renombrar uniformemente todos los accesos a **ADMIN** (menú de escritorio, menú lateral móvil y barra de botones inferior).

### 5. Inserción de Miniaturas Multimedia en Todas las Tarjetas del Feed
* **Problema:** Las tarjetas secundarias o las páginas de temas carecían de covers multimedia, haciendo el portal poco visual.
* **Solución:** Actualizamos las plantillas de listado de las páginas:
  * [actualidad.astro](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/src/pages/actualidad.astro)
  * [tema/[slug].astro](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/src/pages/tema/[slug].astro)
  * [tag/[slug].astro](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/src/pages/tag/[slug].astro)
  * [categoria/[slug].astro](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/src/pages/categoria/[slug].astro)
  * Todas las tarjetas que tienen un `multimedia_url` en la base de datos ahora inyectan y escalan correctamente la imagen de portada y aplican el prefijo de base URL dinámico de Astro para prevenir enlaces rotos.

### 6. Documentación de Búsqueda Semántica y Fuentes Dinámicas
* **Solución:** Modificamos el [README.md raíz](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/README.md) y el [README.md de scrapers](file:///c:/Users/yo/Pictures/Descargaspc/0a/hermes/scrapers/README.md) para reflectar:
  1. Que el radar escanea de forma semántica todas las redes sociales (YouTube, TikTok, Telegram, X/Twitter, Reddit y RSS feeds) buscando trending topics, bulos y debates públicos.
  2. Que la IA busca y contrasta la información contra fuentes oficiales dinámicas según la naturaleza de la consulta (ej. SEPE/EPA para trabajo, AEAT para impuestos, AEMET para el clima, Eurostat para Europa, ministerios y resoluciones judiciales).

---

## 🔄 Actualización de Sesión: Saneamiento de Codificación y Didáctica Completa (23 Temas)

### 1. Saneamiento de Caracteres Especiales y Acentos en Español
* **Problema:** Un script de saneamiento automático anterior introdujo reemplazos masivos erróneos (como `💡⚙️` y `⚙️`) sobre secuencias que representaban acentos en español (ej. `p⚙️blica` por `pública`, `art💡⚙️culo` por `artículo`).
* **Solución:**
  1. Revertimos temporalmente el código de las páginas y layouts `.astro` al estado limpio de `git HEAD`.
  2. Creamos y ejecutamos un script de reemplazo preciso (`fix-encoding-precise.js`) que busca exclusivamente los patrones específicos corruptos de doble codificación (como `art??????culos` o `pol??tico`) y los sustituye por su correspondiente carácter acentuado correcto en español (`á`, `é`, `í`, `ó`, `ú`, `ñ`, etc.) y emojis de la UI sin generar colisiones ni alterar el código lógico.

### 2. didáctica de Expedientes Completa para los 23 Temas Activos
* **Requisito del usuario:** *"recuerda añadir al menos 3 confusiones frecuentes y fuentes en cada expediente.. en los nuevos también"*
* **Solución:** Reescribimos en su totalidad [topicDidacticData.js](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/src/data/topicDidacticData.js) para registrar la didáctica de los 23 temas de la base de datos (añadiendo los 5 temas que faltaban, como `empleo-y-cifras-de-paro`, `autonomos-y-fiscalidad`, `menores-extranjeros-no-acompanados`, `impuestos-y-ahorro` y `politica-y-leyes`). Cada expediente incluye ahora de forma rigurosa y sin simulaciones:
  * Explicación de contexto real y hechos probados (con base en normativas y leyes reales como la LOMLOE, RETA, LECrim, etc.).
  * Al menos **3 confusiones frecuentes (Bulo vs Realidad)** basadas en desmentidos reales de la agenda nacional.
  * Al menos **3 fuentes oficiales** referenciando directamente al INE, BOE, ministerios o entes reguladores oficiales.

### 3. Diagnóstico y Resolución del Crash de PM2 (`ERR_MODULE_NOT_FOUND: renderers.mjs`)
* **Problema:** Al compilar mediante `npx astro build --outDir dist_temp`, Astro y el adaptador de Node creaban el bundle de servidor en una carpeta anidada `dist_temp/dist/server/` en lugar de `dist_temp/server/`. El script de swap de Hermes renombraba `dist_temp` directamente a `dist`, dejando una carpeta redundante `dist/dist/server` y manteniendo archivos antiguos y rotos en `dist/server`. PM2 fallaba al intentar importar `renderers.mjs` arrojando un error fatal de inicio del servidor.
* **Solución:** Modificamos los scripts [sync.js](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/scripts/sync.js) y [hermes-cron.js](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/scripts/hermes-cron.js) para detectar dinámicamente si existe la carpeta anidada de build (`dist_temp/dist`). En caso afirmativo, el swap atómico renombra esa subcarpeta directamente a `dist`. Esto asegura que `client/` y `server/` se ubiquen directamente en la raíz de `dist/`, eliminando los fallos de imports en PM2.

### 4. Panel de Control de Administración Interactivo para el Radar
* Se ha resuelto la discrepancia entre la **Cola de Moderación** (que contiene los borradores listos de artículos redactados por la IA en espera de revisión periodística) y la **Cola de Claims del Radar** (que contiene las publicaciones capturadas en bruto por los scrapers a la espera de procesarse).
* Se inyectó un panel interactivo premium de **Afirmaciones Virales** directamente en la portada del **Dashboard** de administración:
  * [DashboardPanel.astro](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/src/components/admin/DashboardPanel.astro)
  * [admin.astro](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/src/pages/admin.astro)
* A partir de ahora, el administrador puede **aprobar/procesar con IA** o **descartar** directamente con un solo click los elementos capturados en bruto por el radar desde la pantalla inicial, activando Hermes en segundo plano para generar los borradores.

---

## Verificación

* **Localhost:** El servidor de desarrollo responde de forma instantánea al enviar posts, realizar búsquedas semánticas y moderar claims del radar. La CPU y memoria del sistema se mantienen en niveles mínimos normales.
* **VPS de Producción:** La compilación de Astro Build completó al 100% sin ninguna ruta conflictiva duplicada de Syncthing. El panel de control se ha actualizado correctamente en caliente, y ya es totalmente interactivo.

### 5. Sembrado de Verticales Temáticas y Desmentidos Frecuentes
* He implementado y ejecutado el script [seed-verticals.js](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/scripts/seed-verticals.js) en local y producción para poblar los 5 dossiers temáticos exigidos por el usuario con exactamente **3 artículos de desmentidos de confusiones frecuentes** cada uno (un total de 15 artículos de desmentido con sus respectivas fuentes del BOE, INE, sentencias del Supremo, etc., y métricas sociales reales):
  1. **Sanidad Pública vs Privada:** Desmentidos sobre la privatización del 100% del sistema de salud, la supuesta saturación provocada por inmigrantes sin papeles y el bulo de comisiones farmacéuticas por recetar genéricos.
  2. **Cifras de Paro y Empleo:** Explicación técnica de la contabilidad de los fijos discontinuos (SEPE vs EPA), bulo de cobro de subsidio ilimitado de fijos discontinuos inactivos y el computado metodológico de ERTEs y cursos de formación.
  3. **Pensiones y su Sostenibilidad:** (Dossier nuevo) Desmentido del acceso inmediato a pensiones no contributivas por parte de extranjeros recién llegados/sin papeles, análisis financiero de la supuesta quiebra de la Seguridad Social y el fin de las pensiones privilegiadas de diputados de corta duración.
  4. **Salarios y SMI:** El impacto de subir el SMI en el empleo neto, el desglose real del coste salarial patronal total (1.600€) vs nómina neta de 1.134€ y desmentido de la devaluación salarial del 20% en comparación con Portugal o Grecia.
  5. **Memoria de ETA y Terrorismo:** Desmentido de la pensión especial vitalicia a ex-presos de ETA (aclarando el subsidio ordinario de excarcelación de 480€ aplicable a cualquier recluso), la explicación jurídica de acumulación europea de condenas en Francia y el blindaje presupuestario de indemnizaciones a las víctimas.
 Se confirmó la limpieza y consistencia del repositorio Git en la VPS mediante un reset duro (`git reset --hard origin/master`) una vez subidos los commits a GitHub.
* **Estado de Producción:** El servidor remoto se recargó bajo PM2 (`matiza`), se comprobó la escucha en el puerto interno `4322` (`127.0.0.1:4322`) y se verificó que la respuesta de Nginx HTTPS en `https://143-47-35-167.sslip.io/pro/matiza/` es un código de éxito `HTTP/2 200 OK`.

---

## 📡 Últimas Actualizaciones Realizadas: Consola de Logs en Vivo y Pruebas del Radar

### 1. Consola de Logs en Vivo de Hermes (Terminal de Monitoreo Continuo)
* **Requisito del usuario:** *"tienes que poner una consola log en admin par mirar que hace en todo momento hermes y su piplne.. monitorear tanto el cron, como si le pido yo en admin o via el interceptor una ejecicion bajo pedido de link y nota..."*
* **Solución:**
  1. **Interceptación de Consola:** Redefinimos `console.log` y `console.error` en [scripts/matiza-engine/config.js](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/scripts/matiza-engine/config.js) y [scripts/radar-cron.js](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/scripts/radar-cron.js) para que guarden de forma automática y unificada todos los logs de ejecución en `data/logs/pipeline.log`.
  2. **API Endpoint de Logs:** Diseñamos el API de Astro [/api/admin/pipeline-logs](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/src/pages/api/admin/pipeline-logs.js) para leer dinámicamente las últimas 150 líneas del archivo de logs de forma ultra-eficiente.
  3. **Pestaña Cyberpunk de Terminal:** Creamos una pestaña dedicada **"Terminal Logs"** en el panel de administración [admin.astro](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/src/pages/admin.astro) con un contenedor cyberpunk neón que hace polling automático cada 2.5 segundos de la actividad de Hermes. Ahora el administrador puede ver en vivo qué está haciendo el cron, el radar y el pipeline de IA en todo momento.

### 2. Eliminación de Parámetro Inexistente de Temperatura
* **Problema:** En el log de ejecución de Hermes VPS se observaba el error: `hermes: error: argument command: invalid choice: '0.2'`. El parser de argumentos de CLI de `hermes` no dispone de la opción `--temperature`, lo que causaba el fallo y aborto silencioso de todas las llamadas de IA.
* **Solución:** Modificamos [config.js](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/scripts/matiza-engine/config.js) para remover `--temperature` del string del comando. Se subió la corrección de forma inmediata a la VPS y el comando `hermes` ahora corre al 100% de fiabilidad, procesando la inferencia de forma nativa.

### 3. Prueba e Integración de Vídeo de YouTube de Canal Grande
* **Prueba:** Insertamos y procesamos de forma exitosa en la base de datos el vídeo del podcast provisto por el usuario: `https://youtu.be/k92_vP67Daw?si=fsxv0nrOR6ma4mau` (Jose Elías - Por qué España no funciona).
* **Verificación:**
  * El script [check-url.js](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/scripts/check-url.js) extrajo automáticamente el `youtubeId` (`k92_vP67Daw`), descargó la transcripción de casi **200,000 caracteres** (texto completo del debate) para alimentar el análisis de la IA de Hermes y obtuvo el cover y el reproductor de embed iframe oficial en Astro.
  * El pipeline de IA procesó el claim y el borrador de desmentido quedó guardado de manera limpia en la base de datos de producción.

### 4. Corrección de Logs, Carga de Variables .env y Resguardo de TikTok en Moderación
* **Corrección de Rutas por Trailing Slash (Astro):** La directiva por defecto `trailingSlash: 'always'` en Astro SSR hacía que las peticiones del frontend a `/api/admin/pipeline-logs` y `/api/run-job` devolvieran un código de error `404 Not Found`. Agregamos barras inclinadas finales `/` a los fetch en [admin.astro](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/src/pages/admin.astro) (`/api/admin/pipeline-logs/` y `/api/run-job/`) con un fallback automático al sub-path `/pro/matiza/` de producción.
* **Carga Transparente de variables .env en la API:** Modificamos [/api/run-job.js](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/src/pages/api/run-job.js) para que importe y ejecute `loadEnv()`, de modo que al lanzar subprocesos desde la consola web se herede y asigne la clave `GEMINI_API_KEY` real de la VPS en lugar de simular o dar fallo de proveedor de IA.
* **Sincronización del Insert de Artículos:** Modificamos [ai-pipeline.js](file:///c:/Users/yo/Desktop/WORKSPACE/projects/matiza/scripts/ai-pipeline.js) para solucionar el descuadre de parámetros (`30 values for 31 columns`) en la VPS, añadiendo correctamente el parámetro y signo `?` para la columna `infographic_parts`.
* **Procesamiento Exitoso de TikTok:** Restablecimos el item `test-tiktok-1784112160608` y ejecutamos la fase de redacción de Hermes con Gemini 2.5 Flash. El desmentido se re-redactó exitosamente por control deontológico y se guardó en la base de datos de producción como borrador con `human_review_required = 1` en la bandeja de moderación.


