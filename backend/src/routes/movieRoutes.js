const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

router.get('/trending', movieController.getTrendingMovies);
router.get('/popular', movieController.getPopularMovies);
router.get('/upcoming', movieController.getUpcomingMovies);
router.get('/now-playing', movieController.getNowPlayingMovies);
router.get('/details/:movieId', movieController.getMovieDetails);
router.get('/details/:movieId/production-company', movieController.getMovieProductionCompany);
router.get('/search', movieController.searchMovies);

module.exports = router;