const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

router.get('/trending', movieController.getTrendingMovies);
router.get('/search', movieController.searchMovies);

module.exports = router;