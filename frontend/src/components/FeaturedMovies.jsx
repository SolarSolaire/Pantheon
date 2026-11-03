import React from "react";
import MovieGrid from "./MovieGrid";
import styles from "../styles.jsx";

export default function FeaturedMovies({
  movies,
  loading,
  error,
  watchlist,
  watchlistError,
  userRatings,
  onSelectMovie,
  onToggleWatchlist,
  onSaveRating,
  onClearRating
}) {
  return (
    <section id="movies">
      <h2 style={styles.home.sectionTitle}>Featured Movies</h2>
      {watchlistError && (
        <div style={{ ...styles.home.statusMessage, ...styles.home.errorMessage }}>
          {watchlistError}
        </div>
      )}

      {loading && <div style={styles.home.statusMessage}>Loading movies...</div>}

      {!loading && error && (
        <div style={{ ...styles.home.statusMessage, ...styles.home.errorMessage }}>
          {error}
        </div>
      )}

      {!loading && !error && movies.length > 0 && (
        <MovieGrid
          movies={movies}
          userRatings={userRatings}
          watchlist={watchlist}
          onSelect={onSelectMovie}
          onToggleWatchlist={onToggleWatchlist}
          onSaveRating={onSaveRating}
          onClearRating={onClearRating}
        />
      )}
    </section>
  );
}
