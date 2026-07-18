# Plan de Reestructuración de Navegación y Jerarquía — MATIZA

**Estado:** Borrador v2 para revisión (2026-07-15)
**Regla dura:** ✅ Se mantienen TODOS los nombres de expediente existentes. No se renombra ni se crea ningún expediente.
**Impacto:** Menús de `Layout.astro`, modelo de datos (BD), rutas, breadcrumbs.

---

## 1. Jerarquía objetivo (semántica)

```
TEMA (nivel superior · va en el menú)
  └─ EXPEDIENTE (dossier "vivo")  ← nombre EXACTO, no se toca
        └─ HILO / CASO (artículo de desmentido)
              └─ TAGS (transversales, no jerárquicos)
```

- El **hilo** pertenece a 1 expediente principal y puede colgar de varios vía `article_topics` (N:M, ya existe).
- El **expediente** cuelga de 1 tema. **Su nombre no cambia.**
- El **tag** es transversal: pinchar un tag → todos los hilos con ese tag (hoy NO es sistema real, es `LIKE` de texto).

---

## 2. Temas de nivel superior (menú)

| Tema (menú) | Qué agrupa |
|---|---|
| **Tu Dinero y Hacienda** | Bolsillo ciudadano: impuestos, empleo, pensiones, vivienda, jornada |
| **Convivencia y Servicios** | Sociedad, educación, cultura, inmigración, obras, malestar social |
| **Salud Pública** | Sanidad y listas de espera (destacado por relevancia) |
| **Historia y Territorio** | Memoria, terrorismo, Cataluña y concierto económico |
| **Justicia y Corrupción** | Casos judiciales con interés público |
| **Desinformación y Bulos** | Fenómenos virales y teorías conspirativas |
| **Antes de Votar** *(político)* | SOLO herramientas: Programas · Comparador · Bienes |
| **Última Hora** *(feed)* | Feed cronológico de todos los hilos (link a `/actualidad`) |

**Links directos (no temáticos):** `Interceptor` · `Radar` · `ADMIN` · búsqueda.

### 2b. Antes de Votar (sección política cerrada — NO contiene expedientes)
Es una **sección de herramientas de contraste electoral**, no un contenedor de expedientes. Los casos judiciales (Koldo, Begoña Gómez, etc.) van a *Justicia y Corrupción*, no aquí. Su dropdown agrupa solo las 3 herramientas ya existentes:

| Sub-enlace | Ruta | Contenido real (verificado) |
|---|---|---|
| **Programas Electorales** | `/programas-politicos` | "Análisis y traducción a lenguaje claro de los programas electorales de los partidos principales de España" (H1: *Programas Electorales 2023*). Incluye link a Declaración de Bienes. |
| **Comparador de Hechos** | `/comparador-politico` | "Compara de forma objetiva las propuestas electorales e impactos de los partidos políticos en España por temáticas" — es el "lo que hicieron cuando gobernaron". |
| **Bienes y Patrimonios** | `/bienes-declarados` | Declaración de Bienes de Líderes políticos. |

### 2c. Última Hora (feed cronológico — link directo, no dropdown)
Es el **feed de todos los hilos publicados en orden cronológico inverso**. Reemplaza la etiqueta "Actualidad" en el menú; la ruta se conserva (`/actualidad`).

| Propiedad | Valor |
|---|---|
| Ruta | `/actualidad` (etiqueta de menú → "Última Hora"; ruta sin cambios) |
| Origen de datos | `articles WHERE status='publicado' ORDER BY published_at DESC, created_at DESC` (query ya existente en `actualidad.astro`) |
| H1 actual | "Feed de Actualidad" → cambiar a "Última Hora" |
| Comportamiento | Link directo en menú (sin desplegable). Muestra todos los hilos de todos los temas/expedientes. |
| Filtro futuro (opcional) | Chips de filtro por tema/expediente sobre el mismo feed. |

---

## 3. Mapa de los 27 expedientes → tema (nombres EXACTOS)

### 🔹 Tu Dinero y Hacienda (8)
1. Autónomos y Fiscalidad
2. Cifras de Paro y Empleo
3. Financiación Autonómica Desigual
4. Inflación y Coste de Vida
5. Pensiones y Sostenibilidad
6. Reducción de Jornada Laboral a 37.5h
7. Salarios, SMI y Mercado Laboral
8. Tope al Alquiler (Ley de Vivienda)

### 🔹 Convivencia y Servicios (7)
9. Cultura: Subvenciones, Cine y Bono Cultural
10. Educación: Leyes, Reformas y Rendimiento
11. Inmigración, Delincuencia y Ayudas
12. Reforma de Ley de Extranjería (Reparto de Menores)
13. Seguridad en obras públicas y prevención de derrumbes
14. Percepción de la Situación Actual de España
15. Percepción del Estado General del País y Malestar Social

### 🔹 Salud Pública (1)
16. Sanidad Pública vs Privada

### 🔹 Historia y Territorio (5)
17. Cataluña, independencia y amnistía
18. Concierto Económico de Cataluña
19. Memoria de ETA y Terrorismo
20. Mitos y Leyendas del Franquismo
21. Memoria Histórica y su Instrumentalización Política

### 🔹 Justicia y Corrupción (4)
22. Caso Koldo y Sentencia del Tribunal Supremo
23. Investigación Judicial a Begoña Gómez
24. Casos Judiciales y Alegaciones de Corrupción en el Entorno del Presidente
25. Casos de Corrupción y Nepotismo en el Entorno del Gobierno

