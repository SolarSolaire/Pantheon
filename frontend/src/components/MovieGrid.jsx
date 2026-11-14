import React from "react";
import MovieCard from "./MovieCard";
import styles from "../styles.jsx";

export default function MovieGrid({
  movies,
  userRatings = {},
  userTitles = [],
  showWatchedIndicator = true,
  onSelect,
  onToggleWatchlist,
  onToggleWatched,
  onSaveRating,
  onClearRating,
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
            isInWatchlist={Boolean(userTitle?.in_watchlist)}
            isWatched={Boolean(userTitle?.watched)}
            showWatchedIndicator={showWatchedIndicator}
            onSelect={onSelect}
            onToggleWatchlist={onToggleWatchlist}
            onToggleWatched={onToggleWatched}
            onSaveRating={onSaveRating}
            onClearRating={onClearRating}
            onRemove={onRemove}
            isRemoved={removedMovieIds.includes(String(movie.id))}
            onUndoRemoval={onUndoRemoval}
          />
        );
      })}
    </div>
  );
}
