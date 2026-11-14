const tmdbService = require('../services/tmdbService');

function getPage(query) {
  const parsedPage = Number.parseInt(query.page, 10);
  return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

async function sendResults(res, request) {
  try {
    const data = await request();
    res.json({ results: data.results || [] });
  } catch (error) {
    console.error('TMDB request failed:', error.message);
    res.status(error.status || 502).json({
      message: error.message || 'TMDB is temporarily unavailable.'
    });
  }
}

exports.getTrendingMovies = (req, res) =>
  sendResults(res, () => tmdbService.getTrendingTitles(getPage(req.query)));

exports.getPopularMovies = (req, res) =>
  sendResults(res, () => tmdbService.getPopularTitles(getPage(req.query)));

exports.getUpcomingMovies = (req, res) =>
  sendResults(res, () => tmdbService.getUpcomingTitles(getPage(req.query)));

exports.getNowPlayingMovies = (req, res) =>
  sendResults(res, () => tmdbService.getNowPlayingTitles(getPage(req.query)));

exports.getMovieDetails = async (req, res) => {
  const { movieId } = req.params;
  if (!/^\d+$/.test(movieId)) {
    return res.status(400).json({ message: 'A valid movie ID is required.' });
  }
  try {
    res.json({ movie: await tmdbService.getMoviePageDetails(movieId) });
  } catch (error) {
    console.error(`TMDB details request failed for movie ${movieId}:`, error.message);
    res.status(error.status || 502).json({
      message: error.message || 'TMDB is temporarily unavailable.'
    });
  }
};

exports.getMovieProductionCompany = async (req, res) => {
  const { movieId } = req.params;
  if (!/^\d+$/.test(movieId)) {
    return res.status(400).json({ message: 'A valid movie ID is required.' });
  }
  try {
    res.json({ productionCompany: await tmdbService.getProductionCompany(movieId) });
  } catch (error) {
    console.error(`TMDB details request failed for movie ${movieId}:`, error.message);
    res.status(error.status || 502).json({
      message: error.message || 'TMDB is temporarily unavailable.'
    });
  }
};

exports.searchMovies = (req, res) => {
  const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
  if (!query) {
    return res.status(400).json({ message: 'A movie search query is required.' });
  }
  return sendResults(res, () => tmdbService.searchTitles(query));
};
