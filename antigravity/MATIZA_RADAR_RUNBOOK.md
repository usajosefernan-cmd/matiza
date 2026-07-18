# MATIZA RADAR RUNBOOK — MANUAL DEL RADAR SOCIAL

Este documento detalla la operativa periódica para la detección y recolección automatizada de polémicas y narrativas virales en redes sociales en España.

---

## 1. Misión del Radar
Identificar publicaciones en redes sociales (X, Instagram, YouTube, TikTok, Telegram) que:
- Tengan una viralidad emergente significativa (decenas de miles de reproducciones o interacciones).
- Contengan afirmaciones de interés social en España (reformas de leyes, impuestos, sanidad, vivienda).
- Presenten indicios de desinformación, clickbait o sesgo comercial.

---

## 2. Operativa Programada (Schedule 2)
El Schedule del Radar se activa periódicamente (ej. cada hora o diariamente) y realiza lo siguiente:

1. **Escaneo de fuentes del radar:**
   - Consulta la tabla `radar_sources` para recopilar perfiles, canales y keywords críticas en España.
2. **Extracción y agrupamiento (Clustering):**
   - Agrupa publicaciones similares en la tabla `scraped_items` para identificar tendencias.
3. **Cálculo de relevancia (Relevance Gate):**
   - Evalúa si el grupo supera el umbral mínimo de viralidad y relevancia (mediante `01-relevance-gate.js`).
4. **Inserción en la Cola de Verificación:**
   - Si un candidato del radar es catalogado como una narrativa de interés público alta:
     - Crea un trabajo en `verification_jobs` con `job_type = 'social_radar_candidate'` y prioridad `normal`.
     - Deja el trabajo en cola para que el runner lo verifique de forma independiente.
5. **Revisión humana final:**
   - Una vez verificado por el runner, el artículo queda en cola de moderación administrativa para su validación final por un fact-checker humano.
