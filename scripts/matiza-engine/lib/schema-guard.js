export function ensureImprovedSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS topic_candidates (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT,
      why_it_matters TEXT,
      cluster_json TEXT,
      score_json TEXT,
      suggested_topic_id TEXT,
      status TEXT DEFAULT 'pendiente',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS search_audit (
      id TEXT PRIMARY KEY,
      claim_hash TEXT,
      query TEXT,
      provider TEXT,
      result_count INTEGER DEFAULT 0,
      selected_count INTEGER DEFAULT 0,
      payload_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS phase_artifacts (
      id TEXT PRIMARY KEY,
      item_id TEXT,
      phase TEXT NOT NULL,
      payload_json TEXT,
      status TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS social_metrics_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id TEXT NOT NULL,
      captured_at TEXT DEFAULT CURRENT_TIMESTAMP,
      views INTEGER,
      likes INTEGER,
      shares INTEGER,
      comments INTEGER
    );

    CREATE TABLE IF NOT EXISTS whatsapp_submissions (
      id TEXT PRIMARY KEY,
      anonymous_sender_hash TEXT NOT NULL,
      content_type TEXT NOT NULL,
      sanitized_text TEXT,
      media_hash TEXT,
      received_at TEXT DEFAULT CURRENT_TIMESTAMP,
      matched_narrative_id TEXT,
      privacy_status TEXT DEFAULT 'desinfectado'
    );

    CREATE INDEX IF NOT EXISTS idx_topic_candidates_status ON topic_candidates(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_search_audit_claim ON search_audit(claim_hash, created_at);
    CREATE INDEX IF NOT EXISTS idx_phase_artifacts_item ON phase_artifacts(item_id, phase, created_at);
    CREATE INDEX IF NOT EXISTS idx_social_metrics_post ON social_metrics_history(post_id, captured_at);
  `);
}
