import React from "react";
import MovieCard from "./MovieCard";
import styles from "../styles.jsx";

export default function MovieGrid({
  movies,
  userRatings = {},
  watchlist = [],
  onSelect,
  onToggleWatchlist,
  onSaveRating,
  onClearRating,
  onRemove,
  gridStyle,
  gridRef
}) {
  return (
    <div ref={gridRef} style={{ ...styles.shared.grid, ...gridStyle }}>
      {movies.map((movie) => {
        const watchlistMovie = watchlist.find(
          (item) => String(item.id) === String(movie.id)
        );
        return (
          <MovieCard
            key={movie.id}
            movie={movie}
            userRating={userRatings[movie.id]}
            isInWatchlist={Boolean(watchlistMovie)}
            isWatched={Boolean(watchlistMovie?.watched)}
            onSelect={onSelect}
            onToggleWatchlist={onToggleWatchlist}
            onSaveRating={onSaveRating}
            onClearRating={onClearRating}
            onRemove={onRemove}
          />
        );
      })}
    </div>
  );
}
