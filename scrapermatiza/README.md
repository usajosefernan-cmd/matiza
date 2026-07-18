# 🛰️ Ingeniería del Motor de Scraping, Auditoría y Editor Editorial

Este documento detalla el funcionamiento interno del scraper de red dinámico, la extracción de metadatos multimedia, el cálculo de los tres índices de relevancia (Viral, Social, Riesgo) y la consola de administración en vivo.

---

## 1. 📡 El Motor de Búsqueda Dinámico (`radar-cron.js`)
El script de escaneo de tendencias realiza búsquedas dinámicas a lo largo de redes sociales para capturar claims potencialmente falsos o manipulados:
* **X/Twitter (Nitter RSS Engine):** Monitoriza debates mediante instancias públicas descentralizadas de Nitter. Realiza consultas por palabras clave neutrales sobre la actualidad socioeconómica en lugar de perfiles de políticos.
* **Reddit (JSON Search API):** Consulta la API JSON de Reddit (`r/all/search.json`) buscando disputas e hilos virales de usuarios activos.
* **Filtros por Word Boundaries (`\b`):** Para evitar falsos positivos y errores de catalogación (como asociar partidos de fútbol a la memoria histórica o noticias sobre "paro cardíaco" a las cifras de desempleo), el motor exige límites de palabras exactas. Por ejemplo:
  `/\bfranco\b/i` para Memoria Histórica, y `/\bparo\b/i` para Desempleo.
* **Fallback por defecto:** Cualquier noticia reportada o capturada que no encaje en una categoría temática específica se cataloga por seguridad en la sección **"Economía española y sociedad"** en lugar de ir a secciones ideológicas sensibles.

---

## 2. 🔍 Verificador de Recursos y Metadatos (`check-url.js`)
Es el componente encargado de validar cada enlace sospechoso en caliente:
* **Extracción de Portada (OG Image):** Analiza el HTML crudo en busca de metadatos `og:image` o `twitter:image` para capturar la miniatura original del bulo (estilo AIDAILY). Si se detecta, se almacena en la base de datos y se renderiza en la cabecera del desmentido.
* **Localización de Reproducciones (YouTube Views):** YouTube formatea las visualizaciones según la región del cliente (ej: `241,004 views` vs `241.004 visualizaciones`). El scraper implementa un regex multinivel:
  1. `viewCount` plano en JSON.
  2. `simpleText` localizado (ej: `visualizaciones` o `views`).
  3. `videoViewCountRenderer` anidado.
  Esto garantiza que el motor nunca asigne "0 reproducciones" por fallos de traducción de YouTube en la VPS.

---

## 3. 📊 Cortafuegos e Índices de Relevancia (`report.js` API)
Cuando un enlace se reporta, el endpoint ejecuta un análisis de triple índice:
1. **Índice de Viralidad (IV) [0-10]:** Escala logarítmica calculada en base a las reproducciones en origen.
   $$\text{IV} = \min(10.0, \log_{10}(\text{visitas} + 1) \times 1.5)$$
   * 100k visualizaciones = `7.5/10` (Urgencia Crítica).
   * 240k visualizaciones = `8.1/10` (Supera cortafuegos de inmediato).
2. **Índice de Impacto Social (IIS) [0-10]:** Ponderación automática según la temática. La política, leyes del BOE y cotizaciones de la Seguridad Social se evalúan en `9.0/10`.
3. **Índice de Riesgo de Desinformación (IRD) [0-10]:** Evalúa la presencia de lenguaje sensacionalista ("zasca", "humilla") o la existencia de enlaces de afiliados/referidos directos u ocultos.
* **Resolución de Duplicados en Vivo:** Escanea la base de datos de desmentidos publicados de la VPS en busca de palabras clave coincidentes. Si el bulo ya fue verificado, detiene el procesamiento y devuelve de inmediato al usuario el enlace para su lectura.

---

## 4. 🤖 Pipeline de Redacción Deontológica (`ai-pipeline.js`)
* **Código Deontológico:** El prompt prohíbe taxativamente usar agencias de fact-checking secundarias (Newtral, Maldita). Los argumentos deben contrastarse directamente con fuentes del BOE y el INE.
* **Extracción de Transcripción de YouTube:** `check-url.js` ahora descarga automáticamente la transcripción completa de los vídeos y Shorts de YouTube:
  1. *Endpoint Primario:* Consulta la API pública sin llaves `youtube-transcript.ai` para descargar el texto plano limpio.
  2. *Fallback Secundario:* Raspado del HTML nativo del reproductor de YouTube buscando `captionTracks`, extrayendo la URL base XML del idioma configurado y limpiando las marcas de tiempo.
  La transcripción resultante se guarda en la columna `text` de la base de datos a través del endpoint `/api/report.js`, dotando a la IA del discurso hablado completo para su análisis.
* **Fallback Robusto con OpenRouter:**
  - Si la llamada nativa de Gemini devuelve un error (como `429 - Quota Exceeded` de los límites de llamada diarios gratuitos), el motor conmuta automáticamente a OpenRouter.
  - Para evitar errores de validación de saldo/crédito en OpenRouter (`402 - Payment Required`), se define explícitamente `max_tokens: 2000` en la consulta, reduciendo drásticamente el coste proyectado a milésimas de centavo y permitiendo la ejecución con saldos mínimos.
  - *Modelo Secundario:* Si el modelo principal falla, se conmuta a `meta-llama/llama-3.1-8b-instruct` como segundo nivel de contingencia.
* **Base de Datos Local:** Si falla toda conexión de IA, se aplica el fallback estático con una base de datos local predefinida de 9 temas de actualidad (Seguridad Social, Begoña Gómez, Koldo, Vivienda, etc.).

---

## 🖥️ 5. Consola Editorial y Logs en Caliente (`admin.astro` & `run-job.js`)
* **Subproceso en Vivo:** Los botones del panel de control realizan peticiones HTTP POST a `/api/run-job`. El backend lanza el script solicitado en la VPS usando `spawn` de Node.js.
* **Stream en Tiempo Real:** El `stdout` y `stderr` del subproceso se capturan y se transmiten línea a línea a la terminal del navegador usando un stream NDJSON (`ReadableStream`), permitiendo depurar en vivo sin recargas.

---

## 🌐 6. Despliegue y Proxy Inverso (Nginx VPS)
* **Arquitectura de Red:** El portal se sirve en producción en la VPS bajo la ruta `https://143-47-35-167.sslip.io/pro/matiza/`.
* **Configuración de Nginx:** La VPS cuenta con una instancia Nginx activa en el host (puerto 80 y 443). Se habilitó el bloque de servidor `algotrading` en `/etc/nginx/sites-enabled/` que redirige el subpath `/pro/matiza/` mediante proxy inverso al servidor Node de Astro:
  ```nginx
  location = /pro/matiza {
      return 301 $scheme://$http_host/pro/matiza/;
  }
  location /pro/matiza/ {
      proxy_pass http://127.0.0.1:4322;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_buffering off;
  }
  ```
* **Mantenimiento y PM2:** Astro corre bajo PM2 (`name: matiza`, ID 10) en el puerto `4322`. Tras cada compilación de build estático, el backend de Astro recarga automáticamente su propio daemon (`pm2 reload matiza`) para servir instantáneamente los nuevos activos de servidor compilados sin interrupciones.
