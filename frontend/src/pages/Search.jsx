import React, { useState, useMemo } from "react";
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
        <div style={styles.navBrand} onClick={() => navigate("/login")}>
          <Film size={26} color="#e50914" />
          <span style={styles.navLogoText}>PANTHEON</span>
          <span style={styles.badge}>Preview Mode</span>
        </div>
        <div style={styles.navActions}>
          <button
            onClick={() => navigate("/login")}
            style={styles.backButton}
          >
            <ArrowLeft size={16} />
            Back to Login
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
            <SearchIcon size={20} color="#888" style={styles.searchIcon} />
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
              <SlidersHorizontal size={15} color="#aaa" />
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
            Showing <strong style={{ color: "#fff" }}>{filteredMovies.length}</strong> {filteredMovies.length === 1 ? "movie" : "movies"}
            {searchQuery && ` for "${searchQuery}"`}
            {selectedGenre !== "All" && ` in ${selectedGenre}`}
          </p>
          <div style={styles.apiNotice}>
            <Sparkles size={14} color="#f59e0b" />
            <span>Mock catalog active — ready for API connection</span>
          </div>
        </div>

        {/* Movies Grid */}
        {filteredMovies.length === 0 ? (
          <div style={styles.emptyState}>
            <Film size={48} color="#555" />
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
                      <Star size={13} fill="#f59e0b" color="#f59e0b" />
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
                        <Calendar size={13} color="#888" />
                        <span>{releaseYear}</span>
                      </div>
                    </div>

                    <p style={styles.overviewText}>
                      {movie.overview}
                    </p>

                    {/* User Rating Indicator (if rated) */}
                    {userRating && (
                      <div style={styles.userRatedBar}>
                        <Star size={13} fill="#e50914" color="#e50914" />
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
                        <Star size={14} fill={userRating ? "#f59e0b" : "none"} color="#f59e0b" />
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
                    <Star size={18} fill="#f59e0b" color="#f59e0b" />
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
                    <Star size={16} fill={userRatings[selectedMovie.id] ? "#f59e0b" : "none"} color="#f59e0b" />
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
                <Star size={32} fill="#f59e0b" color="#f59e0b" />
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

// Styling (Modern Dark-Mode Cinematic Theme)
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0f1117",
    color: "#f3f4f6",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
  },
  navBar: {
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    backgroundColor: "#161922",
    borderBottom: "1px solid #232734",
    position: "sticky",
    top: 0,
    zIndex: 20
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer"
  },
  navLogoText: {
    fontSize: "20px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    color: "#ffffff"
  },
  badge: {
    fontSize: "11px",
    padding: "3px 8px",
    backgroundColor: "#2a2f3d",
    color: "#9ca3af",
    borderRadius: "12px",
    marginLeft: "4px"
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "transparent",
    color: "#9ca3af",
    border: "1px solid #323849",
    padding: "7px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "32px 24px 64px 24px"
  },
  heroSection: {
    textAlign: "center",
    marginBottom: "36px"
  },
  heroTitle: {
    fontSize: "32px",
    fontWeight: "800",
    margin: "0 0 8px 0",
    color: "#ffffff"
  },
  heroSubtitle: {
    fontSize: "15px",
    color: "#9ca3af",
    margin: "0 0 24px 0"
  },
  searchBarWrapper: {
    position: "relative",
    maxWidth: "680px",
    margin: "0 auto 24px auto"
  },
  searchIcon: {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none"
  },
  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 44px 14px 48px",
    fontSize: "16px",
    backgroundColor: "#1c202c",
    border: "1px solid #2f364a",
    borderRadius: "30px",
    color: "#fff",
    outline: "none",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.3)"
  },
  clearButton: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    color: "#888",
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
    maxWidth: "980px",
    margin: "0 auto"
  },
  genrePills: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  genrePill: {
    backgroundColor: "#1c202c",
    color: "#9ca3af",
    border: "1px solid #2f364a",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.15s ease"
  },
  genrePillActive: {
    backgroundColor: "#e50914",
    borderColor: "#e50914",
    color: "#ffffff",
    fontWeight: "600"
  },
  sortWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  sortLabel: {
    fontSize: "13px",
    color: "#9ca3af"
  },
  sortSelect: {
    backgroundColor: "#1c202c",
    color: "#fff",
    border: "1px solid #2f364a",
    padding: "6px 10px",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer"
  },
  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #232734",
    paddingBottom: "12px",
    marginBottom: "24px"
  },
  resultsCount: {
    margin: 0,
    fontSize: "14px",
    color: "#9ca3af"
  },
  apiNotice: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "#f59e0b"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "24px"
  },
  card: {
    backgroundColor: "#161922",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #232734",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
  },
  posterContainer: {
    position: "relative",
    aspectRatio: "2/3",
    backgroundColor: "#1f2430",
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
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.2s ease",
    ":hover": {
      opacity: 1
    }
  },
  quickViewText: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(0,0,0,0.75)",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    backdropFilter: "blur(4px)"
  },
  ratingBadge: {
    position: "absolute",
    top: "10px",
    left: "10px",
    backgroundColor: "rgba(15, 17, 23, 0.85)",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    fontWeight: "700",
    backdropFilter: "blur(4px)"
  },
  genreBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(30, 36, 48, 0.85)",
    color: "#cbd5e1",
    padding: "3px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "500",
    backdropFilter: "blur(4px)"
  },
  cardBody: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    flex: 1
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "6px"
  },
  movieTitle: {
    fontSize: "16px",
    fontWeight: "700",
    margin: 0,
    color: "#fff",
    lineHeight: "1.3",
    cursor: "pointer",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  movieMeta: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    color: "#888",
    flexShrink: 0
  },
  overviewText: {
    fontSize: "13px",
    color: "#9ca3af",
    lineHeight: "1.4",
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
    backgroundColor: "#201720",
    border: "1px solid #4a1924",
    color: "#f87171",
    padding: "6px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    marginBottom: "12px"
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
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    border: "1px solid transparent",
    transition: "all 0.15s ease"
  },
  actionButtonSecondary: {
    backgroundColor: "#202534",
    color: "#d1d5db",
    borderColor: "#2d3447"
  },
  actionButtonActive: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "#10b981",
    color: "#10b981"
  },
  actionButtonPrimary: {
    backgroundColor: "#202534",
    color: "#f3f4f6",
    borderColor: "#2d3447"
  },
  emptyState: {
    textAlign: "center",
    padding: "64px 20px",
    backgroundColor: "#161922",
    borderRadius: "12px",
    border: "1px solid #232734"
  },
  emptyTitle: {
    fontSize: "18px",
    color: "#fff",
    margin: "16px 0 6px 0"
  },
  emptySubtitle: {
    fontSize: "14px",
    color: "#888",
    margin: "0 0 20px 0"
  },
  resetButton: {
    backgroundColor: "#e50914",
    color: "#fff",
    border: "none",
    padding: "8px 18px",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "600"
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 50,
    backdropFilter: "blur(6px)"
  },
  modalContent: {
    backgroundColor: "#181c26",
    borderRadius: "14px",
    maxWidth: "760px",
    width: "100%",
    position: "relative",
    border: "1px solid #2c3244",
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
  },
  modalCloseButton: {
    position: "absolute",
    top: "16px",
    right: "16px",
    backgroundColor: "rgba(0,0,0,0.5)",
    border: "none",
    color: "#fff",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10
  },
  modalLayout: {
    display: "flex",
    flexDirection: "row",
    gap: "24px",
    padding: "24px",
    flexWrap: "wrap"
  },
  modalPoster: {
    width: "220px",
    borderRadius: "8px",
    objectFit: "cover",
    aspectRatio: "2/3"
  },
  modalDetails: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },
  modalHeaderRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "10px"
  },
  modalTitle: {
    fontSize: "24px",
    margin: 0,
    color: "#fff",
    fontWeight: "800"
  },
  modalGenreTag: {
    backgroundColor: "#2a3142",
    color: "#cbd5e1",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "12px"
  },
  modalMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "16px"
  },
  modalRatingBox: {
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  modalRatingScore: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#fff"
  },
  modalRatingMax: {
    fontSize: "13px",
    color: "#888"
  },
  modalDate: {
    fontSize: "13px",
    color: "#9ca3af"
  },
  synopsisHeader: {
    fontSize: "14px",
    color: "#cbd5e1",
    margin: "0 0 6px 0",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  modalOverview: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#9ca3af",
    margin: "0 0 24px 0",
    flex: 1
  },
  modalActions: {
    display: "flex",
    gap: "12px"
  },
  modalActionButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    border: "1px solid transparent"
  },
  ratingModalContent: {
    backgroundColor: "#181c26",
    borderRadius: "14px",
    maxWidth: "420px",
    width: "100%",
    padding: "24px",
    border: "1px solid #2c3244",
    boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
  },
  ratingModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px"
  },
  ratingModalTitle: {
    fontSize: "18px",
    color: "#fff",
    margin: 0
  },
  ratingModalSubtitle: {
    fontSize: "13px",
    color: "#9ca3af",
    margin: "0 0 20px 0"
  },
  scoreDisplayBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    backgroundColor: "#11141c",
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid #282f40",
    marginBottom: "18px"
  },
  scoreDisplayNumber: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: "1px"
  },
  scoreDisplayScale: {
    fontSize: "16px",
    color: "#6b7280",
    fontWeight: "600",
    alignSelf: "flex-end",
    marginBottom: "4px"
  },
  decimalInputContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px"
  },
  decimalInputLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#e5e7eb"
  },
  decimalInput: {
    flex: 1,
    padding: "10px 14px",
    fontSize: "18px",
    fontWeight: "700",
    borderRadius: "8px",
    backgroundColor: "#202534",
    border: "1px solid #3b445c",
    color: "#fff",
    outline: "none",
    textAlign: "center"
  },
  sliderContainer: {
    marginBottom: "20px"
  },
  rangeSlider: {
    width: "100%",
    accentColor: "#e50914",
    cursor: "pointer"
  },
  sliderTicks: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "#6b7280",
    marginTop: "4px"
  },
  presetsWrapper: {
    marginBottom: "20px"
  },
  presetsLabel: {
    display: "block",
    fontSize: "12px",
    color: "#9ca3af",
    marginBottom: "8px"
  },
  presetsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "6px"
  },
  presetButton: {
    padding: "6px 4px",
    backgroundColor: "#202534",
    border: "1px solid #2d3447",
    color: "#cbd5e1",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600"
  },
  ratingErrorText: {
    color: "#ef4444",
    fontSize: "12px",
    margin: "0 0 12px 0"
  },
  ratingModalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "8px"
  },
  cancelRatingButton: {
    padding: "9px 16px",
    backgroundColor: "transparent",
    border: "1px solid #3b445c",
    color: "#9ca3af",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "600"
  },
  clearRatingButton: {
    padding: "9px 14px",
    backgroundColor: "transparent",
    border: "1px solid #7f1d1d",
    color: "#ef4444",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "600",
    marginRight: "auto"
  },
  saveRatingButton: {
    padding: "9px 20px",
    backgroundColor: "#e50914",
    border: "none",
    color: "#fff",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer"
  }
};
