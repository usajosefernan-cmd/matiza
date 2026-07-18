# ⚙️ MATIZA Engine: Motor de Verificación y Contexto

MATIZA Engine es un motor de análisis e inferencia estructurado en fases modulares e independientes que automatizan el análisis de afirmaciones virales.

---

## 🏛️ Estructura del Motor

Cada fase opera con contratos de entrada y salida JSON bien definidos, lo que permite el aislamiento, la re-ejecución y la mitigación de fallas:

1. **`00-hot-topics-cron.js`**: Monitoriza redes en busca de tendencias o debates de alto impacto público.
2. **`01-relevance-gate.js`**: Filtra el ruido e ignora noticias periodísticas ordinarias enfocándose en claims con indicios de desinformación.
3. **`02-semantic-router.js`**: Clasifica el claim y lo enruta al expediente temático o vertical vivo correspondiente.
4. **`03-source-strategy-planner.js`**: Planifica qué tipo de fuentes primarias (BOE, INE, AEAT, RETA, SEPE) y búsquedas se requieren.
5. **`04-noise-filter.js`**: Limpia y normaliza el claim antes de la extracción profunda.
6. **`05-claim-extractor.js`**: Extrae la afirmación factual principal del texto.
7. **`06-evidence-finder.js`**: Busca evidencias y recupera extractos de datos oficiales.
8. **`07-verifier.js`**: Contrasta las afirmaciones frente a la evidencia acumulada asignando veredictos no binarios.
9. **`08-article-writer.js`**: Redacta el artículo explicativo con tono neutral e independiente.
10. **`09-quality-gate.js`**: Evalúa que el análisis cumpla con el código deontológico de la FAPE y el tono del manual.
11. **`10-review-queue.js`**: Pone los artículos aprobados o los que requieren verificación humana en la cola editorial.
12. **`11-social-writer.js`**: Genera plantillas formateadas para la difusión del desmentido en X o Telegram.
13. **`12-topic-updater.js`**: Actualiza el termómetro, tags e información del tema en la base de datos principal.

---

## 🏃‍♀️ Ejecución y Orquestadores (Crons)

Los runners orquestan y programan el flujo de trabajo:
- **`run-daily.js`**: Cron diario para actualización de expedientes históricos y revisión profunda.
- **`run-hourly.js`**: Cron horario para el escaneo continuo y recolección de claims.
- **`run-manual-item.js`**: Permite reprocesar o auditar un único elemento desde el panel editorial introduciendo `--itemId=ID`.
