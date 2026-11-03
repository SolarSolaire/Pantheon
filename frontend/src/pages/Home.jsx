import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthentication, isAuthenticated } from "../utils/auth";
import { loadUserWatchlist, saveUserWatchlist } from "../utils/watchlist";
import { MovieDetailsDialog } from "../components/MovieCard";
import FeaturedMovies from "../components/FeaturedMovies";
import Navbar from "../components/Navbar";
import { fetchTrendingMovies, searchMovies } from "../api/tmdb";
import styles from "../styles.jsx";

function getTmdbErrorMessage(error, fallback) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.status) return `Movie request failed: ${error.response.status}`;
  return error.message || fallback;
}

export default function Home() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistError, setWatchlistError] = useState("");
  const [userRatings, setUserRatings] = useState({});
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const redirectIfSignedOut = () => {
      if (!isAuthenticated()) navigate("/login", { replace: true });
    };

    redirectIfSignedOut();
    window.addEventListener("storage", redirectIfSignedOut);
    window.addEventListener("focus", redirectIfSignedOut);
    return () => {
      window.removeEventListener("storage", redirectIfSignedOut);
      window.removeEventListener("focus", redirectIfSignedOut);
    };
  }, [navigate]);

  useEffect(() => {
    try {
      setWatchlist(loadUserWatchlist());
    } catch (err) {
      setWatchlistError(err.message || "Could not load your watchlist.");
    }
  }, []);

  function handleAuthAction() {
    clearAuthentication();
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPopularMovies() {
      setLoading(true);
      setError("");
      try {
        setMovies(await fetchTrendingMovies(controller.signal));
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(getTmdbErrorMessage(err, "Failed to load movies."));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchPopularMovies();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const query = search.trim();
    if (!query) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      setSuggestionsError("");
      return undefined;
    }
    const controller = new AbortController();
    setSuggestions([]);
    setSuggestionsLoading(true);
    setSuggestionsError("");
    const timeout = setTimeout(async () => {
      try {
        const results = await searchMovies(query, controller.signal);
        setSuggestions(results.slice(0, 6));
      } catch (err) {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setSuggestionsError(getTmdbErrorMessage(err, "Could not load suggestions."));
        }
      } finally {
        if (!controller.signal.aborted) setSuggestionsLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search]);

  function navigateToSearch(query) {
    const normalizedQuery = query.trim();
    navigate(
      normalizedQuery ? `/search?query=${encodeURIComponent(normalizedQuery)}` : "/search"
    );
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    navigateToSearch(search);
  }

  function handleSuggestionSelect(movie) {
    setDropdownOpen(false);
    navigateToSearch(movie.title);
  }

  function handleToggleWatchlist(movie) {
    const isInWatchlist = watchlist.some((item) => item.id === movie.id);
    const updatedWatchlist = isInWatchlist
      ? watchlist.filter((item) => item.id !== movie.id)
      : [...watchlist, movie];
    try {
      saveUserWatchlist(updatedWatchlist);
      setWatchlist(updatedWatchlist);
      setWatchlistError("");
    } catch (err) {
      setWatchlistError(err.message || "Could not save your watchlist.");
    }
  }

  function handleSaveRating(movie, rating) {
    setUserRatings((previous) => ({
      ...previous,
      [movie.id]: rating
    }));
  }

  function handleClearRating(movie) {
    setUserRatings((previous) => {
      const updatedRatings = { ...previous };
      delete updatedRatings[movie.id];
      return updatedRatings;
    });
  }

  return (
    <div>
      <Navbar
        searchProps={{
          value: search,
          onChange: (value) => {
            setSearch(value);
            setDropdownOpen(Boolean(value));
          },
          onSubmit: handleSearchSubmit,
          dropdownOpen,
          suggestions,
          suggestionsLoading,
          suggestionsError,
          onSuggestionSelect: handleSuggestionSelect,
          onFocus: () => setDropdownOpen(true),
          onKeyDown: (event) => {
            if (event.key === "Escape") setDropdownOpen(false);
          },
          onClear: () => setDropdownOpen(false)
        }}
        actions={[
          { label: "Watchlist", onClick: () => navigate("/watchlist") },
          { label: "Logout", onClick: handleAuthAction }
        ]}
      />

      <main style={styles.shared.container}>
        <FeaturedMovies
          movies={movies}
          loading={loading}
          error={error}
          watchlist={watchlist}
          watchlistError={watchlistError}
          userRatings={userRatings}
          onSelectMovie={setSelectedMovie}
          onToggleWatchlist={handleToggleWatchlist}
          onSaveRating={handleSaveRating}
          onClearRating={handleClearRating}
        />
      </main>

      {selectedMovie && (
        <MovieDetailsDialog
          movie={selectedMovie}
          userRating={userRatings[selectedMovie.id] || selectedMovie.user_rating}
          isInWatchlist={watchlist.some((item) => item.id === selectedMovie.id)}
          onToggleWatchlist={handleToggleWatchlist}
          onSaveRating={handleSaveRating}
          onClearRating={handleClearRating}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}
