const db = require('../config/db');

class StatisticsService {
  async calculateMoviesWatched(userId) {
    const result = await db.query(
      "SELECT COUNT(*)::integer AS count FROM user_titles WHERE user_id = $1 AND status = 'watched'",
      [userId]
    );
    return result.rows[0].count;
  }

  async calculateAverageRating(userId) {
    const result = await db.query(
      'SELECT AVG(rating)::numeric(3, 1) AS average FROM user_feedback WHERE user_id = $1 AND rating IS NOT NULL',
      [userId]
    );
    return result.rows[0].average == null ? null : Number(result.rows[0].average);
  }

  async getRatingSummary(userId) {
    const result = await db.query(
      `SELECT COUNT(*)::integer AS count,
              MIN(rating)::numeric(3, 1) AS lowest,
              MAX(rating)::numeric(3, 1) AS highest
       FROM user_feedback
       WHERE user_id = $1 AND rating IS NOT NULL`,
      [userId]
    );
    const summary = result.rows[0];
    return {
      count: summary.count,
      lowest: summary.lowest == null ? null : Number(summary.lowest),
      highest: summary.highest == null ? null : Number(summary.highest)
    };
  }

  async getStatistics(userId) {
    const [moviesWatched, averageRating, ratingSummary, reviewCount] =
      await Promise.all([
        this.calculateMoviesWatched(userId),
        this.calculateAverageRating(userId),
        this.getRatingSummary(userId),
        db.query(
          'SELECT COUNT(*)::integer AS count FROM user_feedback WHERE user_id = $1 AND review_text IS NOT NULL',
          [userId]
        )
      ]);
    return {
      moviesWatched,
      averageRating,
      ratings: ratingSummary,
      reviews: reviewCount.rows[0].count
    };
  }
}

module.exports = new StatisticsService();
