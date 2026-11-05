const axios = require('axios');

const TMDB_API_URL = 'https://api.themoviedb.org/3';

async function getTmdbResults(path, params, res) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    res.status(503).json({ message: 'TMDB is not configured on the server.' });
    return;
  }

  try {
    const response = await axios.get(`${TMDB_API_URL}${path}`, {
      params: { ...params, api_key: apiKey },
      headers: { Accept: 'application/json' },
      timeout: 10000
    });
    res.json({ results: response.data.results || [] });
  } catch (error) {
    const tmdbStatus = error.response?.status;
    console.error('TMDB request failed:', tmdbStatus || error.message);
    res.status(502).json({
      message: tmdbStatus
        ? `TMDB request failed: ${tmdbStatus}`
        : 'TMDB is temporarily unavailable.'
    });
  }
}

exports.getTrendingMovies = (req, res) =>
  getTmdbResults('/trending/movie/week', { language: 'en-US' }, res);

exports.getPopularMovies = (req, res) =>
  getTmdbResults('/movie/popular', { language: 'en-US' }, res);

exports.getUpcomingMovies = (req, res) => {
  const dateParts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
      .formatToParts(new Date())
      .map(({ type, value }) => [type, value])
  );
  const today = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;

  return getTmdbResults(
    '/discover/movie',
    {
      'with_origin_country': 'US',
      'with_original_language': 'en',
      'language': 'en-US',
      'region': 'US',
      'primary_release_date.gte': today,
      'with_release_type': '3|2', // Theatrical
      'with_runtime.gte': 40,
      'sort_by': 'popularity.desc',
      'include_adult': false
    },
    res
  );
};

exports.getNowPlayingMovies = (req, res) =>
  getTmdbResults('/movie/now_playing', { language: 'en-US' }, res);

exports.getMovieProductionCompany = async (req, res) => {
  const { movieId } = req.params;
  if (!/^\d+$/.test(movieId)) {
    return res.status(400).json({ message: 'A valid movie ID is required.' });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ message: 'TMDB is not configured on the server.' });
  }

  try {
    const response = await axios.get(`${TMDB_API_URL}/movie/${movieId}`, {
      params: { api_key: apiKey, language: 'en-US' },
      headers: { Accept: 'application/json' },
      timeout: 10000
    });
    res.json({
      productionCompany: response.data.production_companies?.[0]?.name || null
    });
  } catch (error) {
    const tmdbStatus = error.response?.status;
    console.error('TMDB movie details request failed:', tmdbStatus || error.message);
    res.status(502).json({
      message: tmdbStatus
        ? `TMDB request failed: ${tmdbStatus}`
        : 'TMDB is temporarily unavailable.'
    });
  }
};

exports.searchMovies = (req, res) => {
  const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
  if (!query) {
    return res.status(400).json({ message: 'A movie search query is required.' });
  }
  return getTmdbResults(
    '/search/movie',
    { query, language: 'en-US', page: 1, include_adult: false },
    res
  );
};
