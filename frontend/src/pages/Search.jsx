import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100vh;
          background-color: #101014;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>

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
                <article key={movie.id} style={styles.card}>
                  {/* Poster Thumbnail */}
                  <div
                    style={styles.posterContainer}
                    onClick={() => setSelectedMovie(movie)}
                  >
                    <img
                      src={movie.poster_path}
                      alt={movie.title}
                      style={styles.posterImage}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";
                      }}
                    />
                    <div style={styles.posterOverlay}>
                      <span style={styles.quickViewText}>
                        <Info size={14} /> View Details
                      </span>
                    </div>

                    {/* Score badge */}
                    <div style={styles.ratingBadge}>
                      <Star size={13} fill="#f4c96b" color="#f4c96b" />
                      <span>{movie.vote_average.toFixed(1)}</span>
                    </div>

                    {/* Genre pill badge */}
                    <div style={styles.genreBadge}>{movie.genre}</div>
                  </div>

                  {/* Card Content */}
                  <div style={styles.cardBody}>
                    <div style={styles.cardHeader}>
                      <h2
                        style={styles.movieTitle}
                        title={movie.title}
                        onClick={() => setSelectedMovie(movie)}
                      >
                        {movie.title}
                      </h2>
                      <div style={styles.movieMeta}>
                        <Calendar size={13} color="#85818d" />
                        <span>{releaseYear}</span>
                      </div>
                    </div>

                    <p style={styles.overviewText}>
                      {movie.overview}
                    </p>

                    {/* User Rating Indicator (if rated) */}
                    {userRating && (
                      <div style={styles.userRatedBar}>
                        <Star size={13} fill="#f4c96b" color="#f4c96b" />
                        <span>Your rating: <strong>{userRating} / 10</strong></span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={styles.cardActions}>
                      <button
                        onClick={() => handleToggleWatchlist(movie)}
                        style={{
                          ...styles.actionButton,
                          ...(inWatchlist ? styles.actionButtonActive : styles.actionButtonSecondary)
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
                          ...styles.actionButton,
                          ...styles.actionButtonPrimary
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
                      ...(watchlist[selectedMovie.id] ? styles.actionButtonActive : styles.actionButtonSecondary)
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
                      ...styles.actionButtonPrimary
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
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#101014",
    color: "#f5f3ef",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  navBar: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    height: "72px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 clamp(20px, 5vw, 72px)",
    backgroundColor: "rgba(16, 16, 20, 0.94)",
    backdropFilter: "blur(14px)",
    borderBottom: "1px solid #29282e"
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    color: "#f4c96b",
    fontSize: "1.35rem",
    fontWeight: "800",
    letterSpacing: "0.04em",
    textDecoration: "none"
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  accountBtn: {
    padding: "10px 16px",
    border: "1px solid #44414b",
    borderRadius: "9px",
    fontSize: "inherit",
    fontWeight: "700",
    backgroundColor: "#242229",
    color: "#f0edf4",
    cursor: "pointer",
    transition: "transform 0.15s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center"
  },
  loginBtn: {
    padding: "10px 16px",
    border: "1px solid transparent",
    borderRadius: "9px",
    fontSize: "inherit",
    fontWeight: "700",
    backgroundColor: "#f4c96b",
    color: "#17140d",
    cursor: "pointer",
    transition: "transform 0.15s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center"
  },
  logoutBtn: {
    padding: "10px 16px",
    border: "1px solid transparent",
    borderRadius: "9px",
    fontSize: "inherit",
    fontWeight: "700",
    backgroundColor: "#d9534f",
    color: "#ffffff",
    cursor: "pointer",
    transition: "transform 0.15s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center"
  },
  container: {
    maxWidth: "1440px",
    margin: "0 auto",
    padding: "42px clamp(20px, 5vw, 72px) 70px"
  },
  heroSection: {
    textAlign: "center",
    marginBottom: "36px"
  },
  heroTitle: {
    fontSize: "clamp(2rem, 4vw, 3rem)",
    fontWeight: "800",
    margin: "0 0 10px 0",
    color: "#f5f3ef",
    letterSpacing: "-0.04em"
  },
  heroSubtitle: {
    fontSize: "1rem",
    color: "#aaa7b2",
    margin: "0 0 28px 0"
  },
  searchBarWrapper: {
    position: "relative",
    maxWidth: "680px",
    margin: "0 auto 28px auto"
  },
  searchIcon: {
    position: "absolute",
    left: "18px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none"
  },
  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 44px 14px 50px",
    fontSize: "16px",
    backgroundColor: "#1b1a20",
    border: "1px solid #393740",
    borderRadius: "30px",
    color: "#f5f3ef",
    outline: "none",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.4)"
  },
  clearButton: {
    position: "absolute",
    right: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    color: "#85818d",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "4px"
  },
  filterBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    maxWidth: "1050px",
    margin: "0 auto"
  },
  genrePills: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  genrePill: {
    backgroundColor: "#1b1a20",
    color: "#aaa7b2",
    border: "1px solid #393740",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontWeight: "600"
  },
  genrePillActive: {
    backgroundColor: "#f4c96b",
    borderColor: "#f4c96b",
    color: "#17140d"
  },
  sortWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  sortLabel: {
    fontSize: "13px",
    color: "#aaa7b2"
  },
  sortSelect: {
    backgroundColor: "#1b1a20",
    color: "#f5f3ef",
    border: "1px solid #393740",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
    outline: "none"
  },
  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #29282e",
    paddingBottom: "14px",
    marginBottom: "28px"
  },
  resultsCount: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#aaa7b2"
  },
  apiNotice: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.85rem",
    color: "#f4c96b"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
    gap: "24px 18px"
  },
  card: {
    backgroundColor: "#19181e",
    borderRadius: "13px",
    overflow: "hidden",
    border: "1px solid #2b2931",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease, border-color 0.2s ease"
  },
  posterContainer: {
    position: "relative",
    aspectRatio: "2/3",
    backgroundColor: "#25232b",
    overflow: "hidden",
    cursor: "pointer"
  },
  posterImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block"
  },
  posterOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(16, 16, 20, 0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.2s ease"
  },
  quickViewText: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#101014",
    color: "#f5f3ef",
    padding: "8px 14px",
    borderRadius: "20px",
    fontSize: "0.82rem",
    fontWeight: "700",
    border: "1px solid #393740"
  },
  ratingBadge: {
    position: "absolute",
    top: "10px",
    left: "10px",
    backgroundColor: "rgba(16, 16, 20, 0.85)",
    color: "#f4c96b",
    padding: "6px 8px",
    borderRadius: "7px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "0.82rem",
    fontWeight: "800",
    border: "1px solid rgba(255, 255, 255, 0.15)"
  },
  genreBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(16, 16, 20, 0.85)",
    color: "#aaa7b2",
    padding: "5px 8px",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "700",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  },
  cardBody: {
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    flex: 1
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "8px"
  },
  movieTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    margin: 0,
    color: "#f5f3ef",
    lineHeight: "1.4",
    cursor: "pointer",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  movieMeta: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "0.82rem",
    color: "#aaa7b2",
    flexShrink: 0
  },
  overviewText: {
    fontSize: "0.85rem",
    color: "#d0cdd5",
    lineHeight: "1.5",
    margin: "0 0 14px 0",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    flex: 1
  },
  userRatedBar: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#221d1b",
    border: "1px solid #553d20",
    color: "#f4c96b",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "0.8rem",
    marginBottom: "12px",
    fontWeight: "600"
  },
  cardActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginTop: "auto"
  },
  actionButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "9px 10px",
    borderRadius: "8px",
    fontSize: "0.82rem",
    fontWeight: "700",
    cursor: "pointer",
    border: "1px solid transparent",
    transition: "transform 0.15s ease"
  },
  actionButtonSecondary: {
    backgroundColor: "#242229",
    color: "#f0edf4",
    borderColor: "#44414b"
  },
  actionButtonActive: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "#10b981",
    color: "#10b981"
  },
  actionButtonPrimary: {
    backgroundColor: "#242229",
    color: "#f5f3ef",
    borderColor: "#44414b"
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
  resetButton: {
    backgroundColor: "#f4c96b",
    color: "#17140d",
    border: "none",
    padding: "10px 20px",
    borderRadius: "9px",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontWeight: "800"
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 50,
    backdropFilter: "blur(6px)"
  },
  modalContent: {
    backgroundColor: "#19181e",
    borderRadius: "14px",
    border: "1px solid #393740",
    maxWidth: "750px",
    width: "100%",
    padding: "28px",
    position: "relative",
    color: "#f5f3ef",
    boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
  },
  modalCloseButton: {
    position: "absolute",
    top: "16px",
    right: "16px",
    backgroundColor: "#242229",
    border: "1px solid #44414b",
    color: "#f5f3ef",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 2
  },
  modalLayout: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: "24px",
    alignItems: "start"
  },
  modalPoster: {
    width: "100%",
    aspectRatio: "2/3",
    objectFit: "cover",
    borderRadius: "10px",
    border: "1px solid #393740"
  },
  modalDetails: {
    display: "flex",
    flexDirection: "column"
  },
  modalHeaderRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "12px"
  },
  modalTitle: {
    fontSize: "1.5rem",
    fontWeight: "800",
    margin: 0,
    color: "#f5f3ef",
    lineHeight: "1.2"
  },
  modalGenreTag: {
    backgroundColor: "#242229",
    color: "#f4c96b",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "0.78rem",
    fontWeight: "700",
    border: "1px solid #44414b",
    whiteSpace: "nowrap"
  },
  modalMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
    fontSize: "0.88px",
    color: "#aaa7b2"
  },
  modalRatingBox: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#242229",
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid #44414b"
  },
  modalRatingScore: {
    fontSize: "1.1rem",
    fontWeight: "800",
    color: "#f4c96b"
  },
  modalRatingMax: {
    fontSize: "0.8rem",
    color: "#aaa7b2"
  },
  modalDate: {
    fontSize: "0.85rem",
    color: "#aaa7b2"
  },
  synopsisHeader: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#f5f3ef",
    margin: "0 0 6px 0"
  },
  modalOverview: {
    fontSize: "0.9rem",
    color: "#d0cdd5",
    lineHeight: "1.6",
    margin: "0 0 24px 0"
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    marginTop: "auto"
  },
  modalActionButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "11px 16px",
    borderRadius: "9px",
    fontSize: "0.9rem",
    fontWeight: "700",
    cursor: "pointer",
    border: "1px solid transparent"
  },
  ratingModalContent: {
    backgroundColor: "#19181e",
    borderRadius: "14px",
    border: "1px solid #393740",
    maxWidth: "440px",
    width: "100%",
    padding: "24px",
    color: "#f5f3ef",
    boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
  },
  ratingModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px"
  },
  ratingModalTitle: {
    fontSize: "1.2rem",
    fontWeight: "800",
    margin: 0,
    color: "#f5f3ef"
  },
  ratingModalSubtitle: {
    fontSize: "0.85rem",
    color: "#aaa7b2",
    margin: "0 0 20px 0"
  },
  scoreDisplayBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    backgroundColor: "#101014",
    border: "1px solid #393740",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px"
  },
  scoreDisplayNumber: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#f4c96b"
  },
  scoreDisplayScale: {
    fontSize: "1rem",
    color: "#aaa7b2",
    fontWeight: "600"
  },
  decimalInputContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px"
  },
  decimalInputLabel: {
    fontSize: "0.9rem",
    fontWeight: "700",
    color: "#f5f3ef"
  },
  decimalInput: {
    flex: 1,
    backgroundColor: "#101014",
    border: "1px solid #393740",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "1rem",
    color: "#f5f3ef",
    outline: "none"
  },
  sliderContainer: {
    marginBottom: "20px"
  },
  rangeSlider: {
    width: "100%",
    accentColor: "#f4c96b",
    cursor: "pointer",
    marginBottom: "6px"
  },
  sliderTicks: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.75rem",
    color: "#85818d"
  },
  presetsWrapper: {
    marginBottom: "20px"
  },
  presetsLabel: {
    display: "block",
    fontSize: "0.8rem",
    color: "#aaa7b2",
    marginBottom: "8px"
  },
  presetsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "6px"
  },
  presetButton: {
    backgroundColor: "#242229",
    border: "1px solid #44414b",
    color: "#f5f3ef",
    borderRadius: "6px",
    padding: "6px 0",
    fontSize: "0.8rem",
    fontWeight: "700",
    cursor: "pointer"
  },
  ratingErrorText: {
    color: "#ffb4b4",
    fontSize: "0.82rem",
    marginBottom: "12px",
    margin: "0 0 12px 0"
  },
  ratingModalActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end"
  },
  clearRatingButton: {
    backgroundColor: "transparent",
    border: "1px solid #6a3338",
    color: "#ffb4b4",
    borderRadius: "8px",
    padding: "9px 14px",
    fontSize: "0.85rem",
    fontWeight: "700",
    cursor: "pointer",
    marginRight: "auto"
  },
  cancelRatingButton: {
    backgroundColor: "#242229",
    border: "1px solid #44414b",
    color: "#f0edf4",
    borderRadius: "8px",
    padding: "9px 14px",
    fontSize: "0.85rem",
    fontWeight: "700",
    cursor: "pointer"
  },
  saveRatingButton: {
    backgroundColor: "#f4c96b",
    border: "none",
    color: "#17140d",
    borderRadius: "8px",
    padding: "9px 20px",
    fontSize: "0.85rem",
    fontWeight: "800",
    cursor: "pointer"
  }
};