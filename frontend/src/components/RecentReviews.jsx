import React from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

function formatTimestamp(value) {
  if (!value) return "Time unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Time unknown"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(date);
}

export default function RecentReviews({
  reviews,
  loading,
  error,
  collapsed,
  onToggle
}) {
  return (
    <aside
      className={`recent-reviews${collapsed ? " is-collapsed" : ""}`}
      aria-label="Recent reviews"
    >
      <div className="recent-reviews-inner">
        <div className="recent-reviews-header">
          <button
            type="button"
            className="recent-reviews-toggle"
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Show recent reviews" : "Hide recent reviews"}
            title={collapsed ? "Show recent reviews" : "Hide recent reviews"}
            onClick={onToggle}
          >
            {collapsed ? (
              <ChevronLeft size={16} aria-hidden="true" />
            ) : (
              <ChevronRight size={16} aria-hidden="true" />
            )}
          </button>
          {!collapsed && <h2 className="recent-reviews-heading">Recent Reviews</h2>}
        </div>
        {!collapsed && (
          <>
            {loading && <p className="recent-reviews-message">Loading reviews...</p>}
            {!loading && error && (
              <p className="recent-reviews-message is-error">{error}</p>
            )}
            {!loading && !error && reviews.length === 0 && (
              <p className="recent-reviews-message">No reviews yet.</p>
            )}
            {!loading && !error && reviews.length > 0 && (
              <div className="recent-reviews-list">
                {reviews.map((review) => (
                  <article className="recent-review" key={review.review_id}>
                    <Link
                      className="recent-review-movie"
                      to={`/movies/${review.movie_id}`}
                    >
                      {review.movie_data?.title || "Movie details unavailable"}
                    </Link>
                    <span className="recent-review-author">
                      by {review.username || "User"}
                    </span>
                    <time
                      className="recent-review-timestamp"
                      dateTime={review.created_at || undefined}
                    >
                      {formatTimestamp(review.created_at)}
                    </time>
                    {review.user_rating != null && (
                      <div className="recent-review-rating">
                        <Star size={12} fill="currentColor" aria-hidden="true" />
                        {Number(review.user_rating).toFixed(1)}/10
                      </div>
                    )}
                    <p className="recent-review-text">{review.review_text}</p>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
