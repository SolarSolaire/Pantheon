import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthentication, isAuthenticated } from "../utils/auth";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_URL = "https://image.tmdb.org/t/p/w1280";

export default function Home() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
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

  const featuredMovie = movies.find((movie) => movie.backdrop_path);

  return (
    <div className="app" style={styles.app}>
      <style>{`
        html,
        body,
        #root {
          width: 100%;
          min-height: 100%;
          margin: 0;
          padding: 0;
        }

        body {
          background: #101014;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
      <header className="navbar" style={styles.navbar}>
        <a className="logo" href="#" style={styles.logo}>
          <span>Pantheon</span>
        </a>
        <div className="navbar-actions" style={styles.navbarActions}>
          <div className="search-wrap" style={styles.searchWrap}>
            <form className="search-box" style={styles.searchBox} onSubmit={handleSearchSubmit}>
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                style={styles.searchInput}
                placeholder="Search movies..."
                aria-label="Search movies"
                value={search}
                autoComplete="off"
                aria-expanded={dropdownOpen && Boolean(search.trim())}
                aria-controls="movie-search-suggestions"
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
                <button type="button" style={styles.clearSearch} onClick={() => { setSearch(""); setDropdownOpen(false); }} aria-label="Clear search">
                  ×
                </button>
              )}
            </form>
            {dropdownOpen && search.trim() && (
              <div className="suggestions-dropdown" style={styles.suggestionsDropdown} id="movie-search-suggestions" role="listbox" aria-label="Suggested movies">
                {suggestionsLoading ? (
                  <div className="suggestion-status" style={styles.suggestionStatus}>Searching movies…</div>
                ) : suggestions.length ? (
                  suggestions.map((movie) => (
                    <button
                      type="button"
                      className="suggestion-item"
                      style={styles.suggestionItem}
                      role="option"
                      aria-selected="false"
                      key={movie.id}
                      onClick={() => handleSuggestionSelect(movie)}
                    >
                      {movie.poster_path ? (
                        <img className="suggestion-poster" style={styles.suggestionPoster} src={`${IMAGE_URL}${movie.poster_path}`} alt="" />
                      ) : (
                        <span className="suggestion-poster" style={styles.suggestionPoster} aria-hidden="true" />
                      )}
                      <span>
                        <span className="suggestion-title" style={styles.suggestionTitle}>{movie.title}</span>
                        <span className="suggestion-year" style={styles.suggestionYear}>{movie.release_date?.slice(0, 4) || "Release year unknown"}</span>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="suggestion-status" style={styles.suggestionStatus}>No matching movies found.</div>
                )}
              </div>
            )}
          </div>
          <button type="button" className="search-submit" style={styles.searchSubmit} onClick={handleSearchSubmit}>
            Enter
          </button>
          <button type="button" className="logout-btn" style={styles.logoutButton} onClick={handleAuthAction}>
            Logout
          </button>
        </div>
      </header>

      {featuredMovie && (
        <section
          id="featured"
          className="hero"
          style={{
            ...styles.hero,
            backgroundImage: `linear-gradient(90deg, #101014 0%, #101014df 45%, #10101455 100%), linear-gradient(0deg, #101014, transparent 65%), url(${BACKDROP_URL}${featuredMovie.backdrop_path})`,
          }}
        >
          <div className="hero-content" style={styles.heroContent}>
            <span className="hero-kicker" style={styles.heroKicker}>✦ Featured film</span>
            <h1 style={styles.heroTitle}>{featuredMovie.title}</h1>

            <div className="hero-meta" style={styles.heroMeta}>
              <span className="gold" style={styles.gold}>
                ★ {featuredMovie.vote_average?.toFixed(1)}
              </span>
              <span>
                {featuredMovie.release_date?.slice(0, 4) || "Coming soon"}
              </span>
              <span>TMDB</span>
            </div>

            <p style={styles.heroDescription}>
              {featuredMovie.overview ||
                "Discover your next favorite movie."}
            </p>
            <div className="hero-actions" style={styles.heroActions}>
              <a className="hero-cta" style={styles.heroCta} href={`/Search?query=${encodeURIComponent(featuredMovie.title)}`}>Explore film <span aria-hidden="true">↗</span></a>
              <a className="hero-cta secondary" style={styles.heroCtaSecondary} href="#movies">Browse popular movies</a>
            </div>
          </div>
        </section>
      )}

      <main className="main-content" style={styles.mainContent}>

        <section id="movies">
          <div className="content-intro" style={styles.contentIntro}>
            <div>
              <h2 style={styles.sectionTitle}>Featured Movies</h2>
            </div>
          </div>

          {loading && <div className="status-message" style={styles.statusMessage}>Loading movies...</div>}

          {!loading && error && (
            <div className="status-message error" style={styles.errorMessage}>{error}</div>
          )}

          {!loading && !error && movies.length === 0 && (
            <div className="status-message" style={styles.statusMessage}>
              No movies found. Try another search.
            </div>
          )}

          {!loading && !error && movies.length > 0 && (
            <div className="movie-grid" style={styles.movieGrid}>
              {movies.map((movie) => (
                  <article className="movie-card" style={styles.movieCard} key={movie.id}>
                    <div className="poster-wrap" style={styles.posterWrap}>
                      {movie.poster_path ? (
                        <img
                          className="poster"
                          style={styles.poster}
                          src={`${IMAGE_URL}${movie.poster_path}`}
                          alt={`${movie.title} poster`}
                          loading="lazy"
                        />
                      ) : (
                        <div className="poster-placeholder" style={styles.posterPlaceholder}>
                          Poster unavailable
                        </div>
                      )}

                      <span className="rating-badge" style={styles.ratingBadge}>
                        ★ {movie.vote_average?.toFixed(1) ?? "N/A"}
                      </span>

                    </div>

                    <div className="movie-info">
                      <h3 style={styles.movieTitle}>{movie.title}</h3>

                      <div className="movie-meta" style={styles.movieMeta}>
                        <span>{movie.release_date?.slice(0, 4) || "Year unknown"}</span>
                        <span className="movie-score" style={styles.movieScore}>★ {movie.vote_average?.toFixed(1) ?? "N/A"}</span>
                      </div>

                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>        
      </main>
    </div>
  );
}

const styles = {
  
  app: {
    display: "flow-root",
    width: "100%",
    minHeight: "100vh",
    margin: 0,
    padding: 0,
    border: 0,
    background: "#101014",
    color: "#f5f3ef",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid #29282e",
    background: "rgba(16, 16, 20, 0.94)",
    backdropFilter: "blur(14px)",
  },
  logo: {
    color: "#f4c96b",
    fontSize: "1.35rem",
    fontWeight: 800,
    letterSpacing: "0.04em",
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  navbarActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  searchWrap: {
    position: "relative",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "0 13px",
    border: "1px solid #393740",
    borderRadius: 10,
    background: "#1b1a20",
    color: "#aaa7b2",
  },
  searchInput: {
    width: "100%",
    minWidth: 0,
    padding: "12px 0",
    border: 0,
    outline: 0,
    background: "transparent",
    color: "#f5f3ef",
    font: "inherit",
  },
  clearSearch: {
    border: 0,
    background: "transparent",
    color: "#aaa7b2",
    font: "inherit",
    fontSize: "1.25rem",
    cursor: "pointer",
  },
  suggestionsDropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    left: 0,
    zIndex: 30,
    overflow: "hidden",
    border: "1px solid #393740",
    borderRadius: 10,
    background: "#1b1a20",
    boxShadow: "0 14px 32px #0008",
  },
  suggestionItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: "10px 12px",
    border: 0,
    borderBottom: "1px solid #302e36",
    color: "#f5f3ef",
    textAlign: "left",
    cursor: "pointer",
  },
  suggestionPoster: {
    flex: "0 0 34px",
    width: 34,
    height: 48,
    borderRadius: 4,
    background: "#302e36",
    objectFit: "cover",
  },
  suggestionTitle: {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: 700,
  },
  suggestionYear: {
    display: "block",
    marginTop: 3,
    color: "#aaa7b2",
    fontSize: "0.78rem",
  },
  suggestionStatus: {
    padding: 13,
    color: "#aaa7b2",
    fontSize: "0.86rem",
  },
  searchSubmit: {
    border: "1px solid transparent",
    borderRadius: 9,
    background: "#f4c96b",
    color: "#17140d",
    font: "inherit",
    fontWeight: 700,
    whiteSpace: "nowrap",
    cursor: "pointer",
    transition: "transform 0.15s ease",
  },
  logoutButton: {
    border: "1px solid #44414b",
    borderRadius: 9,
    background: "#242229",
    color: "#f0edf4",
    font: "inherit",
    fontWeight: 700,
    whiteSpace: "nowrap",
    cursor: "pointer",
    transition: "transform 0.15s ease",
  },
  hero: {
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid #29282e",
    backgroundPosition: "center 28%",
    backgroundSize: "cover",
  },
  heroContent: {
    maxWidth: 680,
  },
  heroKicker: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 10px",
    border: "1px solid #f4c96b55",
    borderRadius: 999,
    background: "#10101499",
    color: "#f4c96b",
    fontSize: "0.72rem",
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  heroTitle: {
    maxWidth: 680,
    margin: "14px 0",
    fontSize: "clamp(2.5rem, 5vw, 4.8rem)",
    lineHeight: 1.04,
    letterSpacing: "-0.04em",
    textWrap: "balance",
  },
  heroMeta: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    color: "#aaa7b2",
    fontSize: "0.88rem",
  },
  gold: {
    color: "#f4c96b",
  },
  heroDescription: {
    maxWidth: 580,
    color: "#d0cdd5",
    lineHeight: 1.7,
  },
  heroActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 24,
  },
  heroCta: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    padding: "0 18px",
    border: "1px solid #f4c96b",
    borderRadius: 9,
    background: "#f4c96b",
    color: "#17140d",
    font: "inherit",
    fontWeight: 800,
    textDecoration: "none",
    cursor: "pointer",
  },
  heroCtaSecondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    padding: "0 18px",
    border: "1px solid #ffffff55",
    borderRadius: 9,
    background: "#17161bb8",
    color: "#f5f3ef",
    font: "inherit",
    fontWeight: 800,
    textDecoration: "none",
    cursor: "pointer",
  },
  mainContent: {
    width: "min(1440px, 100%)",
    margin: "0 auto",
  },
  contentIntro: {
    display: "flex",
    alignItems: "end",
    justifyContent: "space-between",
    gap: 20,
    margin: "0 0 26px",
  },
  sectionTitle: {
    margin: "8px 0",
    fontSize: "clamp(1.7rem, 3vw, 2.35rem)",
    letterSpacing: "-0.04em",
  },
  movieGrid: {
    display: "grid",
  },
  movieCard: {
    minWidth: 0,
    overflow: "hidden",
    border: "1px solid #2b2931",
    borderRadius: 13,
    background: "#19181e",
    transition: "transform 0.2s ease, border-color 0.2s ease",
  },
  posterWrap: {
    position: "relative",
    overflow: "hidden",
    aspectRatio: "2 / 3",
    background: "#25232b",
  },
  poster: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  posterPlaceholder: {
    display: "grid",
    placeItems: "center",
    height: "100%",
    padding: 12,
    color: "#aaa7b2",
    textAlign: "center",
  },
  ratingBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: "6px 8px",
    border: "1px solid #ffffff25",
    borderRadius: 7,
    background: "#101014dc",
    color: "#f4c96b",
    fontSize: "0.82rem",
    fontWeight: 800,
  },
  movieTitle: {
    display: "-webkit-box",
    overflow: "hidden",
    minHeight: "2.8em",
    margin: "0 0 10px",
    fontSize: "1rem",
    lineHeight: 1.4,
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
  },
  movieMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    color: "#aaa7b2",
    fontSize: "0.82rem",
  },
  movieScore: {
    color: "#f4c96b",
  },
  statusMessage: {
    padding: 28,
    border: "1px solid #302e36",
    borderRadius: 12,
    background: "#19181e",
    color: "#c7c3ce",
    textAlign: "center",
  },
  errorMessage: {
    padding: 28,
    border: "1px solid #6a3338",
    borderRadius: 12,
    background: "#19181e",
    color: "#ffb4b4",
    textAlign: "center",
  },
};