### 🔹 Desinformación y Bulos (2)
26. Misterioso Fenómeno Azul en España: ¿Satélite Chino o Teoría Conspirativa?
27. Teorías Conspirativas y Desinformación Viral

> **Antes de Votar** (no expedientes, solo herramientas): Programas Electorales · Comparador de Hechos · Bienes y Patrimonios.
> **Última Hora**: feed cronológico (`/actualidad`).

---

## 4. Cambios de nombre de menús (UI, no de expedientes)

- `Actualidad` → **Última Hora** (link a `/actualidad`; ruta se conserva, cambia la etiqueta).
- `Políticos ▼` → **Antes de Votar ▼** (agrupa solo las 3 herramientas políticas).
- `Expedientes Vivos ▼` (lista plana de 27) → **desaparece como lista plana**; los 27 expedientes se reparten en los 6 temas de arriba. La página índice `/temas` queda como "mapa completo".

### Mockup del menú superior
```
MATIZA [DEONTOLÓGICO]
[ Tu Dinero y Hacienda ▼ ] [ Convivencia y Servicios ▼ ] [ Salud Pública ▼ ]
[ Historia y Territorio ▼ ] [ Justicia y Corrupción ▼ ] [ Desinformación y Bulos ▼ ]
[ Antes de Votar ▼ ] [ Última Hora ] [ Interceptor ]              [🔍] [ADMIN]
   └─ cada ▼ despliega SUS expedientes (los 27 repartidos), no los 27 sueltos
```

---

## 5. Corrección de clasificación (sin tocar nombres)

⚠️ **Hallazgo:** los 3 artículos de Jose Elías (vivienda/juventud) cuelgan hoy de **"Autónomos y Fiscalidad"** por `topic_id`.
✅ **Acción:** reasignar esos 3 hilos a **"Tope al Alquiler (Ley de Vivienda)"** (expediente ya existente, slug `ley-de-vivienda-alquileres`). No se crea ni renombra nada.

---

## 6. Modelo de datos — cambios necesarios

| Tabla | Cambio |
|---|---|
| `themes` (NUEVA) | `id`, `slug`, `name`, `orden`. Temas de nivel superior (los 6 + Antes de Votar + Última Hora como especiales). |
| `topics` | Añadir `theme_id` (FK → themes). **El campo `title` NO se modifica** (regla dura). |
| `tags` (NUEVA) | `id`, `slug`, `name`. Sistema real de etiquetas. |
| `article_tags` (NUEVA) | N:M artículo↔tag. Sustituye el `LIKE` actual de `/tag/[slug]`. |

**Estrategia de creación de tags: SOBRE LA MARCHA (on-the-fly).** No hay taxonomía cerrada ni lista predefinida. Cuando un editor asigna una etiqueta a un artículo y esta no existe en `tags`, se auto-crea (se normaliza el `slug`). El vínculo se registra en `article_tags`. Así el flujo editorial no tiene fricción: se escribe el tag y ya existe su página `/tag/[slug]`. Para evitar duplicados por mayúsculas/acentos se aplica normalización (minúsculas, quitar acentos, `_`→`-`) en el `slug`. |
| `article_topics` | Ya existe (N:M artículo↔expediente). Se usa para hilos en varios expedientes. |
| `articles` | `category` debe reflejar el **expediente** (no la temática amplia). Migrar datos. |

### Rutas
- `/tema/[slug]` → ya existe (expediente → hilos). Se conserva.
- **NUEVA `/seccion/[slug]`** (o `/tema-superior/[slug]`) → tema → lista de expedientes.
- `/tag/[slug]` → pasa de `LIKE` a join con `article_tags`.
- `/temas` → índice de los 27 expedientes (mapa completo).
- `/actualidad` → se renombra a "Última Hora" en UI (ruta se conserva).

### Breadcrumb del artículo
`Tema › Expediente › Hilo` (hoy es `Radar / Expedientes / <expediente>`).

---

## 7. Pasos de implementación (fases)

1. **Crear `themes`** y asignar `theme_id` a cada uno de los 27 expedientes según tabla del punto 3 (sin alterar `title`).
2. **Reasignar los 3 artículos de Jose Elías** de `Autónomos y Fiscalidad` → `Tope al Alquiler (Ley de Vivienda)`.
3. **Migrar `articles.category`** para que apunte al expediente correcto.
4. **Crear `tags` + `article_tags`** y poblar desde `emoji_tag`/palabras clave existentes.
5. **Reescribir el menú de `Layout.astro`**: query agrupada `themes → topics`; renombrar `Actualidad`→`Última Hora` y `Políticos`→`Antes de Votar`; aplicar igual al drawer móvil y bottom-nav.
6. **Nueva página de sección** `/seccion/[slug]`.
7. **Actualizar breadcrumbs** en artículo, expediente y tag.
8. **Verificar** con `npm run build` + SSR en todas las rutas.

---

## 8. Abierto / pendiente de decidir
- **Nombre del tema económico:** "Tu Dinero y Hacienda" vs "Economía" (propuesta mantiene el primero para no sonar a periódico).
- **"Concierto Económico de Cataluña"** está en *Historia y Territorio* por vínculo catalán, pero es "Política/Economía"; podría ir a *Tu Dinero y Hacienda*.
- **"Salud Pública"** queda con 1 expediente; ¿fusionarlo en *Convivencia y Servicios* o mantenerlo destacado? (Propuesta: mantenerlo propio por relevancia de tráfico).
- Las dos entradas de **"Percepción…"** se agrupan en *Convivencia y Servicios* (malestar social); revisar si merecen tema propio.
