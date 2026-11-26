import React from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

export default function RecentReviews({
  reviews = [],
  loading = false,
  error = ""
}) {
  return (
    <section className="recent-reviews-section">
      <div className="recent-reviews-header">
        <h2 className="recent-reviews-heading">Recent Reviews</h2>
      </div>

      {loading && <p className="recent-reviews-message">Loading recent reviews...</p>}

      {!loading && error && (
        <p className="recent-reviews-message is-error">{error}</p>
      )}

      {!loading && !error && reviews.length === 0 && (
        <p className="recent-reviews-message">No recent reviews.</p>
      )}

      {!loading && !error && reviews.length > 0 && (
        <div className="recent-reviews-list">
          {reviews.map((review) => (
            <article key={review.review_id} className="recent-review-card">
              <div className="recent-review-title-row">
                <Link
                  to={`/movies/${review.movie_id}`}
                  className="recent-review-movie"
                  title={review.movie_data?.title || "Unknown Movie"}
                >
                  {review.movie_data?.title || "Unknown Movie"}
                </Link>
                {review.user_rating != null && (
                  <div className="recent-review-rating">
                    <Star size={12} fill="#f4c96b" color="#f4c96b" />
                    <span>{review.user_rating}/10</span>
                  </div>
                )}
              </div>
              <p className="recent-review-text">{review.review_text}</p>
              <div className="recent-review-meta">
                <span className="recent-review-author">by {review.username}</span>
                <span className="recent-review-timestamp">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}