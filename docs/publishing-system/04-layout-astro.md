# 🎨 Maquetación Astro Premium y Reproductor de Vídeo Blindado (slug.astro)

La interfaz de detalle del desmentido en Astro combina rich aesthetics, semántica estructurada SEO y un motor dinámico para resolver enlaces sociales e infografías SVG.

---

## 1. Carga de Múltiples Expedientes (Muchos-a-Muchos)
En lugar de restringirse al expediente principal de la noticia, el frontmatter consulta la tabla asociativa `article_topics` para cargar todas las colecciones donde se integra el artículo y pintarlas en la cabecera:

```typescript
// Cargar artículo
const article = db.prepare(`
  SELECT a.*, t.title as topic_title, t.slug as topic_slug
  FROM articles a
  LEFT JOIN topics t ON a.topic_id = t.id
  WHERE a.slug = ? AND a.status = 'publicado'
`).get(slug) as any;

// Cargar todos los temas asociados al artículo (muchos-a-muchos)
let articleTopics = [] as any[];
if (article) {
  articleTopics = db.prepare(`
    SELECT t.title, t.slug 
    FROM article_topics at
    JOIN topics t ON at.topic_id = t.id
    WHERE at.topic_id = t.id
    WHERE at.article_id = ? AND t.status = 'activo'
  `).all(article.id) as any[];
}
```

---

## 2. Migas de Pan Cyberpunk con Soporte Multi-Tema
Las migas de pan mapean los múltiples expedientes vinculados, presentándolos visualmente en la cabecera separados por un signo de suma `+` de neón:

```html
<div class="breadcrumbs">
  <a href="/">Radar</a>
  <span>/</span>
  <a href="/temas">Expedientes</a>
  <span>/</span>
  {articleTopics.map((topic, tIdx) => (
    <span key={topic.slug}>
      {tIdx > 0 && <span class="divider">+</span>}
      <a href={`/tema/${topic.slug}`}>{topic.title}</a>
    </span>
  ))}
  <span>/</span>
  <span>{article.title}...</span>
</div>
```

---

## 3. Blindaje de Reproducción de Vídeo (YouTube / Telegram)
Para prevenir fallos en la renderización de vídeos en redes, el frontmatter extrae el `youtubeId` fáctico directamente del `origin_url` de la base de datos sin depender de estados simulados o APIs externas:

```typescript
let directYoutubeId = '';
if (article && article.origin_url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\/shorts\/)([^#\&\?]*).*/;
  const match = article.origin_url.match(regExp);
  if (match && match[2].length === 11) {
    directYoutubeId = match[2];
  }
}
```

En la maquetación HTML, si `directYoutubeId` existe, se inyecta de forma garantizada el reproductor de vídeo responsivo de YouTube con bordes redondeados y sombras neón rojas:

```html
{directYoutubeId && (
  <div class="video-container">
    <iframe 
      src={`https://www.youtube.com/embed/${directYoutubeId}`} 
      allowfullscreen
    ></iframe>
  </div>
)}
```

---

## 4. Inyección de Infografías SVG Nativas
La infografía SVG se inyecta utilizando el tag especial `<Fragment set:html={...} />` de Astro, el cual procesa el código SVG directo almacenado en SQLite sin escapar caracteres:

```html
<div class="infographic-container">
  {article.infographic_svg ? (
    <Fragment set:html={article.infographic_svg} />
  ) : (
    <!-- SVG estático de fallback -->
    <svg viewBox="0 0 800 240">...</svg>
  )}
</div>
```
