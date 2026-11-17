import React from "react";
import { Pencil, Star, Trash2 } from "lucide-react";

const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

const styles = {
  card: {
    overflow: "hidden",
    border: "1px solid #2b2931",
    borderRadius: "12px",
    backgroundColor: "#19181e",
    color: "#f5f3ef"
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: "18px",
    padding: "18px"
  },
  poster: {
    width: "110px",
    minWidth: "110px",
    aspectRatio: "2/3",
    objectFit: "cover",
    border: "1px solid #393740",
    borderRadius: "8px",
    backgroundColor: "#25232b"
  },
  details: {
    flex: "1 1 auto",
    minWidth: 0
  },
  titleRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px"
  },
  title: {
    margin: "2px 0 10px",
    color: "#f5f3ef",
    fontSize: "1.25rem",
    lineHeight: 1.25,
    overflowWrap: "anywhere"
  },
  actions: {
    display: "flex",
    flex: "0 0 auto",
    gap: "8px"
  },
  actionButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 10px",
    border: "1px solid #44414b",
    borderRadius: "8px",
    backgroundColor: "#242229",
    color: "#f0edf4",
    font: "inherit",
    fontSize: "0.84rem",
    fontWeight: 700,
    cursor: "pointer"
  },
  deleteButton: {
    color: "#ffb4b4",
    borderColor: "#6a3338"
  },
  metadata: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "8px 18px",
    color: "#aaa7b2",
    fontSize: "0.9rem"
  },
  rating: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    color: "#f4c96b"
  },
  timestamps: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px 16px",
    marginTop: "10px",
    color: "#85818d",
    fontSize: "0.78rem"
  },
  review: {
    padding: "16px 18px 20px",
    borderTop: "1px solid #2b2931",
    color: "#e1dee6",
    fontSize: "0.96rem",
    lineHeight: 1.65,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere"
  }
};

function getYear(date) {
  return date ? date.slice(0, 4) : "Year unknown";
}

function formatTimestamp(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(date);
}

export default function ReviewCard({ review, userRating, onEdit, onDelete }) {
  const movie = review.movie_data || {};
  const displayedRating = userRating ?? review.user_rating;
  const wasEdited =
    review.updated_at &&
    review.created_at &&
    new Date(review.updated_at).getTime() - new Date(review.created_at).getTime() > 1000;

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete your review of "${movie.title || "this movie"}"? This cannot be undone.`
    );
    if (confirmed) onDelete(review.movie_id);
  }

  return (
    <article style={styles.card}>
      <div style={styles.header}>
        {movie.poster_path ? (
          <img
            src={`${IMAGE_URL}${movie.poster_path}`}
            alt={`${movie.title || "Movie"} poster`}
            style={styles.poster}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.visibility = "hidden";
            }}
          />
        ) : (
          <div
            role="img"
            aria-label="Movie poster unavailable"
            style={{ ...styles.poster, display: "grid", placeItems: "center" }}
          >
            Poster unavailable
          </div>
        )}
        <div style={styles.details}>
          <div style={styles.titleRow}>
            <div style={{ minWidth: 0 }}>
              <h2 style={styles.title}>{movie.title || "Movie details unavailable"}</h2>
              <div style={styles.metadata}>
                <span>{getYear(movie.release_date)}</span>
                <span>{movie.production_company || "Production company unknown"}</span>
                {displayedRating != null && (
                  <span style={styles.rating}>
                    <Star size={15} fill="currentColor" />
                    Your rating: {Number(displayedRating).toFixed(1)}/10
                  </span>
                )}
              </div>
              <div style={styles.timestamps}>
                <span>Reviewed {formatTimestamp(review.created_at)}</span>
                {wasEdited && (
                  <span>Updated {formatTimestamp(review.updated_at)}</span>
                )}
              </div>
            </div>
            <div style={styles.actions}>
              <button
                type="button"
                style={styles.actionButton}
                onClick={() => onEdit(review)}
              >
                <Pencil size={14} />
                Edit
              </button>
              <button
                type="button"
                style={{ ...styles.actionButton, ...styles.deleteButton }}
                onClick={handleDelete}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      <div style={styles.review}>{review.review_text}</div>
    </article>
  );
}
