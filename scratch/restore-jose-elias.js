import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

const backupDbPath = '/tmp/matiza.db.before-jose-recovery';
const activeDbPath = process.env.MATIZA_DB_PATH || process.env.SQLITE_DB_PATH || '/home/ubuntu/db/matiza/matiza.db';

console.log('Starting restoration of José Elías article...');

const backupDb = new DatabaseSync(backupDbPath);
const activeDb = new DatabaseSync(activeDbPath);

// 1. Read local JSON files
const articulo = JSON.parse(fs.readFileSync('articulo_jose_elias.json', 'utf8'));
const verificacion = JSON.parse(fs.readFileSync('verificacion_jose_elias_extended.json', 'utf8'));
const socialCopies = JSON.parse(fs.readFileSync('social_copies_verificacion.json', 'utf8'));

// 2. Fetch data from backup database
const articleId = 'art-1784259708415-907';
const backupArticle = backupDb.prepare('SELECT * FROM articles WHERE id = ?').get(articleId);
if (!backupArticle) {
  console.error('Article not found in backup database!');
  process.exit(1);
}

const backupSources = backupDb.prepare('SELECT * FROM sources WHERE article_id = ?').all(articleId);
const backupReviews = backupDb.prepare('SELECT * FROM reviews WHERE article_id = ?').all(articleId);
const backupArticleTopics = backupDb.prepare('SELECT * FROM article_topics WHERE article_id = ?').all(articleId);
const backupArticleTags = backupDb.prepare('SELECT * FROM article_tags WHERE article_id = ?').all(articleId);
const backupSocialPosts = backupDb.prepare('SELECT * FROM social_posts WHERE article_id = ?').all(articleId);

const tagIds = backupArticleTags.map(at => at.tag_id);
const backupTags = [];
if (tagIds.length > 0) {
  const placeholders = tagIds.map(() => '?').join(',');
  const tags = backupDb.prepare(`SELECT * FROM tags WHERE id IN (${placeholders})`).all(...tagIds);
  backupTags.push(...tags);
}

// 3. Build updated article row
const updatedArticle = {
  ...backupArticle,
  title: articulo.title,
  subtitle: articulo.subtitle,
  summary: articulo.summary,
  explanation: articulo.explanation,
  trick_used: articulo.trick_used,
  matiza_score: articulo.matiza_score,
  emoji_tag: articulo.emoji_tag,
  infographic_svg: articulo.infographic_svg,
  
  verdict: verificacion.fact_check.verdict.toLowerCase(),
  confidence: verificacion.fact_check.confidence,
  what_is_true: verificacion.fact_check.what_is_true,
  what_is_false: verificacion.fact_check.what_is_false,
  what_lacks_context: verificacion.fact_check.what_lacks_context,
  what_is_not_proven: verificacion.fact_check.what_is_not_proven,
  
  status: 'borrador',
  human_review_required: 1,
  published_at: null
};

// 4. Build updated review row
const updatedReviews = backupReviews.map(rev => {
  const checklist = {
    fuente_original_suficiente: false,
    veredicto_coherente: false,
    titular_neutral: false,
    no_acusacion_sin_prueba: false,
    no_riesgo_legal_evidente: false,
    encaja_vertical_correcto: false,
    merece_publicarse: false
  };
  return {
    ...rev,
    status: 'pendiente',
    checklist_json: JSON.stringify(checklist)
  };
});

// 5. Build updated social posts
const updatedSocialPosts = backupSocialPosts.map(post => {
  const match = socialCopies.find(c => c.platform.toLowerCase() === post.platform.toLowerCase());
  return {
    ...post,
    content: match ? match.content : post.content,
    status: 'borrador',
    scheduled_at: null,
    published_at: null,
    external_id: null
  };
});

