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
import styles from "../styles.jsx";

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
  const [suggestionsError, setSuggestionsError] = useState("");
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
      setSuggestionsError("");
      return undefined;
    }
    if (!API_KEY) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      setSuggestionsError("Please add your TMDB API token to your .env file.");
      return undefined;
    }

    const controller = new AbortController();
    setSuggestions([]);
    setSuggestionsLoading(true);
    setSuggestionsError("");
    const timeout = setTimeout(async () => {
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
        if (err.name !== "AbortError") {
          setSuggestions([]);
          setSuggestionsError(err.message || "Could not load suggestions.");
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
      <header style={styles.home.navBar}>
        <a style={styles.home.navBrand} href="#">
          <span>Pantheon</span>
        </a>
        <div style={styles.home.navActions}>
          <div style={styles.home.searchWrap}>
            <form style={styles.home.searchBox} onSubmit={handleSearchSubmit}>
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search movies..."
                aria-label="Search movies"
                value={search}
                autoComplete="off"
                aria-expanded={dropdownOpen && Boolean(search.trim())}
                aria-controls="movie-search-suggestions"
                style={styles.home.searchInput}
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
                  style={styles.home.clearButton}
                  onClick={() => {
                    setSearch("");
                    setDropdownOpen(false);
                  }}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
              <button type="submit" style={styles.home.searchSubmit}>
                Enter
              </button>
            </form>
            {dropdownOpen && search.trim() && (
              <div
                style={styles.home.suggestionsDropdown}
                id="movie-search-suggestions"
                role="listbox"
                aria-label="Suggested movies"
              >
                {suggestionsLoading ? (
                  <div style={styles.home.suggestionStatus} role="status" aria-live="polite">
                    Searching movies…
                  </div>
                ) : suggestionsError ? (
                  <div style={styles.home.suggestionStatus} role="status" aria-live="polite">
                    {suggestionsError}
                  </div>
                ) : suggestions.length ? (
                  suggestions.map((movie) => (
                    <button
                      type="button"
                      className="home-suggestion-item"
                      style={styles.home.suggestionItem}
                      role="option"
                      aria-selected="false"
                      key={movie.id}
                      onClick={() => handleSuggestionSelect(movie)}
                    >
                      {movie.poster_path ? (
                        <img
                          style={styles.home.suggestionPoster}
                          src={`${IMAGE_URL}${movie.poster_path}`}
                          alt=""
                        />
                      ) : (
                        <span style={styles.home.suggestionPoster} aria-hidden="true" />
                      )}
                      <span style={styles.home.suggestionText}>
                        <span style={styles.home.suggestionTitle}>{movie.title}</span>
                        <span style={styles.home.suggestionYear}>
                          {movie.release_date?.slice(0, 4) || "Release year unknown"}
                        </span>
                      </span>
                    </button>
                  ))
                ) : (
                  <div style={styles.home.suggestionStatus}>No matching movies found.</div>
                )}
              </div>
            )}
          </div>
          <button type="button" style={styles.shared.navButton} onClick={handleAuthAction}>
            Logout
          </button>
        </div>
      </header>

      <main style={styles.shared.container}>
        <section id="movies">
          <h2 style={styles.home.sectionTitle}>Featured Movies</h2>

          {loading && <div style={styles.home.statusMessage}>Loading movies...</div>}

          {!loading && error && (
            <div style={{ ...styles.home.statusMessage, ...styles.home.errorMessage }}>{error}</div>
          )}

          {!loading && !error && movies.length === 0 && (
            <div style={styles.home.statusMessage}>No movies found. Try another search.</div>
          )}

          {!loading && !error && movies.length > 0 && (
            <div style={styles.shared.grid}>
              {movies.map((movie) => {
                const inWatchlist = !!watchlist[movie.id];
                const userRating = userRatings[movie.id];
                const releaseYear = movie.release_date
                  ? movie.release_date.split("-")[0]
                  : "N/A";

                return (
                  <article key={movie.id} style={styles.movieCard.movieCard}>
                    {/* Poster Thumbnail */}
                    <div
                      style={styles.movieCard.posterContainer}
                      onClick={() => handleMovieSelect(movie)}
                    >
                      {movie.poster_path ? (
                        <img
                          src={`${IMAGE_URL}${movie.poster_path}`}
                          alt={movie.title}
                          style={styles.movieCard.posterImage}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src =
                              "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";
                          }}
                        />
                      ) : (
                        <div style={styles.home.posterPlaceholder}>Poster unavailable</div>
                      )}
                      <div style={styles.movieCard.posterOverlay}>
                        <span style={styles.movieCard.quickViewText}>
                          <Info size={14} /> View Details
                        </span>
                      </div>

                      {/* Score badge */}
                      <div style={styles.movieCard.ratingBadge}>
                        <Star
                          size={13}
                          fill="#f4c96b"
                          color="#f4c96b"
                        />
                        <span>{movie.vote_average?.toFixed(1) ?? "N/A"}</span>
                      </div>

                      {/* Genre pill badge */}
                      {movie.genre && (
                        <div style={styles.movieCard.genreBadge}>{movie.genre}</div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div style={styles.movieCard.cardBody}>
                      <div style={styles.movieCard.cardHeader}>
                        <h2
                          style={styles.movieCard.movieTitle}
                          title={movie.title}
                          onClick={() => handleMovieSelect(movie)}
                        >
                          {movie.title}
                        </h2>
                        <div style={styles.movieCard.movieMeta}>
                          <Calendar size={13} color="#85818d" />
                          <span>{releaseYear}</span>
                        </div>
                      </div>

                      <p style={styles.movieCard.overviewText}>{movie.overview}</p>

                      {/* User Rating Indicator (if rated) */}
                      {userRating && (
                        <div style={styles.movieCard.userRatedBar}>
                          <Star size={13} fill="#f4c96b" color="#f4c96b" />
                          <span>
                            Your rating: <strong>{userRating} / 10</strong>
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={styles.movieCard.cardActions}>
                        <button
                          onClick={() => handleToggleWatchlist(movie)}
                          style={{
                            ...styles.movieCard.actionButton,
                            ...(inWatchlist
                              ? styles.movieCard.actionButtonActive
                              : styles.movieCard.actionButtonSecondary)
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
                            ...styles.movieCard.actionButton,
                            ...styles.movieCard.actionButtonPrimary
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
          style={styles.movieCard.modalOverlay}
          onClick={() => setSelectedMovie(null)}
        >
          <div
            style={styles.movieCard.modalContent}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              style={styles.movieCard.modalCloseButton}
              onClick={() => setSelectedMovie(null)}
              aria-label="Close movie details"
            >
              <X size={20} />
            </button>

            <div style={styles.movieCard.modalLayout}>
              {selectedMovie.poster_path && (
                <img
                  src={`${IMAGE_URL}${selectedMovie.poster_path}`}
                  alt={selectedMovie.title}
                  style={styles.movieCard.modalPoster}
                />
              )}
              <div style={styles.movieCard.modalDetails}>
                <div style={styles.movieCard.modalHeaderRow}>
                  <h2 style={styles.movieCard.modalTitle}>{selectedMovie.title}</h2>
                  {selectedMovie.genre && (
                    <span style={styles.movieCard.modalGenreTag}>
                      {selectedMovie.genre}
                    </span>
                  )}
                </div>

                <div style={styles.movieCard.modalMetaRow}>
                  <div style={styles.movieCard.modalRatingBox}>
                    <Star size={18} fill="#f4c96b" color="#f4c96b" />
                    <span style={styles.movieCard.modalRatingScore}>
                      {selectedMovie.vote_average?.toFixed(1) ?? "N/A"}
                    </span>
                    <span style={styles.movieCard.modalRatingMax}>/ 10</span>
                  </div>
                  <span style={styles.movieCard.modalDate}>
                    Release Date: {selectedMovie.release_date || "Unknown"}
                  </span>
                </div>

                <h4 style={styles.movieCard.synopsisHeader}>Synopsis</h4>
                <p style={styles.movieCard.modalOverview}>
                  {selectedMovie.overview || "No overview available."}
                </p>

                <div style={styles.movieCard.modalActions}>
                  <button
                    onClick={() => handleToggleWatchlist(selectedMovie)}
                    style={{
                      ...styles.movieCard.modalActionButton,
                      ...(watchlist[selectedMovie.id]
                        ? styles.movieCard.actionButtonActive
                        : styles.movieCard.actionButtonSecondary)
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
                      ...styles.movieCard.modalActionButton,
                      ...styles.movieCard.actionButtonPrimary
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
          style={styles.movieCard.modalOverlay}
          onClick={() => setActiveRatingModal(null)}
        >
          <div
            style={styles.movieCard.ratingModalContent}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={styles.movieCard.ratingModalHeader}>
              <h3 style={styles.movieCard.ratingModalTitle}>
                Rate "{activeRatingModal.title}"
              </h3>
              <button
                style={styles.movieCard.modalCloseButton}
                onClick={() => setActiveRatingModal(null)}
                aria-label="Close rating dialog"
              >
                <X size={18} />
              </button>
            </div>
            <p style={styles.movieCard.ratingModalSubtitle}>
              Enter a decimal rating from 0.0 to 10.0 (e.g. 7.3 or 8.8):
            </p>

            <form onSubmit={handleSaveRating}>
              <div style={styles.movieCard.scoreDisplayBox}>
                <Star size={32} fill="#f4c96b" color="#f4c96b" />
                <span style={styles.movieCard.scoreDisplayNumber}>
                  {(() => {
                    const parsedRating = parseFloat(ratingInput);
                    return !Number.isNaN(parsedRating) &&
                      parsedRating >= 0 &&
                      parsedRating <= 10
                      ? parsedRating.toFixed(1)
                      : "--";
                  })()}
                </span>
                <span style={styles.movieCard.scoreDisplayScale}>/ 10.0</span>
              </div>

              <div style={styles.movieCard.decimalInputContainer}>
                <label style={styles.movieCard.decimalInputLabel}>Rating:</label>
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
                  style={styles.movieCard.decimalInput}
                />
              </div>

              <div style={styles.movieCard.sliderContainer}>
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
                  style={styles.movieCard.rangeSlider}
                />
                <div style={styles.movieCard.sliderTicks}>
                  <span>0.0</span>
                  <span>2.5</span>
                  <span>5.0</span>
                  <span>7.5</span>
                  <span>10.0</span>
                </div>
              </div>

              <div style={styles.movieCard.presetsWrapper}>
                <span style={styles.movieCard.presetsLabel}>Quick picks:</span>
                <div style={styles.movieCard.presetsGrid}>
                  {[6.5, 7.3, 7.8, 8.2, 8.8, 9.4].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => {
                        setRatingInput(preset.toFixed(1));
                        setRatingError("");
                      }}
                      style={styles.movieCard.presetButton}
                    >
                      {preset.toFixed(1)}
                    </button>
                  ))}
                </div>
              </div>

              {ratingError && (
                <p style={styles.movieCard.ratingErrorText}>{ratingError}</p>
              )}

              <div style={styles.movieCard.ratingModalActions}>
                {userRatings[activeRatingModal.id] && (
                  <button
                    type="button"
                    onClick={handleClearRating}
                    style={styles.movieCard.clearRatingButton}
                  >
                    Remove
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveRatingModal(null)}
                  style={styles.movieCard.cancelRatingButton}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.movieCard.saveRatingButton}>
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
