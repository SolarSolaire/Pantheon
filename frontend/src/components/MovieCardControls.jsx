import React from "react";
import { Bookmark, Eye, Star } from "lucide-react";

const styles = {
  control: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    width: "100%",
    minWidth: 0,
    height: "36px",
    padding: "0 4px",
    border: "1px solid #4a4651",
    borderRadius: "8px",
    backgroundColor: "transparent",
    color: "#f5f3ef",
    cursor: "pointer"
  },
  controlRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    alignItems: "center",
    justifyItems: "center",
    gap: "6px",
    width: "100%",
    marginTop: "8px"
  },
  ratingButton: {
    cursor: "pointer",
    fontSize: "0.76rem",
    fontWeight: "800",
    whiteSpace: "nowrap"
  }
};

export default function MovieCardControls({
  movie,
  userRating,
  isWatched,
  isInWatchlist,
  onToggleWatched,
  onToggleWatchlist,
  onOpenRating
}) {
  const hasUserRating =
    userRating !== undefined && userRating !== null && userRating !== "";

  if (!onToggleWatched && !onOpenRating && !onToggleWatchlist) return null;

  return (
    <>
      <div
        className="movie-card-hover-buffer"
        aria-hidden="true"
        onClick={(event) => event.stopPropagation()}
      />
      <div
        className="movie-card-control-row"
        style={styles.controlRow}
        onClick={(event) => event.stopPropagation()}
      >
        {onToggleWatched ? (
          <button
            className="movie-card-button"
            type="button"
            aria-label={isWatched ? "Mark as unwatched" : "Mark as watched"}
            aria-pressed={isWatched}
            title={isWatched ? "Mark as unwatched" : "Mark as watched"}
            onClick={() => onToggleWatched(movie)}
            style={{
              ...styles.control,
              backgroundColor: isWatched
                ? "rgba(16, 185, 129, 0.08)"
                : "transparent",
              color: "#10b981",
              borderColor: isWatched
                ? "#10b981"
                : "rgba(16, 185, 129, 0.35)",
              boxShadow: isWatched
                ? "0 0 8px rgba(16, 185, 129, 0.65)"
                : "none"
            }}
          >
            <Eye size={16} />
          </button>
        ) : (
          <span />
        )}
        {onOpenRating ? (
          <button
            className="movie-card-button"
            type="button"
            aria-label={
              hasUserRating
                ? `Change your rating for ${movie.title}`
                : `Rate ${movie.title}`
            }
            title={
              hasUserRating
                ? `Your rating: ${userRating} / 10`
                : "Rate this movie"
            }
            onClick={onOpenRating}
            style={{
              ...styles.control,
              ...styles.ratingButton,
              color: "#60a5fa",
              backgroundColor: hasUserRating
                ? "rgba(59, 130, 246, 0.08)"
                : "transparent",
              borderColor: hasUserRating
                ? "#3b82f6"
                : "rgba(59, 130, 246, 0.35)",
              boxShadow: hasUserRating
                ? "0 0 8px rgba(59, 130, 246, 0.65)"
                : "none"
            }}
          >
            <Star size={14} fill={hasUserRating ? "currentColor" : "none"} />
            {hasUserRating && (
              <span style={{ color: "#60a5fa" }}>{userRating}</span>
            )}
          </button>
        ) : (
          <span />
        )}
        {onToggleWatchlist ? (
          <button
            className="movie-card-button"
            type="button"
            aria-label={
              isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
            }
            aria-pressed={isInWatchlist}
            title={
              isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
            }
            onClick={() => onToggleWatchlist(movie)}
            style={{
              ...styles.control,
              backgroundColor: isInWatchlist
                ? "rgba(244, 201, 107, 0.08)"
                : "transparent",
              color: "#f4c96b",
              borderColor: isInWatchlist
                ? "#f4c96b"
                : "rgba(244, 201, 107, 0.35)",
              boxShadow: isInWatchlist
                ? "0 0 8px rgba(244, 201, 107, 0.45)"
                : "none"
            }}
          >
            <Bookmark
              size={16}
              fill={isInWatchlist ? "currentColor" : "none"}
            />
          </button>
        ) : (
          <span />
        )}
      </div>
    </>
  );
}
