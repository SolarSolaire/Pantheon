const db = require('../config/db');
const statisticsService = require('../services/statisticsService');

function getMovieId(value) {
  const movieId = String(value ?? '');
  return /^\d+$/.test(movieId) ? movieId : null;
}

function getMovieData(value, movieId) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  if (String(value.id) !== movieId || typeof value.title !== 'string' || !value.title.trim()) {
    return null;
  }
  return {
    id: Number(movieId),
    title: value.title.trim(),
    media_type: typeof value.media_type === 'string' ? value.media_type : 'movie',
    overview: typeof value.overview === 'string' ? value.overview : '',
    release_date: typeof value.release_date === 'string' ? value.release_date : '',
    poster_path: typeof value.poster_path === 'string' ? value.poster_path : null,
    production_company:
      typeof value.production_company === 'string' ? value.production_company : null
  };
}

async function upsertTitle(movieData) {
  const releaseDate = /^\d{4}-\d{2}-\d{2}$/.test(movieData.release_date)
    ? movieData.release_date
    : null;
  const result = await db.query(
    `INSERT INTO titles (
       tmdb_id, name, media_type, overview, release_date, poster_path,
       production_company, updated_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
     ON CONFLICT (tmdb_id)
     DO UPDATE SET name = EXCLUDED.name,
                   media_type = EXCLUDED.media_type,
                   overview = EXCLUDED.overview,
                   release_date = EXCLUDED.release_date,
                   poster_path = EXCLUDED.poster_path,
                   production_company = EXCLUDED.production_company,
                   updated_at = CURRENT_TIMESTAMP
     RETURNING title_id`,
    [
      movieData.id,
      movieData.title,
      movieData.media_type,
      movieData.overview || null,
      releaseDate,
      movieData.poster_path,
      movieData.production_company
    ]
  );
  return result.rows[0].title_id;
}

async function getWatchlistMovies(userId) {
  const result = await db.query(
    `SELECT titles.tmdb_id AS id, titles.name AS title,
            titles.media_type, titles.overview,
            titles.release_date::text AS release_date, titles.poster_path,
            user_titles.status, user_titles.watched_at, user_titles.added_at
     FROM user_titles
     JOIN titles USING (title_id)
     WHERE user_titles.user_id = $1
     ORDER BY user_titles.added_at, titles.tmdb_id`,
    [userId]
  );
  return result.rows.map(({ status, ...movie }) => ({
    ...movie,
    watched: status === 'watched'
  }));
}

async function handleDatabaseError(res, message, operation) {
  try {
    await operation();
  } catch (error) {
    console.error(message, error);
    if (!res.headersSent) res.status(500).json({ message });
  }
}

exports.getStatistics = (req, res) =>
  handleDatabaseError(res, 'Could not load user statistics.', async () => {
    res.json({ statistics: await statisticsService.getStatistics(req.user.user_id) });
  });

exports.getRatings = (req, res) =>
  handleDatabaseError(res, 'Could not load user ratings.', async () => {
    const result = await db.query(
      `SELECT titles.tmdb_id AS movie_id, user_feedback.rating
       FROM user_feedback
       JOIN titles USING (title_id)
       WHERE user_feedback.user_id = $1 AND user_feedback.rating IS NOT NULL`,
      [req.user.user_id]
    );
    const ratings = Object.fromEntries(
      result.rows.map(({ movie_id, rating }) => [movie_id, Number(rating)])
    );
    res.json({ ratings });
  });

exports.saveRating = (req, res) => {
  const movieId = getMovieId(req.params.movieId);
  const rating = Number(req.body?.rating);
  const movieData = req.body?.movie ? getMovieData(req.body.movie, movieId) : null;
  if (!movieId) return res.status(400).json({ message: 'A valid movie ID is required.' });
  if (!Number.isFinite(rating) || rating < 1 || rating > 10) {
    return res.status(400).json({ message: 'Ratings must be between 1 and 10.' });
  }
  if (req.body?.movie && !movieData) {
    return res.status(400).json({ message: 'Valid movie details are required to save a rating.' });
  }

  return handleDatabaseError(res, 'Could not save user rating.', async () => {
    let titleId;
    if (movieData) {
      titleId = await upsertTitle(movieData);
    } else {
      const existingTitle = await db.query(
        'SELECT title_id FROM titles WHERE tmdb_id = $1',
        [movieId]
      );
      titleId = existingTitle.rows[0]?.title_id;
      if (!titleId) {
        titleId = await upsertTitle({
          id: Number(movieId),
          title: `Movie ${movieId}`,
          media_type: 'movie',
          overview: '',
          release_date: '',
          poster_path: null,
          production_company: null
        });
      }
    }
    await db.query(
      `INSERT INTO user_feedback (user_id, title_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, title_id)
       DO UPDATE SET rating = EXCLUDED.rating, updated_at = CURRENT_TIMESTAMP`,
      [req.user.user_id, titleId, rating]
    );
    res.json({ rating });
  });
};

