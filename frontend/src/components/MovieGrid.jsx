import React from "react";
import MovieCard from "./MovieCard";
import styles from "../styles.jsx";

const EMPTY_REVIEWED_MOVIE_IDS = new Set();

export default function MovieGrid({
  movies,
  userRatings = {},
  userTitles = [],
  reviewedMovieIds = EMPTY_REVIEWED_MOVIE_IDS,
  onSelect,
  onToggleWatchlist,
  onToggleWatched,
  onSaveRating,
  onClearRating,
  onReviewSaved,
  onRemove,
  removedMovieIds = [],
  onUndoRemoval,
  gridStyle,
  gridRef
}) {
  return (
    <div ref={gridRef} style={{ ...styles.shared.grid, ...gridStyle }}>
      {movies.map((movie) => {
        const userTitle = userTitles.find(
          (item) => String(item.id) === String(movie.id)
        );
        return (
          <MovieCard
            key={movie.id}
            movie={movie}
            userRating={userRatings[movie.id]}
            hasReview={reviewedMovieIds.has(String(movie.id))}
            isInWatchlist={Boolean(userTitle?.in_watchlist)}
            isWatched={Boolean(userTitle?.watched)}
            onSelect={onSelect}
            onToggleWatchlist={onToggleWatchlist}
            onToggleWatched={onToggleWatched}
            onSaveRating={onSaveRating}
            onClearRating={onClearRating}
            onReviewSaved={onReviewSaved}
            onRemove={onRemove}
            isRemoved={removedMovieIds.includes(String(movie.id))}
            onUndoRemoval={onUndoRemoval}
          />
        );
      })}
    </div>
  );
}
