import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import { logoutUser } from "../api/userData";
import useUserRatings from "../hooks/useUserRatings";
import useUserWatchlist from "../hooks/useUserWatchlist";
import { MovieDetailsDialog } from "../components/MovieCard";
import MovieCarousel from "../components/MovieCarousel";
import Navbar from "../components/Navbar";
import {
  fetchNowPlayingMovies,
  fetchTrendingMovies,
  fetchUpcomingMovies,
  searchMovies
} from "../api/tmdb";
import styles from "../styles.jsx";

const HOME_SECTIONS = [
  { key: "trending", title: "Trending", fetchMovies: fetchTrendingMovies },
  { key: "upcoming", title: "Upcoming", fetchMovies: fetchUpcomingMovies },
  { key: "nowPlaying", title: "Now Playing", fetchMovies: fetchNowPlayingMovies }
];

function getTmdbErrorMessage(error, fallback) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.status) return `Movie request failed: ${error.response.status}`;
  return error.message || fallback;
}

export default function Home() {
  const navigate = useNavigate();
  const [movieSections, setMovieSections] = useState(() =>
    Object.fromEntries(
      HOME_SECTIONS.map(({ key }) => [
        key,
        { movies: [], loading: true, error: "" }
      ])
    )
  );
  const { userRatings, ratingsError, handleSaveRating, handleClearRating } =
    useUserRatings();
  const {
    userTitles,
    watchlistError,
    handleToggleWatchlist,
    handleToggleWatched
  } = useUserWatchlist();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  async function handleAuthAction() {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Could not revoke user session:", error);
    }
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    const controller = new AbortController();

    HOME_SECTIONS.forEach(async ({ key, fetchMovies }) => {
      try {
        const movies = await fetchMovies(controller.signal);
        if (!controller.signal.aborted) {
          setMovieSections((previous) => ({
            ...previous,
            [key]: { movies, loading: false, error: "" }
          }));
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setMovieSections((previous) => ({
            ...previous,
            [key]: {
              movies: [],
              loading: false,
              error: getTmdbErrorMessage(err, "Failed to load movies.")
            }
          }));
        }
      }
    });
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

  const selectedUserTitle = selectedMovie
    ? userTitles.find((item) => String(item.id) === String(selectedMovie.id))
    : null;

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
          { label: "Reviews", onClick: () => navigate("/reviews") },
          { label: "Account", onClick: () => navigate("/profile") },
          { label: "Logout", onClick: handleAuthAction }
        ]}
      />

      <main style={styles.shared.container}>
        {watchlistError && (
          <div style={{ ...styles.home.statusMessage, ...styles.home.errorMessage }}>
            {watchlistError}
          </div>
        )}
        {ratingsError && (
          <div style={{ ...styles.home.statusMessage, ...styles.home.errorMessage }}>
            {ratingsError}
          </div>
        )}

        {HOME_SECTIONS.map(({ key, title }) => {
          const section = movieSections[key];
          return (
            <section key={key} style={styles.home.movieSection}>
              <h2 style={styles.home.sectionTitle}>{title}</h2>
              {section.loading && (
                <div style={styles.home.statusMessage}>
                  Loading {title.toLowerCase()} movies...
                </div>
              )}
              {!section.loading && section.error && (
                <div style={{ ...styles.home.statusMessage, ...styles.home.errorMessage }}>
                  {section.error}
                </div>
              )}
              {!section.loading && !section.error && section.movies.length > 0 && (
                <MovieCarousel
                  label={title}
                  movies={section.movies}
                  userRatings={userRatings}
                  userTitles={userTitles}
                  onSelect={setSelectedMovie}
                  onToggleWatchlist={handleToggleWatchlist}
                  onToggleWatched={handleToggleWatched}
                  onSaveRating={handleSaveRating}
                  onClearRating={handleClearRating}
                />
              )}
              {!section.loading && !section.error && section.movies.length === 0 && (
                <div style={styles.home.statusMessage}>No movies available.</div>
              )}
            </section>
          );
        })}
      </main>

      {selectedMovie && (
        <MovieDetailsDialog
          movie={selectedMovie}
          userRating={userRatings[selectedMovie.id]}
          isInWatchlist={Boolean(selectedUserTitle?.in_watchlist)}
          isWatched={Boolean(selectedUserTitle?.watched)}
          onToggleWatchlist={handleToggleWatchlist}
          onToggleWatched={handleToggleWatched}
          onSaveRating={handleSaveRating}
          onClearRating={handleClearRating}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}