exports.clearRating = (req, res) => {
  const movieId = getMovieId(req.params.movieId);
  if (!movieId) return res.status(400).json({ message: 'A valid movie ID is required.' });

  return handleDatabaseError(res, 'Could not clear user rating.', async () => {
    await db.query(
      `DELETE FROM user_feedback
       USING titles
       WHERE user_feedback.title_id = titles.title_id
         AND user_feedback.user_id = $1
         AND titles.tmdb_id = $2
         AND user_feedback.review_text IS NULL`,
      [req.user.user_id, movieId]
    );
    await db.query(
      `UPDATE user_feedback
       SET rating = NULL, updated_at = CURRENT_TIMESTAMP
       FROM titles
       WHERE user_feedback.title_id = titles.title_id
         AND user_feedback.user_id = $1
         AND titles.tmdb_id = $2
         AND user_feedback.review_text IS NOT NULL`,
      [req.user.user_id, movieId]
    );
    res.status(204).end();
  });
};

exports.getWatchlist = (req, res) =>
  handleDatabaseError(res, 'Could not load watchlist.', async () => {
    const movies = await getWatchlistMovies(req.user.user_id);
    res.json({ movies });
  });

exports.addWatchlistMovie = (req, res) => {
  const movieId = getMovieId(req.body?.id);
  const movieData = getMovieData(req.body, movieId);
  if (!movieData) return res.status(400).json({ message: 'A valid movie with an ID and title is required.' });

  return handleDatabaseError(res, 'Could not add movie to watchlist.', async () => {
    const titleId = await upsertTitle(movieData);
    await db.query(
      `INSERT INTO user_titles (user_id, title_id, status)
       VALUES ($1, $2, 'watchlist')
       ON CONFLICT (user_id, title_id)
       DO UPDATE SET status = 'watchlist', watched_at = NULL`,
      [req.user.user_id, titleId]
    );
    res.json({ movies: await getWatchlistMovies(req.user.user_id) });
  });
};

exports.markWatchlistMovieWatched = (req, res) => {
  const movieId = getMovieId(req.params.movieId);
  if (!movieId) return res.status(400).json({ message: 'A valid movie ID is required.' });

  return handleDatabaseError(res, 'Could not mark movie as watched.', async () => {
    await db.query(
      `UPDATE user_titles
       SET status = 'watched',
           watched_at = COALESCE(watched_at, CURRENT_TIMESTAMP)
       FROM titles
       WHERE user_titles.title_id = titles.title_id
         AND user_titles.user_id = $1
         AND titles.tmdb_id = $2`,
      [req.user.user_id, movieId]
    );
    res.json({ movies: await getWatchlistMovies(req.user.user_id) });
  });
};

exports.removeWatchlistMovie = (req, res) => {
  const movieId = getMovieId(req.params.movieId);
  if (!movieId) return res.status(400).json({ message: 'A valid movie ID is required.' });

  return handleDatabaseError(res, 'Could not remove movie from watchlist.', async () => {
    await db.query(
      `DELETE FROM user_titles
       USING titles
       WHERE user_titles.title_id = titles.title_id
         AND user_titles.user_id = $1
         AND titles.tmdb_id = $2`,
      [req.user.user_id, movieId]
    );
    res.json({ movies: await getWatchlistMovies(req.user.user_id) });
  });
};

function getReviewText(value) {
  if (typeof value !== 'string') return null;
  const reviewText = value.trim();
  return reviewText && reviewText.length <= 5000 ? reviewText : null;
}

function getReviewMovieData(value, movieId) {
  return getMovieData(value, movieId);
}

