import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { logoutUser } from "../api/userData";
import useUserRatings from "../hooks/useUserRatings";
import useUserWatchlist from "../hooks/useUserWatchlist";
import MovieGrid from "../components/MovieGrid";
import Navbar from "../components/Navbar";

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "40px clamp(20px, 5vw, 72px)"
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "800",
    margin: "0 0 24px",
    color: "#f5f3ef"
  },
  message: {
    textAlign: "center",
    padding: "18px",
    color: "#aaa7b2",
    backgroundColor: "#19181e",
    borderRadius: "10px",
    border: "1px solid #2b2931",
    marginBottom: "20px"
  },
  error: {
    color: "#ffb4b4",
    backgroundColor: "#2e1a1c",
    borderColor: "#6a3338"
  },
  emptyState: {
    display: "grid",
    justifyItems: "center",
    padding: "64px 20px",
    backgroundColor: "#19181e",
    borderRadius: "12px",
    border: "1px solid #2b2931",
    textAlign: "center"
  },
  emptyTitle: {
    fontSize: "1.15rem",
    color: "#f5f3ef",
    margin: "16px 0 6px"
  },
  emptySubtitle: {
    fontSize: "0.9rem",
    color: "#aaa7b2",
    margin: 0
  }
};

export default function Watched() {
  const navigate = useNavigate();
  const [removedMovies, setRemovedMovies] = useState({});
  const [movieOrder, setMovieOrder] = useState([]);
  const { userRatings, ratingsError, handleSaveRating, handleClearRating } =
    useUserRatings();
  const {
    userTitles,
    watchlistError,
    watchlistLoading,
    handleToggleWatchlist,
    handleToggleWatched
  } = useUserWatchlist();
  const watchedMovies = userTitles
    .filter((movie) => movie.watched)
    .sort((a, b) => new Date(b.watched_at) - new Date(a.watched_at));
  const currentMovies = [...watchedMovies, ...Object.values(removedMovies)];
  useEffect(() => {
    setMovieOrder((previous) => {
      const knownIds = new Set(previous);
      const next = [...previous];
      const moviesToOrder = [
        ...userTitles
          .filter((movie) => movie.watched)
          .sort((a, b) => new Date(b.watched_at) - new Date(a.watched_at)),
        ...Object.values(removedMovies)
      ];
      moviesToOrder.forEach((movie) => {
        const id = String(movie.id);
        if (!knownIds.has(id)) {
          knownIds.add(id);
          next.push(id);
        }
      });
      return next.length === previous.length ? previous : next;
    });
  }, [userTitles, removedMovies]);
  const orderById = new Map(movieOrder.map((id, index) => [id, index]));
  const movies = [...currentMovies].sort(
    (first, second) =>
      (orderById.get(String(first.id)) ?? Number.MAX_SAFE_INTEGER) -
      (orderById.get(String(second.id)) ?? Number.MAX_SAFE_INTEGER)
  );

  async function removeFromWatched(movie) {
    if (await handleToggleWatched(movie)) {
      setRemovedMovies((previous) => ({
        ...previous,
        [String(movie.id)]: movie
      }));
    }
  }

  async function undoRemoval(movie) {
    if (await handleToggleWatched(movie)) {
      setRemovedMovies((previous) => {
        const next = { ...previous };
        delete next[String(movie.id)];
        return next;
      });
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Could not revoke user session:", error);
    }
  }

  return (
    <div>
      <Navbar
        actions={[
          { label: "Home", onClick: () => navigate("/home") },
          { label: "Watchlist", onClick: () => navigate("/watchlist") },
          { label: "Account", onClick: () => navigate("/profile") },
          { label: "Logout", onClick: handleLogout }
        ]}
      />
      <main style={styles.container}>
        <h1 style={styles.title}>Movies Watched</h1>
        {watchlistError && (
          <div style={{ ...styles.message, ...styles.error }}>{watchlistError}</div>
        )}
        {ratingsError && (
          <div style={{ ...styles.message, ...styles.error }}>{ratingsError}</div>
        )}
        {!watchlistError && watchlistLoading && (
          <div style={styles.message}>Loading watched movies...</div>
        )}
        {!watchlistError && !watchlistLoading && movies.length === 0 && (
          <div style={styles.emptyState}>
            <Eye size={44} color="#10b981" />
            <h2 style={styles.emptyTitle}>No watched movies yet</h2>
            <p style={styles.emptySubtitle}>
              Mark a movie as watched and it will appear here.
            </p>
          </div>
        )}
        {!watchlistLoading && movies.length > 0 && (
          <MovieGrid
            movies={movies}
            userRatings={userRatings}
            userTitles={userTitles}
            showWatchedIndicator={false}
            onToggleWatchlist={handleToggleWatchlist}
            onToggleWatched={removeFromWatched}
            onSaveRating={handleSaveRating}
            onClearRating={handleClearRating}
            removedMovieIds={Object.keys(removedMovies)}
            onUndoRemoval={undoRemoval}
          />
        )}
      </main>
    </div>
  );
}
