const db = require('./db');

async function createCurrentSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMPTZ NOT NULL,
      revoked_at TIMESTAMPTZ
    )
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS auth_sessions_user_id_idx
      ON auth_sessions (user_id)
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS titles (
      title_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tmdb_id BIGINT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      media_type TEXT NOT NULL DEFAULT 'movie',
      overview TEXT,
      release_date DATE,
      poster_path TEXT,
      production_company TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS user_titles (
      tracking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      title_id UUID NOT NULL REFERENCES titles(title_id) ON DELETE CASCADE,
      in_watchlist BOOLEAN NOT NULL DEFAULT TRUE,
      watched BOOLEAN NOT NULL DEFAULT FALSE,
      added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      watched_at TIMESTAMPTZ,
      UNIQUE (user_id, title_id),
      CHECK (in_watchlist OR watched),
      CHECK (
        (watched AND watched_at IS NOT NULL) OR
        (NOT watched AND watched_at IS NULL)
      )
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS user_feedback (
      feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      title_id UUID NOT NULL REFERENCES titles(title_id) ON DELETE CASCADE,
      rating NUMERIC(3, 1)
        CHECK (rating IS NULL OR (rating >= 1 AND rating <= 10)),
      review_text TEXT
        CHECK (
          review_text IS NULL OR
          length(trim(review_text)) BETWEEN 1 AND 5000
        ),
      review_created_at TIMESTAMPTZ,
      review_updated_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, title_id),
      CHECK (rating IS NOT NULL OR review_text IS NOT NULL)
    )
  `);
}

async function initializeDatabase() {
  const client = await db.pool.connect();
  try {
    await createCurrentSchema(client);
  } finally {
    client.release();
  }
}

module.exports = initializeDatabase;