async function getReviewByMovie(userId, movieId) {
  const result = await db.query(
    `SELECT user_feedback.feedback_id AS review_id,
            titles.tmdb_id AS movie_id, user_feedback.review_text,
            jsonb_build_object(
              'id', titles.tmdb_id,
              'title', titles.name,
              'media_type', titles.media_type,
              'overview', titles.overview,
              'release_date', titles.release_date,
              'poster_path', titles.poster_path,
              'production_company', titles.production_company
            ) AS movie_data,
            user_feedback.review_created_at AS created_at,
            user_feedback.review_updated_at AS updated_at,
            user_feedback.rating AS user_rating
     FROM user_feedback
     JOIN titles USING (title_id)
     WHERE user_feedback.user_id = $1 AND titles.tmdb_id = $2
       AND user_feedback.review_text IS NOT NULL`,
    [userId, movieId]
  );
  const review = result.rows[0];
  if (!review) return null;
  return {
    ...review,
    user_rating: review.user_rating == null ? null : Number(review.user_rating)
  };
}

exports.getReviews = (req, res) =>
  handleDatabaseError(res, 'Could not load reviews.', async () => {
    const result = await db.query(
      `SELECT user_feedback.feedback_id AS review_id,
              titles.tmdb_id AS movie_id, user_feedback.review_text,
              jsonb_build_object(
                'id', titles.tmdb_id,
                'title', titles.name,
                'media_type', titles.media_type,
                'overview', titles.overview,
                'release_date', titles.release_date,
                'poster_path', titles.poster_path,
                'production_company', titles.production_company
              ) AS movie_data,
              user_feedback.review_created_at AS created_at,
              user_feedback.review_updated_at AS updated_at,
              user_feedback.rating AS user_rating
       FROM user_feedback
       JOIN titles USING (title_id)
       WHERE user_feedback.user_id = $1 AND user_feedback.review_text IS NOT NULL
       ORDER BY user_feedback.review_updated_at DESC, user_feedback.feedback_id DESC`,
      [req.user.user_id]
    );
    res.json({
      reviews: result.rows.map((review) => ({
        ...review,
        movie_data: review.movie_data || {
          id: Number(review.movie_id),
          title: 'Movie details unavailable'
        },
        user_rating: review.user_rating == null ? null : Number(review.user_rating)
      }))
    });
  });

exports.getReview = (req, res) => {
  const movieId = getMovieId(req.params.movieId);
  if (!movieId) return res.status(400).json({ message: 'A valid movie ID is required.' });

  return handleDatabaseError(res, 'Could not load review.', async () => {
    res.json({ review: await getReviewByMovie(req.user.user_id, movieId) });
  });
};

exports.saveReview = (req, res) => {
  const movieId = getMovieId(req.params.movieId);
  const reviewText = getReviewText(req.body?.review_text);
  const movieData = getReviewMovieData(req.body?.movie, movieId);
  if (!movieId) return res.status(400).json({ message: 'A valid movie ID is required.' });
  if (!reviewText) {
    return res.status(400).json({
      message: 'Reviews must contain 1 to 5000 non-whitespace characters.'
    });
  }
  if (!movieData) {
    return res.status(400).json({ message: 'Valid movie details are required for a review.' });
  }

  return handleDatabaseError(res, 'Could not save review.', async () => {
    const titleId = await upsertTitle(movieData);
    await db.query(
      `INSERT INTO user_feedback (
         user_id, title_id, review_text, review_created_at, review_updated_at
       )
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, title_id)
       DO UPDATE SET review_text = EXCLUDED.review_text,
                     review_created_at = COALESCE(
                       user_feedback.review_created_at,
                       CURRENT_TIMESTAMP
                     ),
                     review_updated_at = CURRENT_TIMESTAMP,
                     updated_at = CURRENT_TIMESTAMP`,
      [req.user.user_id, titleId, reviewText]
    );
    res.json({ review: await getReviewByMovie(req.user.user_id, movieId) });
  });
};

exports.deleteReview = (req, res) => {
  const movieId = getMovieId(req.params.movieId);
  if (!movieId) return res.status(400).json({ message: 'A valid movie ID is required.' });

  return handleDatabaseError(res, 'Could not delete review.', async () => {
    await db.query(
      `DELETE FROM user_feedback
       USING titles
       WHERE user_feedback.title_id = titles.title_id
         AND user_feedback.user_id = $1
         AND titles.tmdb_id = $2
         AND user_feedback.rating IS NULL`,
      [req.user.user_id, movieId]
    );
    await db.query(
      `UPDATE user_feedback
       SET review_text = NULL,
           review_created_at = NULL,
           review_updated_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       FROM titles
       WHERE user_feedback.title_id = titles.title_id
         AND user_feedback.user_id = $1
         AND titles.tmdb_id = $2
         AND user_feedback.rating IS NOT NULL`,
      [req.user.user_id, movieId]
    );
    res.status(204).end();
  });
};
