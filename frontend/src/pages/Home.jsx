import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  Calendar,
  Check,
  Info,
  Star,
  X
} from "lucide-react";
import { clearAuthentication, isAuthenticated } from "../utils/auth";
import { homeStyles as styles, movieCardStyles } from "../sharedStyles.jsx";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";



export default function Home() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [watchlist, setWatchlist] = useState({});
  const [userRatings, setUserRatings] = useState({});
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeRatingModal, setActiveRatingModal] = useState(null);
  const [ratingInput, setRatingInput] = useState("");
  const [ratingError, setRatingError] = useState("");
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(() => isAuthenticated());

  useEffect(() => {
    const syncAuthState = () => {
      const signedIn = isAuthenticated();
      setIsSignedIn(signedIn);
      if (!signedIn) navigate("/login", { replace: true });
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("focus", syncAuthState);
    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("focus", syncAuthState);
    };
  }, [navigate]);

  function handleAuthAction() {
    if (!isSignedIn) {
      navigate("/login", { replace: true });
      return;
    }

    clearAuthentication();
    setIsSignedIn(false);
    window.location.assign("/login");
  }

  // Keep the homepage collection independent from whatever is typed in the search bar.
  useEffect(() => {
    if (!API_KEY) {
      setError("Please add your TMDB API token to your .env file.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchPopularMovies() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `${API_URL}/trending/movie/week?language=en-US&api_key=${API_KEY}`,
          {
            headers: {
              accept: "application/json",
            },
            signal: controller.signal,
          }
        );
        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Invalid TMDB API token. Check your credentials."
              : `TMDB request failed: ${response.status}`
          );
        }
        const data = await response.json();
        setMovies(data.results || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load movies.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchPopularMovies();
    return () => controller.abort();
  }, []);

  // Update autocomplete suggestions as the user types, without replacing popular movies.
  useEffect(() => {
    const query = search.trim();
    if (!query) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return undefined;
    }
    if (!API_KEY) return undefined;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setSuggestionsLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`,
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              accept: "application/json",
            },
            signal: controller.signal,
          }
        );
        if (!response.ok) throw new Error("Could not load suggestions.");
        const data = await response.json();
        setSuggestions((data.results || []).slice(0, 6));
      } catch (err) {
        if (err.name !== "AbortError") setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setSuggestionsLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search]);

  function handleSearchSubmit(event) {
    event?.preventDefault?.();
    const query = search.trim();
    if (!query) return;
    window.location.assign(`/Search?query=${encodeURIComponent(query)}`);
  }

  function handleSuggestionSelect(movie) {
    setDropdownOpen(false);
    window.location.assign(`/Search?query=${encodeURIComponent(movie.title)}`);
  }

  function handleMovieSelect(movie) {
    setSelectedMovie(movie);
  }

  function handleToggleWatchlist(movie) {
    setWatchlist((previous) => ({
      ...previous,
      [movie.id]: !previous[movie.id]
    }));
  }

  function handleOpenRatingModal(movie) {
    setActiveRatingModal(movie);
    setRatingInput(userRatings[movie.id] ? String(userRatings[movie.id]) : "8.0");
    setRatingError("");
  }

  function handleSaveRating(event) {
    event.preventDefault();
    const value = parseFloat(ratingInput);
    if (Number.isNaN(value) || value < 0 || value > 10) {
      setRatingError("Please enter a rating between 0.0 and 10.0");
      return;
    }

    setUserRatings((previous) => ({
      ...previous,
      [activeRatingModal.id]: value.toFixed(1)
    }));
    setActiveRatingModal(null);
  }

  function handleClearRating() {
    setUserRatings((previous) => {
      const updatedRatings = { ...previous };
      delete updatedRatings[activeRatingModal.id];
      return updatedRatings;
    });
    setActiveRatingModal(null);
  }

  return (
    <div>
      <header style={styles.navBar}>
        <a style={styles.navBrand} href="#">
          <span>Pantheon</span>
        </a>
        <div style={styles.navActions}>
          <div style={styles.searchWrap}>
            <form style={styles.searchBox} onSubmit={handleSearchSubmit}>
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search movies..."
                aria-label="Search movies"
                value={search}
                autoComplete="off"
                aria-expanded={dropdownOpen && Boolean(search.trim())}
                aria-controls="movie-search-suggestions"
                style={styles.searchInput}
                onFocus={() => setDropdownOpen(true)}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setDropdownOpen(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setDropdownOpen(false);
                }}
              />
              {search && (
                <button
                  type="button"
                  style={styles.clearButton}
                  onClick={() => {
                    setSearch("");
                    setDropdownOpen(false);
                  }}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </form>
            {dropdownOpen && search.trim() && (
              <div
                style={styles.suggestionsDropdown}
                id="movie-search-suggestions"
                role="listbox"
                aria-label="Suggested movies"
              >
                {suggestionsLoading ? (
                  <div style={styles.suggestionStatus}>Searching movies…</div>
                ) : suggestions.length ? (
                  suggestions.map((movie) => (
                    <button
                      type="button"
                      className="home-suggestion-item"
                      style={styles.suggestionItem}
                      role="option"
                      aria-selected="false"
                      key={movie.id}
                      onClick={() => handleSuggestionSelect(movie)}
                    >
                      {movie.poster_path ? (
                        <img
                          style={styles.suggestionPoster}
                          src={`${IMAGE_URL}${movie.poster_path}`}
                          alt=""
                        />
                      ) : (
                        <span style={styles.suggestionPoster} aria-hidden="true" />
                      )}
                      <span style={styles.suggestionText}>
                        <span style={styles.suggestionTitle}>{movie.title}</span>
                        <span style={styles.suggestionYear}>
                          {movie.release_date?.slice(0, 4) || "Release year unknown"}
                        </span>
                      </span>
                    </button>
                  ))
                ) : (
                  <div style={styles.suggestionStatus}>No matching movies found.</div>
                )}
              </div>
            )}
          </div>
          <button type="button" style={styles.searchSubmit} onClick={handleSearchSubmit}>
            Enter
          </button>
          <button type="button" style={styles.logoutBtn} onClick={handleAuthAction}>
            Logout
          </button>
        </div>
      </header>

      <main style={styles.container}>
        <section id="movies">
          <h2 style={styles.sectionTitle}>Featured Movies</h2>

          {loading && <div style={styles.statusMessage}>Loading movies...</div>}

          {!loading && error && (
            <div style={{ ...styles.statusMessage, ...styles.errorMessage }}>{error}</div>
          )}

          {!loading && !error && movies.length === 0 && (
            <div style={styles.statusMessage}>No movies found. Try another search.</div>
          )}

          {!loading && !error && movies.length > 0 && (
            <div style={styles.grid}>
              {movies.map((movie) => {
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
                      onClick={() => handleMovieSelect(movie)}
                    >
                      {movie.poster_path ? (
                        <img
                          src={`${IMAGE_URL}${movie.poster_path}`}
                          alt={movie.title}
                          style={movieCardStyles.posterImage}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src =
                              "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";
                          }}
                        />
                      ) : (
                        <div style={styles.posterPlaceholder}>Poster unavailable</div>
                      )}
                      <div style={movieCardStyles.posterOverlay}>
                        <span style={movieCardStyles.quickViewText}>
                          <Info size={14} /> View Details
                        </span>
                      </div>

                      {/* Score badge */}
                      <div style={movieCardStyles.ratingBadge}>
                        <Star
                          size={13}
                          fill="#f4c96b"
                          color="#f4c96b"
                        />
                        <span>{movie.vote_average?.toFixed(1) ?? "N/A"}</span>
                      </div>

                      {/* Genre pill badge */}
                      {movie.genre && (
                        <div style={movieCardStyles.genreBadge}>{movie.genre}</div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div style={movieCardStyles.cardBody}>
                      <div style={movieCardStyles.cardHeader}>
                        <h2
                          style={movieCardStyles.movieTitle}
                          title={movie.title}
                          onClick={() => handleMovieSelect(movie)}
                        >
                          {movie.title}
                        </h2>
                        <div style={movieCardStyles.movieMeta}>
                          <Calendar size={13} color="#85818d" />
                          <span>{releaseYear}</span>
                        </div>
                      </div>

                      <p style={movieCardStyles.overviewText}>{movie.overview}</p>

                      {/* User Rating Indicator (if rated) */}
                      {userRating && (
                        <div style={movieCardStyles.userRatedBar}>
                          <Star size={13} fill="#f4c96b" color="#f4c96b" />
                          <span>
                            Your rating: <strong>{userRating} / 10</strong>
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={movieCardStyles.cardActions}>
                        <button
                          onClick={() => handleToggleWatchlist(movie)}
                          style={{
                            ...movieCardStyles.actionButton,
                            ...(inWatchlist
                              ? movieCardStyles.actionButtonActive
                              : movieCardStyles.actionButtonSecondary)
                          }}
                          title={
                            inWatchlist
                              ? "Remove from watchlist"
                              : "Add to watchlist"
                          }
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
                          <Star
                            size={14}
                            fill={userRating ? "#f4c96b" : "none"}
                            color="#f4c96b"
                          />
                          <span>{userRating ? `${userRating} ★` : "Rate"}</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <div
          style={searchStyles.modalOverlay}
          onClick={() => setSelectedMovie(null)}
        >
          <div
            style={searchStyles.modalContent}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              style={searchStyles.modalCloseButton}
              onClick={() => setSelectedMovie(null)}
              aria-label="Close movie details"
            >
              <X size={20} />
            </button>

            <div style={searchStyles.modalLayout}>
              {selectedMovie.poster_path && (
                <img
                  src={`${IMAGE_URL}${selectedMovie.poster_path}`}
                  alt={selectedMovie.title}
                  style={searchStyles.modalPoster}
                />
              )}
              <div style={searchStyles.modalDetails}>
                <div style={searchStyles.modalHeaderRow}>
                  <h2 style={searchStyles.modalTitle}>{selectedMovie.title}</h2>
                  {selectedMovie.genre && (
                    <span style={searchStyles.modalGenreTag}>
                      {selectedMovie.genre}
                    </span>
                  )}
                </div>

                <div style={searchStyles.modalMetaRow}>
                  <div style={searchStyles.modalRatingBox}>
                    <Star size={18} fill="#f4c96b" color="#f4c96b" />
                    <span style={searchStyles.modalRatingScore}>
                      {selectedMovie.vote_average?.toFixed(1) ?? "N/A"}
                    </span>
                    <span style={searchStyles.modalRatingMax}>/ 10</span>
                  </div>
                  <span style={searchStyles.modalDate}>
                    Release Date: {selectedMovie.release_date || "Unknown"}
                  </span>
                </div>

                <h4 style={searchStyles.synopsisHeader}>Synopsis</h4>
                <p style={searchStyles.modalOverview}>
                  {selectedMovie.overview || "No overview available."}
                </p>

                <div style={searchStyles.modalActions}>
                  <button
                    onClick={() => handleToggleWatchlist(selectedMovie)}
                    style={{
                      ...searchStyles.modalActionButton,
                      ...(watchlist[selectedMovie.id]
                        ? movieCardStyles.actionButtonActive
                        : movieCardStyles.actionButtonSecondary)
                    }}
                  >
                    {watchlist[selectedMovie.id] ? (
                      <>
                        <Check size={16} color="#10b981" />
                        <span style={{ color: "#10b981" }}>
                          Saved in Watchlist
                        </span>
                      </>
                    ) : (
                      <>
                        <Bookmark size={16} />
                        <span>Add to Watchlist</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenRatingModal(selectedMovie)}
                    style={{
                      ...searchStyles.modalActionButton,
                      ...movieCardStyles.actionButtonPrimary
                    }}
                  >
                    <Star
                      size={16}
                      fill={userRatings[selectedMovie.id] ? "#f4c96b" : "none"}
                      color="#f4c96b"
                    />
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
        <div
          style={searchStyles.modalOverlay}
          onClick={() => setActiveRatingModal(null)}
        >
          <div
            style={searchStyles.ratingModalContent}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={searchStyles.ratingModalHeader}>
              <h3 style={searchStyles.ratingModalTitle}>
                Rate "{activeRatingModal.title}"
              </h3>
              <button
                style={searchStyles.modalCloseButton}
                onClick={() => setActiveRatingModal(null)}
                aria-label="Close rating dialog"
              >
                <X size={18} />
              </button>
            </div>
            <p style={searchStyles.ratingModalSubtitle}>
              Enter a decimal rating from 0.0 to 10.0 (e.g. 7.3 or 8.8):
            </p>

            <form onSubmit={handleSaveRating}>
              <div style={searchStyles.scoreDisplayBox}>
                <Star size={32} fill="#f4c96b" color="#f4c96b" />
                <span style={searchStyles.scoreDisplayNumber}>
                  {(() => {
                    const parsedRating = parseFloat(ratingInput);
                    return !Number.isNaN(parsedRating) &&
                      parsedRating >= 0 &&
                      parsedRating <= 10
                      ? parsedRating.toFixed(1)
                      : "--";
                  })()}
                </span>
                <span style={searchStyles.scoreDisplayScale}>/ 10.0</span>
              </div>

              <div style={searchStyles.decimalInputContainer}>
                <label style={searchStyles.decimalInputLabel}>Rating:</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={ratingInput}
                  onChange={(event) => {
                    setRatingInput(event.target.value);
                    setRatingError("");
                  }}
                  placeholder="e.g. 7.3"
                  autoFocus
                  style={searchStyles.decimalInput}
                />
              </div>

              <div style={searchStyles.sliderContainer}>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={(() => {
                    const parsedRating = parseFloat(ratingInput);
                    return Number.isNaN(parsedRating)
                      ? 7
                      : Math.min(10, Math.max(0, parsedRating));
                  })()}
                  onChange={(event) => {
                    setRatingInput(parseFloat(event.target.value).toFixed(1));
                    setRatingError("");
                  }}
                  style={searchStyles.rangeSlider}
                />
                <div style={searchStyles.sliderTicks}>
                  <span>0.0</span>
                  <span>2.5</span>
                  <span>5.0</span>
                  <span>7.5</span>
                  <span>10.0</span>
                </div>
              </div>

              <div style={searchStyles.presetsWrapper}>
                <span style={searchStyles.presetsLabel}>Quick picks:</span>
                <div style={searchStyles.presetsGrid}>
                  {[6.5, 7.3, 7.8, 8.2, 8.8, 9.4].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => {
                        setRatingInput(preset.toFixed(1));
                        setRatingError("");
                      }}
                      style={searchStyles.presetButton}
                    >
                      {preset.toFixed(1)}
                    </button>
                  ))}
                </div>
              </div>

              {ratingError && (
                <p style={searchStyles.ratingErrorText}>{ratingError}</p>
              )}

              <div style={searchStyles.ratingModalActions}>
                {userRatings[activeRatingModal.id] && (
                  <button
                    type="button"
                    onClick={handleClearRating}
                    style={searchStyles.clearRatingButton}
                  >
                    Remove
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveRatingModal(null)}
                  style={searchStyles.cancelRatingButton}
                >
                  Cancel
                </button>
                <button type="submit" style={searchStyles.saveRatingButton}>
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
