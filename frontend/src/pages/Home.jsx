// TODO: a home page needs to be created.
// we just needs to at least display some featured movies from the api and have logout functionality.
// also make sure to add the search bar, which has an enter button that executes the search result and loads up the Search.jsx page.
// design the page to fit movie content, which can be connected later (just put placeholders for now)

// the route is already defined in App.jsx

// TODO: a home page needs to be created.
// we just needs to at least display some featured movies from the api and have logout functionality.
// also make sure to add the search bar, which has an enter button that executes the search result and loads up the Search.jsx page.
// design the page to fit movie content, which can be connected later (just put placeholders for now)

// the route is already defined in App.jsx

import React, { useEffect, useState } from "react";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_URL = "https://image.tmdb.org/t/p/w1280";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(() => detectSignedIn());

  function detectSignedIn() {
    const authKeys = ["token", "authToken", "accessToken", "jwt", "user", "currentUser", "authUser", "isAuthenticated"];
    return authKeys.some((key) => {
      const value = localStorage.getItem(key) ?? sessionStorage.getItem(key);
      if (!value || value === "null" || value === "undefined" || value === "false") return false;
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === "boolean") return parsed;
        if (parsed && typeof parsed === "object") return Object.keys(parsed).length > 0;
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
          `${API_URL}/movie/popular?language=en-US&page=1`,
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
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

  function handleAuthAction() {
    if (!isSignedIn) {
      window.location.assign("/login");
      return;
    }

    // Clear common authentication keys only; preserve movie preferences and other app data.
    ["token", "authToken", "accessToken", "jwt", "user", "currentUser", "authUser", "isAuthenticated"].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    setIsSignedIn(false);
    window.location.assign("/login");
  }

  const featuredMovie = movies.find((movie) => movie.backdrop_path);

  return (
    <div className="pantheon-app">

      <style>{`
        /* Global reset and page theme */
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          width: 100%;
          min-height: 100%;
          margin: 0;
          padding: 0;
          border: 0;
        }

        body {
          background: #101014;
        }

        .pantheon-app {
          display: flow-root;
          width: 100%;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          border: 0;
          background: #101014;
          color: #f5f3ef;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        /* Header and search */
        .navbar {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 32px;
          padding: 18px clamp(20px, 5vw, 72px);
          border-bottom: 1px solid #29282e;
          background: rgba(16, 16, 20, 0.94);
          backdrop-filter: blur(14px);
        }

        .logo {
          color: #f4c96b;
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-decoration: none;
          white-space: nowrap;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
        }

        .search-wrap {
          position: relative;
          width: min(330px, 32vw);
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 0 13px;
          border: 1px solid #393740;
          border-radius: 10px;
          background: #1b1a20;
          color: #aaa7b2;
        }

        .search-box input {
          width: 100%;
          min-width: 0;
          padding: 12px 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #f5f3ef;
          font: inherit;
        }

        .search-box input::placeholder {
          color: #85818d;
        }

        .suggestions-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          left: 0;
          z-index: 30;
          overflow: hidden;
          border: 1px solid #393740;
          border-radius: 10px;
          background: #1b1a20;
          box-shadow: 0 14px 32px #0008;
        }

        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          border: 0;
          border-bottom: 1px solid #302e36;
          background: transparent;
          color: #f5f3ef;
          text-align: left;
          cursor: pointer;
        }

        .suggestion-item:last-child {
          border-bottom: 0;
        }

        .suggestion-item:hover,
        .suggestion-item:focus-visible {
          background: #292730;
        }

        .suggestion-poster {
          flex: 0 0 34px;
          width: 34px;
          height: 48px;
          border-radius: 4px;
          background: #302e36;
          object-fit: cover;
        }

        .suggestion-title,
        .suggestion-year {
          display: block;
        }

        .suggestion-title {
          font-size: 0.9rem;
          font-weight: 700;
        }

        .suggestion-year {
          margin-top: 3px;
          color: #aaa7b2;
          font-size: 0.78rem;
        }

        .suggestion-status {
          padding: 13px;
          color: #aaa7b2;
          font-size: 0.86rem;
        }

        .search-submit,
        .logout-btn {
          padding: 11px 15px;
          border: 1px solid transparent;
          border-radius: 9px;
          font: inherit;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
          transition: transform 0.15s ease;
        }

        .search-submit,
        .login-btn {
          background: #f4c96b;
          color: #17140d;
        }

        .logout-btn {
          border-color: #44414b;
          background: #242229;
          color: #f0edf4;
        }

        .search-submit:hover,
        .logout-btn:hover {
          transform: translateY(-1px);
        }

        /* Featured movie hero */
        .hero {
          display: flex;
          align-items: center;
          min-height: clamp(420px, 53vw, 610px);
          padding: 72px clamp(24px, 8vw, 120px);
          border-bottom: 1px solid #29282e;
          background-position: center 28%;
          background-size: cover;
        }

        .hero-content {
          max-width: 680px;
        }

        .hero-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 10px;
          border: 1px solid #f4c96b55;
          border-radius: 999px;
          background: #10101499;
          color: #f4c96b;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .hero h1 {
          max-width: 680px;
          margin: 14px 0;
          font-size: clamp(2.5rem, 5vw, 4.8rem);
          line-height: 1.04;
          letter-spacing: -0.04em;
          text-wrap: balance;
        }

        .hero-meta,
        .movie-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          color: #aaa7b2;
          font-size: 0.88rem;
        }

        .gold,
        .movie-meta .movie-score {
          color: #f4c96b;
        }

        .hero p {
          max-width: 580px;
          color: #d0cdd5;
          line-height: 1.7;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
        }

        .hero-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 18px;
          border: 1px solid #f4c96b;
          border-radius: 9px;
          background: #f4c96b;
          color: #17140d;
          font: inherit;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
        }

        .hero-cta.secondary {
          border-color: #ffffff55;
          background: #17161bb8;
          color: #f5f3ef;
        }

        /* Movie collection */
        .main-content {
          width: min(1440px, 100%);
          margin: 0 auto;
          padding: 42px clamp(20px, 5vw, 72px) 70px;
        }

        .content-intro {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
          margin: 0 0 26px;
        }

        .content-intro h2 {
          margin: 8px 0;
          font-size: clamp(1.7rem, 3vw, 2.35rem);
          letter-spacing: -0.04em;
        }

        .movie-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
          gap: 24px 18px;
        }

        .movie-card {
          min-width: 0;
          overflow: hidden;
          border: 1px solid #2b2931;
          border-radius: 13px;
          background: #19181e;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .movie-card:hover {
          transform: translateY(-4px);
          border-color: #6a5935;
        }

        .poster-wrap {
          position: relative;
          overflow: hidden;
          aspect-ratio: 2 / 3;
          background: #25232b;
        }

        .poster {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .poster-placeholder {
          display: grid;
          place-items: center;
          height: 100%;
          padding: 12px;
          color: #aaa7b2;
          text-align: center;
        }

        .rating-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 6px 8px;
          border: 1px solid #ffffff25;
          border-radius: 7px;
          background: #101014dc;
          color: #f4c96b;
          font-size: 0.82rem;
          font-weight: 800;
        }

        .movie-info {
          padding: 14px;
        }

        .movie-info h3 {
          display: -webkit-box;
          overflow: hidden;
          min-height: 2.8em;
          margin: 0 0 10px;
          font-size: 1rem;
          line-height: 1.4;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .movie-meta {
          justify-content: space-between;
          font-size: 0.82rem;
        }

        /* Loading and error messages */
        .status-message {
          padding: 28px;
          border: 1px solid #302e36;
          border-radius: 12px;
          background: #19181e;
          color: #c7c3ce;
          text-align: center;
        }

        .status-message.error {
          border-color: #6a3338;
          color: #ffb4b4;
        }

        /* Keyboard accessibility */
        button:focus-visible,
        a:focus-visible,
        input:focus-visible {
          outline: 2px solid #f4c96b;
          outline-offset: 3px;
        }

        /* Responsive layout */
        @media (max-width: 850px) {
          .navbar {
            flex-wrap: wrap;
            gap: 16px;
          }

          .navbar-actions {
            margin-left: auto;
          }

          .search-wrap {
            width: min(300px, 42vw);
          }
        }

        @media (max-width: 560px) {
          .navbar {
            padding: 15px 16px;
          }

          .navbar-actions {
            width: 100%;
          }

          .search-wrap {
            flex: 1;
            width: auto;
            min-width: 0;
          }

          .search-box {
            width: 100%;
          }

          .search-submit,
          .logout-btn {
            padding: 10px 11px;
          }

          .hero {
            min-height: 360px;
            padding: 42px 22px;
          }

          .main-content {
            padding: 32px 16px 50px;
          }

          .movie-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }

          .movie-info {
            padding: 11px;
          }
        }
      `}</style>
      <header className="navbar">
        <a className="logo" href="#">
          <span>Pantheon</span>
        </a>
        <div className="navbar-actions">
          <div className="search-wrap">
            <form className="search-box" onSubmit={handleSearchSubmit}>
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
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
                <button type="button" onClick={() => { setSearch(""); setDropdownOpen(false); }} aria-label="Clear search">
                  ×
                </button>
              )}
            </form>
            {dropdownOpen && search.trim() && (
              <div className="suggestions-dropdown" id="movie-search-suggestions" role="listbox" aria-label="Suggested movies">
                {suggestionsLoading ? (
                  <div className="suggestion-status">Searching movies…</div>
                ) : suggestions.length ? (
                  suggestions.map((movie) => (
                    <button
                      type="button"
                      className="suggestion-item"
                      role="option"
                      aria-selected="false"
                      key={movie.id}
                      onClick={() => handleSuggestionSelect(movie)}
                    >
                      {movie.poster_path ? (
                        <img className="suggestion-poster" src={`${IMAGE_URL}${movie.poster_path}`} alt="" />
                      ) : (
                        <span className="suggestion-poster" aria-hidden="true" />
                      )}
                      <span>
                        <span className="suggestion-title">{movie.title}</span>
                        <span className="suggestion-year">{movie.release_date?.slice(0, 4) || "Release year unknown"}</span>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="suggestion-status">No matching movies found.</div>
                )}
              </div>
            )}
          </div>
          <button type="button" className="search-submit" onClick={handleSearchSubmit}>
            Enter
          </button>
          <button type="button" className={`logout-btn ${!isSignedIn ? "login-btn" : ""}`} onClick={handleAuthAction}>
            {isSignedIn ? "Logout" : "Login"}
          </button>
        </div>
      </header>

      {featuredMovie && (
        <section
          id="featured"
          className="hero"
          style={{
            backgroundImage: `linear-gradient(90deg, #101014 0%, #101014df 45%, #10101455 100%), linear-gradient(0deg, #101014, transparent 65%), url(${BACKDROP_URL}${featuredMovie.backdrop_path})`,
          }}
        >
          <div className="hero-content">
            <span className="hero-kicker">✦ Featured film</span>
            <h1>{featuredMovie.title}</h1>

            <div className="hero-meta">
              <span className="gold">
                ★ {featuredMovie.vote_average?.toFixed(1)}
              </span>
              <span>
                {featuredMovie.release_date?.slice(0, 4) || "Coming soon"}
              </span>
              <span>TMDB</span>
            </div>

            <p>
              {featuredMovie.overview ||
                "Discover your next favorite movie."}
            </p>
            <div className="hero-actions">
              <a className="hero-cta" href={`/Search?query=${encodeURIComponent(featuredMovie.title)}`}>Explore film <span aria-hidden="true">↗</span></a>
              <a className="hero-cta secondary" href="#movies">Browse popular movies</a>
            </div>
          </div>
        </section>
      )}

      <main className="main-content">

        <section id="movies">
          <div className="content-intro">
            <div>
              <h2>Featured Movies</h2>
            </div>
          </div>

          {loading && <div className="status-message">Loading movies...</div>}

          {!loading && error && (
            <div className="status-message error">{error}</div>
          )}

          {!loading && !error && movies.length === 0 && (
            <div className="status-message">
              No movies found. Try another search.
            </div>
          )}

          {!loading && !error && movies.length > 0 && (
            <div className="movie-grid">
              {movies.map((movie) => (
                  <article className="movie-card" key={movie.id}>
                    <div className="poster-wrap">
                      {movie.poster_path ? (
                        <img
                          className="poster"
                          src={`${IMAGE_URL}${movie.poster_path}`}
                          alt={`${movie.title} poster`}
                          loading="lazy"
                        />
                      ) : (
                        <div className="poster-placeholder">
                          Poster unavailable
                        </div>
                      )}

                      <span className="rating-badge">
                        ★ {movie.vote_average?.toFixed(1) ?? "N/A"}
                      </span>

                    </div>

                    <div className="movie-info">
                      <h3>{movie.title}</h3>

                      <div className="movie-meta">
                        <span>{movie.release_date?.slice(0, 4) || "Year unknown"}</span>
                        <span className="movie-score">★ {movie.vote_average?.toFixed(1) ?? "N/A"}</span>
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


