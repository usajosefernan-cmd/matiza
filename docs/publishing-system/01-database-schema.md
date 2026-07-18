# 🗄️ Esquema de Base de Datos y Relaciones (Matiza)

El motor de Matiza utiliza una base de datos relacional SQLite local con soporte para lectura/escritura de alta concurrencia (`journal_mode = WAL` y claves foráneas activas). A continuación se detalla la estructura y el propósito de cada tabla implicada en el sistema de publicación.

---

## 1. Tabla: `articles` (Noticias y Desmentidos de Claims)
Es el núcleo del sistema. Almacena el veredicto final de la auditoría de un claim, el artículo redactado por la IA, el truco de manipulación detectado y las referencias multimedia.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Identificador único (`art-` + timestamp + random). |
| `topic_id` | TEXT | FOREIGN KEY | Tema/expediente principal (compatibilidad heredada). |
| `slug` | TEXT | UNIQUE, NOT NULL | URL amigable generada a partir del título. |
| `title` | TEXT | NOT NULL | Título formal y neutral de la verificación. |
| `subtitle` | TEXT | - | Subtítulo explicativo del marco legal/veredicto. |
| `claim` | TEXT | - | Afirmación viral exacta que está siendo auditada. |
| `origin_platform`| TEXT | - | Red social o plataforma origen (YouTube, TikTok, Telegram, X). |
| `origin_url` | TEXT | - | Enlace directo a la publicación viral original. |
| `origin_summary` | TEXT | - | Resumen del contexto del canal o publicación. |
| `category` | TEXT | NOT NULL | Categoría general (Economía, Inmigración, Vivienda). |
| `verdict` | TEXT | NOT NULL | Veredicto deontológico (Verdadero, Falso, Falta Contexto). |
| `confidence` | TEXT | - | Nivel de confianza del análisis (Baja, Media, Alta). |
| `summary` | TEXT | - | Resumen de auditoría (para lectura rápida). |
| `explanation` | TEXT | - | Cuerpo detallado de la verificación en párrafos. |
| `what_is_true` | TEXT | - | Bloque explícito de datos verídicos contrastados. |
| `what_is_false` | TEXT | - | Bloque explícito de falsedades demostradas. |
| `what_lacks_context`| TEXT| - | Bloque explicícito de sesgos o matices omitidos. |
| `status` | TEXT | DEFAULT 'borrador' | Estado del artículo ('borrador', 'publicado'). |
| `published_at` | TEXT | - | Marca de tiempo ISO de publicación en el portal. |
| `origin_date` | TEXT | - | Fecha de publicación original del post en redes. |
| `multimedia_url` | TEXT | - | Enlace a la imagen/vídeo adjunto auditado. |
| `multimedia_type`| TEXT | - | Tipo de multimedia ('image', 'video'). |
| `trick_used` | TEXT | - | Técnica detectada (ej. 'cherry-picking', 'falso dilema'). |
| `matiza_score` | INTEGER| DEFAULT 0 | Termómetro de bulo/riesgo en España (0 a 100). |
| `emoji_tag` | TEXT | - | Emoji de categoría visual (ej. "📉 Dato tramposo"). |
| `infographic_svg`| TEXT | - | Código SVG nativo autogenerado para la infografía visual. |
| `created_at` | TEXT | NOT NULL | Timestamp de inserción automática. |
| `updated_at` | TEXT | NOT NULL | Timestamp de última edición automática. |

---

## 2. Tabla: `topics` (Expedientes / Temas)
Define las verticales temáticas o expedientes vivos donde se agrupan los desmentidos según el debate social en España.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Identificador único (ej. `t-economia`, `t-vivienda`). |
| `slug` | TEXT | UNIQUE, NOT NULL | URL amigable del expediente en el portal. |
| `title` | TEXT | NOT NULL | Nombre formal del expediente vivo. |
| `description` | TEXT | - | Descripción detallada de las dinámicas del vertical. |
| `category` | TEXT | - | Categoría a la que pertenece el tema. |
| `status` | TEXT | DEFAULT 'activo' | Estado del vertical ('activo', 'pausado'). |

---

## 3. Tabla Asociativa: `article_topics` (Múltiples Expedientes)
Permite que un desmentido de claim pertenezca a **uno o varios expedientes simultáneamente** (relación Muchos-a-Muchos), respondiendo a temas de naturaleza transversal (por ejemplo: vivienda e impuestos).

```sql
CREATE TABLE IF NOT EXISTS article_topics (
  article_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  PRIMARY KEY (article_id, topic_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);
```

---

## 4. Tabla: `sources` (Fuentes Oficiales y Auditoría)
Almacena los enlaces a los documentos oficiales de la administración del Estado (INE, BOE, EPA, etc.) utilizados por la IA para desmentir el claim.

```sql
CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type TEXT, -- 'oficial', 'prensa', 'estudio'
  authority_level TEXT, -- 'Alta', 'Media', 'Baja'
  quote_or_summary TEXT, -- Cita literal o resumen del dato
  date_accessed TEXT NOT NULL,
  FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE
);
```
