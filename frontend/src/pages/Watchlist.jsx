import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { isAuthenticated } from "../utils/auth";
import { fetchUserProfile, logoutUser } from "../api/userData";
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
  // New state to hold the current user's profile data
  const [currentUser, setCurrentUser] = useState(null);
  
  const [search, setSearch] = useState("");
  const [removedMovies, setRemovedMovies] = useState({});
  const [movieOrder, setMovieOrder] = useState([]);
  const { userRatings, ratingsError, handleSaveRating, handleClearRating } =
    useUserRatings();
  const {
    userTitles,
    reviewedMovieIds,
    markMovieReviewed,
    watchlistError: error,
    watchlistLoading,
    handleToggleWatchlist,
    handleToggleWatched
  } = useUserWatchlist();
  
  const currentMovies = [
    ...userTitles.filter((movie) => movie.in_watchlist),
    ...Object.values(removedMovies)
  ];
  
  // Authentication and user loading effect
  useEffect(() => {
    const redirectIfSignedOut = () => {
      if (!isAuthenticated()) {
        navigate("/login", { replace: true });
        return false;
      }
      return true;
    };

    const loadUser = async () => {
      if (redirectIfSignedOut()) {
        try {
          const profile = await fetchUserProfile();
          setCurrentUser(profile);
        } catch (error) {
          console.error("Failed to load user profile:", error);
        }
      }
    };

    loadUser();

    window.addEventListener("storage", redirectIfSignedOut);
    window.addEventListener("focus", redirectIfSignedOut);
    return () => {
      window.removeEventListener("storage", redirectIfSignedOut);
      window.removeEventListener("focus", redirectIfSignedOut);
    };
  }, [navigate]);

  useEffect(() => {
    setMovieOrder((previous) => {
      const knownIds = new Set(previous);
      const next = [...previous];
      const moviesToOrder = [
        ...userTitles.filter((movie) => movie.in_watchlist),
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

  async function handleAuthAction() {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Could not revoke user session:", error);
    }
    navigate("/login", { replace: true });
  }

  return (
    <div>
      <Navbar
        // Pass the fetched user's name (or username) to the Navbar
        userName={currentUser?.name || currentUser?.username}
        searchProps={{
          value: search,
          onChange: setSearch,
          onSubmit: handleSearchSubmit
        }}
        actions={[
          { label: "Home", onClick: () => navigate("/home") },
          { label: "Watchlist", onClick: () => navigate("/watchlist") },
          { label: "Reviews", onClick: () => navigate("/reviews") },
          { label: "Account", onClick: () => navigate("/profile") },
          { label: "Logout", onClick: handleAuthAction }
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
            reviewedMovieIds={reviewedMovieIds}
            onReviewSaved={markMovieReviewed}
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