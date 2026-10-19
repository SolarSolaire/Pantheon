import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchStyles as styles, movieCardStyles } from "../sharedStyles.jsx";
import {
  Search as SearchIcon,
  Star,
  Bookmark,
  Check,
  Film,
  SlidersHorizontal,
  ArrowLeft,
  X,
  Calendar,
  Sparkles,
  Info
} from "lucide-react";
// When the backend search endpoint is connected, import api:
// import api from "../api/axios";

// Standard mock movies matching TMDB API response format
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

const GENRES = ["All", "Sci-Fi", "Action", "Animation", "Crime", "Drama"];

export default function Search() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("rating-desc");
  const [watchlist, setWatchlist] = useState({});
  const [userRatings, setUserRatings] = useState({});
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeRatingModal, setActiveRatingModal] = useState(null);
  const [ratingInput, setRatingInput] = useState("");
  const [ratingError, setRatingError] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(() => detectSignedIn());

  function detectSignedIn() {
    const authKeys = [
      "token",
      "authToken",
      "accessToken",
      "jwt",
      "user",
      "currentUser",
      "authUser",
      "isAuthenticated",
    ];
    return authKeys.some((key) => {
      const value = localStorage.getItem(key) ?? sessionStorage.getItem(key);
      if (
        !value ||
        value === "null" ||
        value === "undefined" ||
        value === "false"
      )
        return false;
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === "boolean") return parsed;
        if (parsed && typeof parsed === "object")
          return Object.keys(parsed).length > 0;
      } catch (_) {
        // Non-empty token strings count as signed in.
      }
      return value.trim().length > 0;
    });
  }

  useEffect(() => {
    const syncAuthState = () => setIsSignedIn(detectSignedIn());
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("focus", syncAuthState);
    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("focus", syncAuthState);
    };
  }, []);

  function handleAuthAction() {
    if (!isSignedIn) {
      navigate("/login");
      return;
    }

    [
      "token",
      "authToken",
      "accessToken",
      "jwt",
      "user",
      "currentUser",
      "authUser",
      "isAuthenticated",
    ].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    setIsSignedIn(false);
    navigate("/login");
  }

  // Toggle watchlist state
  const handleToggleWatchlist = (movie) => {
    setWatchlist((prev) => ({
      ...prev,
      [movie.id]: !prev[movie.id]
    }));
  };

  // Open decimal rating modal
  const handleOpenRatingModal = (movie) => {
    setActiveRatingModal(movie);
    setRatingInput(userRatings[movie.id] ? String(userRatings[movie.id]) : "8.0");
    setRatingError("");
  };

  // Save decimal rating (formatted to 1 decimal place)
  const handleSaveRating = (e) => {
    if (e) e.preventDefault();
    const val = parseFloat(ratingInput);
    if (isNaN(val) || val < 0 || val > 10) {
      setRatingError("Please enter a rating between 0.0 and 10.0");
      return;
    }
    const formatted = val.toFixed(1);
    setUserRatings((prev) => ({
      ...prev,
      [activeRatingModal.id]: formatted
    }));
    setActiveRatingModal(null);
  };

  // Clear rating
  const handleClearRating = () => {
    setUserRatings((prev) => {
      const updated = { ...prev };
      delete updated[activeRatingModal.id];
      return updated;
    });
    setActiveRatingModal(null);
  };

  // Filter and sort movies
  const filteredMovies = useMemo(() => {
    let list = [...MOCK_MOVIES];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.overview.toLowerCase().includes(q) ||
          m.genre.toLowerCase().includes(q)
      );
    }

    // Filter by genre
    if (selectedGenre !== "All") {
      list = list.filter((m) => m.genre === selectedGenre);
    }

    // Sort list
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
  }, [searchQuery, selectedGenre, sortBy]);

  return (
    <div style={styles.page}>
      {/* Top Navigation Bar */}
      <header style={styles.navBar}>
        <a className="logo" href="#" onClick={(e) => { e.preventDefault(); navigate("/home"); }} style={styles.navBrand}>
          <Film size={22} color="#f4c96b" />
          <span>Pantheon</span>
        </a>
        <div style={styles.navActions}>
          <button
            type="button"
            style={styles.accountBtn}
            onClick={() => navigate("/profile")}
          >
            Account
          </button>
          <button
            type="button"
            style={styles.logoutBtn}
            onClick={handleAuthAction}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={styles.container}>
        {/* Search Header Banner */}
        <section style={styles.heroSection}>
          <h1 style={styles.heroTitle}>Discover & Track Movies</h1>
          <p style={styles.heroSubtitle}>
            Search our catalog, add movies to your watchlist, and rate your favorites.
          </p>

          {/* Search Bar Input */}
          <div style={styles.searchBarWrapper}>
            <SearchIcon size={20} color="#85818d" style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by title, overview, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={styles.clearButton}
                title="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Genre Filters & Sorting */}
          <div style={styles.filterBar}>
            <div style={styles.genrePills}>
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  style={{
                    ...styles.genrePill,
                    ...(selectedGenre === genre ? styles.genrePillActive : {})
                  }}
                >
                  {genre}
                </button>
              ))}
            </div>

            <div style={styles.sortWrapper}>
              <SlidersHorizontal size={15} color="#aaa7b2" />
              <label style={styles.sortLabel}>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={styles.sortSelect}
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
        <div style={styles.resultsHeader}>
          <p style={styles.resultsCount}>
            Showing <strong style={{ color: "#f5f3ef" }}>{filteredMovies.length}</strong> {filteredMovies.length === 1 ? "movie" : "movies"}
            {searchQuery && ` for "${searchQuery}"`}
            {selectedGenre !== "All" && ` in ${selectedGenre}`}
          </p>
          <div style={styles.apiNotice}>
            <Sparkles size={14} color="#f4c96b" />
            <span>Mock catalog active — ready for API connection</span>
          </div>
        </div>

        {/* Movies Grid */}
        {filteredMovies.length === 0 ? (
          <div style={styles.emptyState}>
            <Film size={48} color="#85818d" />
            <h3 style={styles.emptyTitle}>No movies found</h3>
            <p style={styles.emptySubtitle}>
              Try searching with a different title or clearing your genre filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedGenre("All");
              }}
              style={styles.resetButton}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredMovies.map((movie) => {
              const inWatchlist = !!watchlist[movie.id];
              const userRating = userRatings[movie.id];
              const releaseYear = movie.release_date
                ? movie.release_date.split("-")[0]
                : "N/A";

              return (
                <article key={movie.id} style={movieCardStyles.movieCard}>
                  {/* Poster Thumbnail */}
                  <div
                    style={movieCardStyles.posterContainer}
                    onClick={() => setSelectedMovie(movie)}
                  >
                    <img
                      src={movie.poster_path}
                      alt={movie.title}
                      style={movieCardStyles.posterImage}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";
                      }}
                    />
                    <div style={movieCardStyles.posterOverlay}>
                      <span style={movieCardStyles.quickViewText}>
                        <Info size={14} /> View Details
                      </span>
                    </div>

                    {/* Score badge */}
                    <div style={movieCardStyles.ratingBadge}>
                      <Star size={13} fill="#f4c96b" color="#f4c96b" />
                      <span>{movie.vote_average.toFixed(1)}</span>
                    </div>

                    {/* Genre pill badge */}
                    <div style={movieCardStyles.genreBadge}>{movie.genre}</div>
                  </div>

                  {/* Card Content */}
                  <div style={movieCardStyles.cardBody}>
                    <div style={movieCardStyles.cardHeader}>
                      <h2
                        style={movieCardStyles.movieTitle}
                        title={movie.title}
                        onClick={() => setSelectedMovie(movie)}
                      >
                        {movie.title}
                      </h2>
                      <div style={movieCardStyles.movieMeta}>
                        <Calendar size={13} color="#85818d" />
                        <span>{releaseYear}</span>
                      </div>
                    </div>

                    <p style={movieCardStyles.overviewText}>
                      {movie.overview}
                    </p>

                    {/* User Rating Indicator (if rated) */}
                    {userRating && (
                      <div style={movieCardStyles.userRatedBar}>
                        <Star size={13} fill="#f4c96b" color="#f4c96b" />
                        <span>Your rating: <strong>{userRating} / 10</strong></span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={movieCardStyles.cardActions}>
                      <button
                        onClick={() => handleToggleWatchlist(movie)}
                        style={{
                          ...movieCardStyles.actionButton,
                          ...(inWatchlist ? movieCardStyles.actionButtonActive : movieCardStyles.actionButtonSecondary)
                        }}
                        title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                      >
                        {inWatchlist ? (
                          <>
                            <Check size={14} color="#10b981" />
                            <span style={{ color: "#10b981" }}>In Watchlist</span>
                          </>
                        ) : (
                          <>
                            <Bookmark size={14} />
                            <span>Watchlist</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenRatingModal(movie)}
                        style={{
                          ...movieCardStyles.actionButton,
                          ...movieCardStyles.actionButtonPrimary
                        }}
                      >
                        <Star size={14} fill={userRating ? "#f4c96b" : "none"} color="#f4c96b" />
                        <span>{userRating ? `${userRating} ★` : "Rate"}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <div style={styles.modalOverlay} onClick={() => setSelectedMovie(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              style={styles.modalCloseButton}
              onClick={() => setSelectedMovie(null)}
            >
              <X size={20} />
            </button>

            <div style={styles.modalLayout}>
              <img
                src={selectedMovie.poster_path}
                alt={selectedMovie.title}
                style={styles.modalPoster}
              />
              <div style={styles.modalDetails}>
                <div style={styles.modalHeaderRow}>
                  <h2 style={styles.modalTitle}>{selectedMovie.title}</h2>
                  <span style={styles.modalGenreTag}>{selectedMovie.genre}</span>
                </div>

                <div style={styles.modalMetaRow}>
                  <div style={styles.modalRatingBox}>
                    <Star size={18} fill="#f4c96b" color="#f4c96b" />
                    <span style={styles.modalRatingScore}>
                      {selectedMovie.vote_average.toFixed(1)}
                    </span>
                    <span style={styles.modalRatingMax}>/ 10</span>
                  </div>
                  <span style={styles.modalDate}>
                    Release Date: {selectedMovie.release_date}
                  </span>
                </div>

                <h4 style={styles.synopsisHeader}>Synopsis</h4>
                <p style={styles.modalOverview}>{selectedMovie.overview}</p>

                <div style={styles.modalActions}>
                  <button
                    onClick={() => handleToggleWatchlist(selectedMovie)}
                    style={{
                      ...styles.modalActionButton,
                      ...(watchlist[selectedMovie.id] ? movieCardStyles.actionButtonActive : movieCardStyles.actionButtonSecondary)
                    }}
                  >
                    {watchlist[selectedMovie.id] ? (
                      <>
                        <Check size={16} color="#10b981" />
                        <span style={{ color: "#10b981" }}>Saved in Watchlist</span>
                      </>
                    ) : (
                      <>
                        <Bookmark size={16} />
                        <span>Add to Watchlist</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      handleOpenRatingModal(selectedMovie);
                    }}
                    style={{
                      ...styles.modalActionButton,
                      ...movieCardStyles.actionButtonPrimary
                    }}
                  >
                    <Star size={16} fill={userRatings[selectedMovie.id] ? "#f4c96b" : "none"} color="#f4c96b" />
                    <span>
                      {userRatings[selectedMovie.id]
                        ? `Your Rating: ${userRatings[selectedMovie.id]}/10`
                        : "Rate this Movie"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decimal Rating Modal */}
      {activeRatingModal && (
        <div style={styles.modalOverlay} onClick={() => setActiveRatingModal(null)}>
          <div
            style={styles.ratingModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.ratingModalHeader}>
              <h3 style={styles.ratingModalTitle}>
                Rate "{activeRatingModal.title}"
              </h3>
              <button
                style={styles.modalCloseButton}
                onClick={() => setActiveRatingModal(null)}
              >
                <X size={18} />
              </button>
            </div>
            <p style={styles.ratingModalSubtitle}>
              Enter a decimal rating from 0.0 to 10.0 (e.g. 7.3 or 8.8):
            </p>

            <form onSubmit={handleSaveRating}>
              {/* Score Display Card */}
              <div style={styles.scoreDisplayBox}>
                <Star size={32} fill="#f4c96b" color="#f4c96b" />
                <span style={styles.scoreDisplayNumber}>
                  {(() => {
                    const parsed = parseFloat(ratingInput);
                    return !isNaN(parsed) && parsed >= 0 && parsed <= 10
                      ? parsed.toFixed(1)
                      : "--";
                  })()}
                </span>
                <span style={styles.scoreDisplayScale}>/ 10.0</span>
              </div>

              {/* Decimal Input Box */}
              <div style={styles.decimalInputContainer}>
                <label style={styles.decimalInputLabel}>Rating:</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={ratingInput}
                  onChange={(e) => {
                    setRatingInput(e.target.value);
                    setRatingError("");
                  }}
                  placeholder="e.g. 7.3"
                  autoFocus
                  style={styles.decimalInput}
                />
              </div>

              {/* Smooth Range Slider */}
              <div style={styles.sliderContainer}>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={(() => {
                    const p = parseFloat(ratingInput);
                    return isNaN(p) ? 7.0 : Math.min(10, Math.max(0, p));
                  })()}
                  onChange={(e) => {
                    setRatingInput(parseFloat(e.target.value).toFixed(1));
                    setRatingError("");
                  }}
                  style={styles.rangeSlider}
                />
                <div style={styles.sliderTicks}>
                  <span>0.0</span>
                  <span>2.5</span>
                  <span>5.0</span>
                  <span>7.5</span>
                  <span>10.0</span>
                </div>
              </div>

              {/* Quick Decimals Presets */}
              <div style={styles.presetsWrapper}>
                <span style={styles.presetsLabel}>Quick picks:</span>
                <div style={styles.presetsGrid}>
                  {[6.5, 7.3, 7.8, 8.2, 8.8, 9.4].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => {
                        setRatingInput(preset.toFixed(1));
                        setRatingError("");
                      }}
                      style={styles.presetButton}
                    >
                      {preset.toFixed(1)}
                    </button>
                  ))}
                </div>
              </div>

              {ratingError && <p style={styles.ratingErrorText}>{ratingError}</p>}

              {/* Action Buttons */}
              <div style={styles.ratingModalActions}>
                {userRatings[activeRatingModal.id] && (
                  <button
                    type="button"
                    onClick={handleClearRating}
                    style={styles.clearRatingButton}
                  >
                    Remove
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveRatingModal(null)}
                  style={styles.cancelRatingButton}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.saveRatingButton}>
                  Save Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Styling matching Home page cinematic theme (no white borders)
