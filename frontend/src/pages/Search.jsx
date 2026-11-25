import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "../styles.jsx";
import { isAuthenticated } from "../utils/auth";
import { fetchUserProfile, logoutUser } from "../api/userData";
import useUserRatings from "../hooks/useUserRatings";
import useUserWatchlist from "../hooks/useUserWatchlist";
import MovieGrid from "../components/MovieGrid";
import SearchBar from "../components/SearchBar";
import Navbar from "../components/Navbar";
import { fetchTrendingMovies, searchMovies } from "../api/tmdb";
import {
  Film,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

/*
const MOCK_MOVIES = [
  ... (Mock data omitted for brevity)
];
*/

const GENRES = ["All", "Sci-Fi", "Action", "Animation", "Crime", "Drama"];
const GENRE_IDS = {
  "Sci-Fi": 878,
  Action: 28,
  Animation: 16,
  Crime: 80,
  Drama: 18
};

export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("query") || "");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("rating-desc");
  const { userRatings, ratingsError, handleSaveRating, handleClearRating } =
    useUserRatings();
  const {
    userTitles,
    reviewedMovieIds,
    markMovieReviewed,
    watchlistError,
    handleToggleWatchlist,
    handleToggleWatched
  } = useUserWatchlist();
  const [isSignedIn, setIsSignedIn] = useState(isAuthenticated);
  const [currentUser, setCurrentUser] = useState(null); // Added currentUser state
  const [movies, setMovies] = useState([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [moviesError, setMoviesError] = useState("");

  useEffect(() => {
    setSearchQuery(searchParams.get("query") || "");
  }, [searchParams]);

  // Added effect to fetch user profile when signed in
  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated()) {
        try {
          const profile = await fetchUserProfile();
          setCurrentUser(profile);
        } catch (error) {
          console.error("Failed to load user profile:", error);
        }
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();
    const controller = new AbortController();
    let timeout;

    async function loadMovies() {
      setMoviesLoading(true);
      setMoviesError("");
      try {
        const results = query
          ? await searchMovies(query, controller.signal)
          : await fetchTrendingMovies(controller.signal);
        setMovies(results);
      } catch (err) {
        if (!controller.signal.aborted) {
          setMovies([]);
          setMoviesError(
            err.response?.data?.message ||
              err.message ||
              "Could not load movies from TMDB."
          );
        }
      } finally {
        if (!controller.signal.aborted) setMoviesLoading(false);
      }
    }

    if (query) {
      timeout = setTimeout(loadMovies, 250);
    } else {
      loadMovies();
    }

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchQuery]);

  useEffect(() => {
    const syncAuthState = () => setIsSignedIn(isAuthenticated());
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("focus", syncAuthState);
    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("focus", syncAuthState);
    };
  }, []);

  async function handleAuthAction() {
    if (!isSignedIn) {
      navigate("/login");
      return;
    }

    try {
      await logoutUser();
    } catch (error) {
      console.error("Could not revoke user session:", error);
    }
    setIsSignedIn(false);
    navigate("/login");
  }

  const filteredMovies = useMemo(() => {
    let list = [...movies];
    if (selectedGenre !== "All") {
      const genreId = GENRE_IDS[selectedGenre];
      list = list.filter((movie) => movie.genre_ids?.includes(genreId));
    }

    list.sort((a, b) => {
      if (sortBy === "rating-desc") return b.vote_average - a.vote_average;
      if (sortBy === "rating-asc") return a.vote_average - b.vote_average;
      if (sortBy === "date-newest")
        return new Date(b.release_date) - new Date(a.release_date);
      if (sortBy === "date-oldest")
        return new Date(a.release_date) - new Date(b.release_date);
      if (sortBy === "title-az") return a.title.localeCompare(b.title);
      return 0;
    });

    return list;
  }, [movies, selectedGenre, sortBy]);

  return (
    <div>
      <Navbar
        showSearch={false}
        userName={currentUser?.name || currentUser?.username} // Passed down user name
        actions={[
          { label: "Home", onClick: () => navigate("/home") },
          { label: "Watchlist", onClick: () => navigate("/watchlist") },
          { label: "Reviews", onClick: () => navigate("/reviews") },
          { label: "Account", onClick: () => navigate("/profile") },
          { label: "Logout", onClick: handleAuthAction }
        ]}
      />

      {/* Main Content Area */}
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
        {/* Search Header Banner */}
        <section style={styles.search.heroSection}>
          <h1 style={styles.search.heroTitle}>Discover & Track Movies</h1>
          <p style={styles.search.heroSubtitle}>
            Search our catalog, add movies to your watchlist, and rate your favorites.
          </p>

          {/* Search Bar Input */}
          <SearchBar
            mode="hero"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title, overview, or genre..."
          />

          {/* Genre Filters & Sorting */}
          <div style={styles.search.filterBar}>
            <div style={styles.search.genrePills}>
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  style={{
                    ...styles.search.genrePill,
                    ...(selectedGenre === genre ? styles.search.genrePillActive : {})
                  }}
                >
                  {genre}
                </button>
              ))}
            </div>

            <div style={styles.search.sortWrapper}>
              <SlidersHorizontal size={15} color="#aaa7b2" />
              <label style={styles.search.sortLabel}>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={styles.search.sortSelect}
              >
                <option value="rating-desc">Highest Rated</option>
                <option value="rating-asc">Lowest Rated</option>
                <option value="date-newest">Newest Release</option>
                <option value="date-oldest">Oldest Release</option>
                <option value="title-az">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Results Counter / Info */}
        <div style={styles.search.resultsHeader}>
          <p style={styles.search.resultsCount}>
            Showing <strong style={{ color: "#f5f3ef" }}>{filteredMovies.length}</strong> {filteredMovies.length === 1 ? "movie" : "movies"}
            {searchQuery && ` for "${searchQuery}"`}
            {selectedGenre !== "All" && ` in ${selectedGenre}`}
          </p>
          <div style={styles.search.apiNotice}>
            <Sparkles size={14} color="#f4c96b" />
            <span>Movie data provided by TMDB</span>
          </div>
        </div>

        {/* Movies Grid */}
        {moviesLoading ? (
          <div style={styles.home.statusMessage}>Loading movies...</div>
        ) : moviesError ? (
          <div style={{ ...styles.home.statusMessage, ...styles.home.errorMessage }}>
            {moviesError}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div style={styles.search.emptyState}>
            <Film size={48} color="#85818d" />
            <h3 style={styles.search.emptyTitle}>No movies found</h3>
            <p style={styles.search.emptySubtitle}>
              Try a different search or clear the selected genre filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedGenre("All");
              }}
              style={styles.search.resetButton}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <MovieGrid
            movies={filteredMovies}
            userRatings={userRatings}
            userTitles={userTitles}
            reviewedMovieIds={reviewedMovieIds}
            onReviewSaved={markMovieReviewed}
            onToggleWatchlist={handleToggleWatchlist}
            onToggleWatched={handleToggleWatched}
            onSaveRating={handleSaveRating}
            onClearRating={handleClearRating}
          />
        )}
      </main>

    </div>
  );
}