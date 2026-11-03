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
  missingYearLabel
}) {
  return (
    <div style={styles.shared.grid}>
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          userRating={userRatings[movie.id] ?? movie.user_rating}
          isInWatchlist={watchlist.some((item) => item.id === movie.id)}
          onSelect={onSelect}
          onToggleWatchlist={onToggleWatchlist}
          onSaveRating={onSaveRating}
          onClearRating={onClearRating}
          onRemove={onRemove}
          missingYearLabel={missingYearLabel}
        />
      ))}
    </div>
  );
}
