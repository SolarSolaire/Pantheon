const express = require('express');
const userDataController = require('../controllers/userDataController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);
router.get('/statistics', userDataController.getStatistics);
router.get('/ratings', userDataController.getRatings);
router.put('/ratings/:movieId', userDataController.saveRating);
router.delete('/ratings/:movieId', userDataController.clearRating);
router.get('/watchlist', userDataController.getWatchlist);
router.post('/watchlist', userDataController.addWatchlistMovie);
router.put('/watchlist/:movieId/watched', userDataController.markWatchlistMovieWatched);
router.delete('/watchlist/:movieId', userDataController.removeWatchlistMovie);
router.get('/reviews', userDataController.getReviews);
router.get('/reviews/:movieId', userDataController.getReview);
router.put('/reviews/:movieId', userDataController.saveReview);
router.delete('/reviews/:movieId', userDataController.deleteReview);

module.exports = router;
