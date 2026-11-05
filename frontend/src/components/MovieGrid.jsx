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
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          userRating={userRatings[movie.id]}
          isInWatchlist={watchlist.some((item) => item.id === movie.id)}
          onSelect={onSelect}
          onToggleWatchlist={onToggleWatchlist}
          onSaveRating={onSaveRating}
          onClearRating={onClearRating}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
