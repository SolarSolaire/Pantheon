import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { logoutUser } from "../api/userData";
import useUserRatings from "../hooks/useUserRatings";
import useUserWatchlist from "../hooks/useUserWatchlist";
import MovieGrid from "../components/MovieGrid";
import Navbar from "../components/Navbar";

const watchlistStyles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "40px clamp(20px, 5vw, 72px)"
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "800",
    margin: "0 0 24px 0",
    color: "#f5f3ef"
  },
  statusMessage: {
    textAlign: "center",
    padding: "18px",
    color: "#aaa7b2",
    backgroundColor: "#19181e",
    borderRadius: "10px",
    border: "1px solid #2b2931",
    marginBottom: "20px"
  },
  errorMessage: {
    color: "#ffb4b4",
    backgroundColor: "#2e1a1c",
    borderColor: "#6a3338"
  },
  emptyState: {
    textAlign: "center",
    padding: "64px 20px",
    backgroundColor: "#19181e",
    borderRadius: "12px",
    border: "1px solid #2b2931"
  },
  emptyTitle: {
    fontSize: "1.15rem",
    color: "#f5f3ef",
    margin: "16px 0 6px 0"
  },
  emptySubtitle: {
    fontSize: "0.9rem",
    color: "#aaa7b2",
    margin: "0 0 20px 0"
  },
  primaryButton: {
    backgroundColor: "#f4c96b",
    color: "#17140d",
    border: "none",
    padding: "10px 20px",
    borderRadius: "9px",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontWeight: "800"
  }
};

export default function Watchlist() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [removedMovies, setRemovedMovies] = useState({});
  const { userRatings, ratingsError, handleSaveRating, handleClearRating } =
    useUserRatings();
  const {
    userTitles,
    watchlistError: error,
    watchlistLoading,
    handleToggleWatchlist,
    handleToggleWatched
  } = useUserWatchlist();
  const movies = [
    ...userTitles.filter((movie) => movie.in_watchlist),
    ...Object.values(removedMovies)
  ];

  async function removeFromWatchlist(movie) {
    if (await handleToggleWatchlist(movie)) {
      setRemovedMovies((previous) => ({
        ...previous,
        [String(movie.id)]: movie
      }));
    }
  }

  async function undoRemoval(movie) {
    if (await handleToggleWatchlist(movie)) {
      setRemovedMovies((previous) => {
        const next = { ...previous };
        delete next[String(movie.id)];
        return next;
      });
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/search?query=${encodeURIComponent(query)}` : "/search");
  }

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (logoutError) {
      console.error("Could not revoke user session:", logoutError);
    }
    navigate("/login", { replace: true });
  }

  return (
    <div>
      <Navbar
        searchProps={{
          value: search,
          onChange: setSearch,
          onSubmit: handleSearchSubmit
        }}
        actions={[
          { label: "Home", onClick: () => navigate("/home") },
          { label: "Reviews", onClick: () => navigate("/reviews") },
          { label: "Account", onClick: () => navigate("/profile") },
          { label: "Logout", onClick: handleLogout }
        ]}
      />

      <main style={watchlistStyles.container}>
        <h1 style={watchlistStyles.title}>My Watchlist</h1>
        {error && (
          <div
            style={{
              ...watchlistStyles.statusMessage,
              ...watchlistStyles.errorMessage
            }}
          >
            {error}
          </div>
        )}
        {ratingsError && (
          <div
            style={{
              ...watchlistStyles.statusMessage,
              ...watchlistStyles.errorMessage
            }}
          >
            {ratingsError}
          </div>
        )}

        {!error && watchlistLoading && (
          <div style={watchlistStyles.statusMessage}>Loading watchlist...</div>
        )}

        {!error && !watchlistLoading && movies.length === 0 && (
          <div style={watchlistStyles.emptyState}>
            <Bookmark size={44} color="#f4c96b" />
            <h2 style={watchlistStyles.emptyTitle}>Your watchlist is empty</h2>
            <p style={watchlistStyles.emptySubtitle}>
              Add movies from Home or Search and they will appear here.
            </p>
            <button
              type="button"
              onClick={() => navigate("/home")}
              style={watchlistStyles.primaryButton}
            >
              Browse movies
            </button>
          </div>
        )}

        {!watchlistLoading && movies.length > 0 && (
          <MovieGrid
            movies={movies}
            userRatings={userRatings}
            userTitles={userTitles}
            onToggleWatchlist={removeFromWatchlist}
            onToggleWatched={handleToggleWatched}
            onSaveRating={handleSaveRating}
            onClearRating={handleClearRating}
            onRemove={removeFromWatchlist}
            removedMovieIds={Object.keys(removedMovies)}
            onUndoRemoval={undoRemoval}
          />
        )}
      </main>
    </div>
  );
}
