# 📊 Guía de Inferencia: Uso Exclusivo de Modelos Gratuitos y Rotación de LLMs en AIDAILY

Este documento detalla el catálogo de proveedores de APIs de Inteligencia Artificial que ofrecen un **Tier Gratuito (Free Tier)** o **Modelos Libres (Free Models)** sin coste de mantenimiento, sirviendo como la infraestructura principal y exclusiva de inferencia para **IA Daily (Hermes)**.

---

## 1. Comparativa de Modelos Gratuitos Soportados

| Prioridad | ID de Modelo en OpenRouter | Proveedor | Límites Típicos / Rate Limit | Contexto | Rol en la Rotación |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **1** | `meta-llama/llama-3.3-70b-instruct:free` | Meta / LPU | **20 RPM** (Capped) | 131K | **Redactor Principal**: Alta calidad editorial y fluidez en español. |
| **2** | `google/gemini-2.5-flash:free` | Google | **15 RPM / 1,500 RPD** | 1M | **Respaldo Principal**: Rápido, gran ventana de contexto y alta fidelidad. |
| **3** | `qwen/qwen-2.5-72b-instruct:free` | Alibaba | **20 RPM** (Capped) | 128K | **Respaldo Secundario**: Excelente capacidad de razonamiento en español. |
| **4** | `nousresearch/hermes-3-llama-3.1-405b:free` | Nous Research | **20 RPM** (Capped) | 131K | **Razonamiento Complejo**: Modelo gigante de 405B para estructurar pie de fotos. |
| **5** | `google/gemini-2.5-pro:free` | Google | **2 RPM / 50 RPD** | 2M | **Contingencia Premium**: Alta inteligencia para estructuración de datos. |
| **6** | `meta-llama/llama-3.1-405b-instruct:free` | Meta | **20 RPM** (Capped) | 131K | **Contingencia Llama**: Modelo oficial de 405B para resúmenes complejos. |
| **7** | `deepseek/deepseek-r1:free` | DeepSeek | Variable según carga | 128K | **Pensamiento Lógico**: Razonamiento avanzado para clasificaciones semánticas. |
| **8** | `tencent/hy3:free` | Tencent | **20 RPM** (Capped) | 256K | **Inferencia Alternativa**: Alternativa multi-fuente de gran contexto. |
| **9** | `microsoft/phi-4:free` | Microsoft | **20 RPM** (Capped) | 16K | **Respaldo Ligero**: Procesamiento rápido de noticias de menor longitud. |
| **10** | `google/gemma-2-9b-it:free` | Google | **15 RPM / 1,500 RPD** | 8K | **Filtro Semántico**: Fallback rápido para evaluar relevancia. |
| **11** | `meta-llama/llama-3.2-3b-instruct:free` | Meta | **20 RPM** (Capped) | 128K | **Filtro Semántico Principal**: Rápido y ultra-ligero. |

---

## 2. Límites y Cuotas Detallados por Proveedor

### A. Google AI Studio (Gemini Free Tier)
Ofrece el Tier Gratuito más estable y generoso del mercado. Los límites de tasa se aplican por proyecto de Google Cloud:
*   **Modelos y Cuotas**:
    *   **Gemini 2.5 Flash** (Producción): 15 RPM / 1,500 RPD / 1M TPM.
    *   **Gemini 2.5 Flash Preview**: 10 RPM / 500 RPD / 250K TPM.
    *   **Gemini 2.5 Pro Experimental**: 5 RPM / 25 RPD / 250K TPM (Contexto de 2M).

### B. OpenRouter Free Tier (Catálogo de Respaldo)
*   **API Endpoint**: `https://openrouter.ai/api/v1`
*   **Límites de Tasa (Rate Limits)**:
    *   *Requests Per Minute (RPM)*: Capped globalmente a **20 RPM**.
    *   *Requests Per Day (RPD)*: **50 RPD** (sin saldo) o **1,000 RPD** (saldo ≥ $10).

---

## 3. Uso y Configuración de IAs en IA Daily (AIDAILY)

En el portal de IA Daily, el procesamiento de noticias se divide en dos fases bien diferenciadas, utilizando exclusivamente la rotación de modelos gratuitos.

### A. Fase 1: Filtro de Relevancia Semántica (IA Rápida)
* **Objetivo**: Evaluar de forma rápida si el titular y resumen de una noticia obtenida del RSS tienen suficiente relevancia temática (umbral semántico de 1 a 10) para justificar su scraping completo.
* **Modelos Utilizados (Ollama Local / OpenRouter Free)**:
  1. *Primer Canal (Local)*: `llama3.2:latest` o `gemma2` ejecutados localmente en Ollama en la CPU de la VPS.
  2. *Segundo Canal (Pool Gratuito OpenRouter)*: Si Ollama local está caído, cae secuencialmente a `meta-llama/llama-3.2-3b-instruct:free` and `google/gemma-2-9b-it:free`.
* **Límites y Llamadas**: Esta fase realiza cientos de llamadas rápidas diarias por cada noticia de los feeds. Al ser peticiones muy cortas, es seguro usar el Tier Gratuito o el Ollama local ya que un error de rate-limit (429) no bloquea la experiencia de lectura.

### B. Fase 2: Scraping, Redacción y Síntesis (IA Principal)
* **Objetivo**: Leer el DOM completo del artículo aprobado, extraer sus multimedia válidos y redactar el resumen, los puntos clave y "por qué importa" en español.
* **Modelo Rotator (Rotación Exclusiva Free)**:
  El scraper utiliza la whitelist en `getAIModelsList()` en `sources.ts`, que contiene una ronda de 11 modelos gratuitos excelentes de OpenRouter.
* **Algoritmo de Fallbacks y Penalizaciones de Tasa**:
  1. **Orden Secuencial**: Intenta primero el modelo preferido (e.g. `meta-llama/llama-3.3-70b-instruct:free`).
  2. **Detección de Error 429**: Si la API devuelve un código de error de Rate Limit (429) o un error de cuota agotada, el motor captura el error de forma silenciosa.
  3. **Penalización Temporal**: Se llama a `reportModelFailure(model)`, añadiendo el modelo al mapa de fallos y penalizándolo por **3 minutos** (`FAILURE_PENALTY_MS = 3 * 60 * 1000`).
  4. **Fallback Inmediato**: La llamada se reintenta inmediatamente con el siguiente modelo de la whitelist que no esté penalizado (e.g., `google/gemini-2.5-flash:free`).
  5. **Contingencia Local**: Si toda la whitelist de modelos gratuitos en la nube está penalizada, el motor utiliza `ollama` local en la CPU de la VPS.
  6. **Smart Fallback**: Si todo falla, inyecta la ficha de contingencia pre-estructurada con el titular original y enlaces, asegurando que la web nunca se rompa.
