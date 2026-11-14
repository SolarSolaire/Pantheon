import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "../styles.jsx";
import { isAuthenticated } from "../utils/auth";
import { logoutUser } from "../api/userData";
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
  {
    id: 27205,
    title: "Inception",
    release_date: "2010-07-15",
    vote_average: 8.4,
    genre: "Sci-Fi",
    poster_path: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    overview:
      "Cobb, a skilled thief who steals corporate secrets through the use of dream-sharing technology, is given the inverse task of planting an idea into the mind of a C.E.O."
  },
  {
    id: 155,
    title: "The Dark Knight",
    release_date: "2008-07-16",
    vote_average: 8.5,
    genre: "Action",
    poster_path: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    overview:
      "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets."
  },
  {
    id: 157336,
    title: "Interstellar",
    release_date: "2014-11-05",
    vote_average: 8.4,
    genre: "Sci-Fi",
    poster_path: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    overview:
      "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage."
  },
  {
    id: 693134,
    title: "Dune: Part Two",
    release_date: "2024-02-27",
    vote_average: 8.2,
    genre: "Sci-Fi",
    poster_path: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    overview:
      "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family."
  },
  {
    id: 129,
    title: "Spirited Away",
    release_date: "2001-07-20",
    vote_average: 8.5,
    genre: "Animation",
    poster_path: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    overview:
      "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family."
  },
  {
    id: 680,
    title: "Pulp Fiction",
    release_date: "1994-09-10",
    vote_average: 8.5,
    genre: "Crime",
    poster_path: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    overview:
      "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper."
  },
  {
    id: 496243,
    title: "Parasite",
    release_date: "2019-05-30",
    vote_average: 8.5,
    genre: "Drama",
    poster_path: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    overview:
      "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident."
  },
  {
    id: 324857,
    title: "Spider-Man: Into the Spider-Verse",
    release_date: "2018-12-06",
    vote_average: 8.4,
    genre: "Animation",
    poster_path: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
    overview:
      "Teenager Miles Morales becomes the new Spider-Man and must join forces with five other spider-powered individuals from other dimensions to stop a threat to all realities."
  }
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
    watchlistError,
    handleToggleWatchlist,
    handleToggleWatched
  } = useUserWatchlist();
  const [isSignedIn, setIsSignedIn] = useState(isAuthenticated);
  const [movies, setMovies] = useState([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [moviesError, setMoviesError] = useState("");

  useEffect(() => {
    setSearchQuery(searchParams.get("query") || "");
  }, [searchParams]);

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
        actions={[
          { label: "Watchlist", onClick: () => navigate("/watchlist") },
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

// Styling matching Home page cinematic theme (no white borders)