// 6. Write to active database using a transaction
activeDb.exec('BEGIN TRANSACTION;');
try {
  // Clean existing in active DB
  activeDb.prepare('DELETE FROM article_topics WHERE article_id = ?').run(articleId);
  activeDb.prepare('DELETE FROM article_tags WHERE article_id = ?').run(articleId);
  activeDb.prepare('DELETE FROM reviews WHERE article_id = ?').run(articleId);
  activeDb.prepare('DELETE FROM sources WHERE article_id = ?').run(articleId);
  activeDb.prepare('DELETE FROM social_posts WHERE article_id = ?').run(articleId);
  activeDb.prepare('DELETE FROM articles WHERE id = ?').run(articleId);

  // Insert updated article
  const articleKeys = Object.keys(updatedArticle);
  const articlePlaceholders = articleKeys.map(() => '?').join(',');
  const insertArticleSql = `
    INSERT INTO articles (${articleKeys.join(', ')})
    VALUES (${articlePlaceholders})
  `;
  const articleValues = articleKeys.map(k => updatedArticle[k]);
  activeDb.prepare(insertArticleSql).run(...articleValues);
  console.log('Inserted article into active database.');

  // Insert tags (INSERT OR IGNORE)
  const insertTag = activeDb.prepare(`
    INSERT OR IGNORE INTO tags (id, slug, name)
    VALUES (?, ?, ?)
  `);
  for (const tag of backupTags) {
    insertTag.run(tag.id, tag.slug, tag.name);
  }
  console.log('Inserted tags.');

  // Insert article_tags
  const insertArticleTag = activeDb.prepare(`
    INSERT INTO article_tags (article_id, tag_id)
    VALUES (?, ?)
  `);
  for (const at of backupArticleTags) {
    insertArticleTag.run(at.article_id, at.tag_id);
  }
  console.log('Inserted article_tags relations.');

  // Insert article_topics
  const insertArticleTopic = activeDb.prepare(`
    INSERT INTO article_topics (article_id, topic_id)
    VALUES (?, ?)
  `);
  for (const at of backupArticleTopics) {
    insertArticleTopic.run(at.article_id, at.topic_id);
  }
  console.log('Inserted article_topics relations.');

  // Insert sources
  const sourceKeys = ['id', 'article_id', 'title', 'url', 'source_type', 'authority_level', 'quote_or_summary', 'date_accessed'];
  const sourcePlaceholders = sourceKeys.map(() => '?').join(',');
  const insertSource = activeDb.prepare(`
    INSERT INTO sources (${sourceKeys.join(', ')})
    VALUES (${sourcePlaceholders})
  `);
  for (const src of backupSources) {
    const srcValues = sourceKeys.map(k => src[k]);
    insertSource.run(...srcValues);
  }
  console.log('Inserted sources.');

  // Insert reviews
  const reviewKeys = ['id', 'article_id', 'reviewer', 'checklist_json', 'status', 'notes', 'created_at'];
  const reviewPlaceholders = reviewKeys.map(() => '?').join(',');
  const insertReview = activeDb.prepare(`
    INSERT INTO reviews (${reviewKeys.join(', ')})
    VALUES (${reviewPlaceholders})
  `);
  for (const rev of updatedReviews) {
    const revValues = reviewKeys.map(k => rev[k]);
    insertReview.run(...revValues);
  }
  console.log('Inserted reviews.');

  // Insert social posts
  const postKeys = ['id', 'article_id', 'platform', 'format', 'content', 'status', 'scheduled_at', 'published_at', 'external_id'];
  const postPlaceholders = postKeys.map(() => '?').join(',');
  const insertPost = activeDb.prepare(`
    INSERT INTO social_posts (${postKeys.join(', ')})
    VALUES (${postPlaceholders})
  `);
  for (const post of updatedSocialPosts) {
    const postValues = postKeys.map(k => post[k]);
    insertPost.run(...postValues);
  }
  console.log('Inserted social posts.');

  // Ensure user_submissions and scraped_items have correct state
  activeDb.prepare("UPDATE user_submissions SET status = 'en_cola' WHERE id = 'sub-1784082709958-691'").run();
  activeDb.prepare("UPDATE scraped_items SET status = 'procesado' WHERE id = 'sub-1784082709958-691'").run();
  console.log('Updated user_submissions and scraped_items status.');

  activeDb.exec('COMMIT;');
  console.log('Transaction committed successfully! Restoration complete.');
} catch (err) {
  activeDb.exec('ROLLBACK;');
  console.error('Error during transaction, rolled back:', err);
  process.exit(1);
} finally {
  backupDb.close();
  activeDb.close();
}
