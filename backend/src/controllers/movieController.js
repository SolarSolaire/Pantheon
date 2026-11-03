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
