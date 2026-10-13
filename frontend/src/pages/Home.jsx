import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Search as SearchIcon } from "lucide-react";
import Search from "./Search";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_URL = "https://image.tmdb.org/t/p/w1280";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(() => detectSignedIn());
  const navigate = useNavigate();

  // Placeholder data for recent user reviews side panel
  const recentReviews = [
    {
      id: 1,
      user: "Lunar",
      movie: "Inception",
      rating: 10,
      text: "An absolute masterpiece of modern cinema!",
    },
    {
      id: 2,
      user: "AzazelPotato",
      movie: "Interstellar",
      rating: 8,
      text: "Mind-bending score and visuals.",
    },
    {
      id: 3,
      user: "EliteViewer",
      movie: "The Dark Knight",
      rating: 10,
      text: "Heath Ledger's performance is legendary.",
    },
  ];

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

  useEffect(() => {
    if (!API_KEY) {
      setError("Featured Movies from TMDB API will appear here");
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
          },
        );
        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Invalid TMDB API token. Check your credentials."
              : `TMDB request failed: ${response.status}`,
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

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/search");
    }
  }

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

  const featuredMovie = movies.find((movie) => movie.backdrop_path);

  return (
    <div className="pantheon-app">
      <style>{`
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

        /* Header and navigation */
        .navbar {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 18px clamp(20px, 5vw, 72px);
          border-bottom: 1px solid #29282e;
          background: rgba(16, 16, 20, 0.94);
          backdrop-filter: blur(14px);
        }

        .logo {
          display: flex;  
          align-items: center;
          gap: 10px;
          color: #f4c96b;
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-decoration: none;
          white-space: nowrap;
        }

        .center-search-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: min(680px, 45vw);
          padding: 14px 20px;
          border: 1px solid #393740;
          border-radius: 30px;
          background: #1b1a20;
          color: #85818d;
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
          transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.15s ease;
          text-align: left;
        }

        .center-search-btn:hover {
          border-color: #6a5935;
          background: #242229;
          color: #aaa7b2;
          transform: translateY(-1px);
        }

        .search-btn-icon {
          flex-shrink: 0;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .account-btn,
        .logout-btn {
          padding: 10px 16px;
          border: 1px solid transparent;
          border-radius: 9px;
          font: inherit;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
          transition: transform 0.15s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .account-btn {
          background: #242229;
          border-color: #44414b;
          color: #f0edf4;
        }

        .logout-btn {
          background: #d9534f;
          color: #ffffff;
        }

        .account-btn:hover,
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

        /* Main layout with sidebar */
        .main-content {
          width: min(1440px, 100%);
          margin: 0 auto;
          padding: 42px clamp(20px, 5vw, 72px) 70px;
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 40px;
        }

        @media (max-width: 1024px) {
          .main-content {
            grid-template-columns: 1fr;
          }
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

        /* Sidebar for Recent Reviews */
        .sidebar {
          background: #151419;
          border: 1px solid #29282e;
          border-radius: 14px;
          padding: 24px;
          height: fit-content;
        }

        .sidebar h3 {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 1.25rem;
          color: #f4c96b;
          border-bottom: 1px solid #29282e;
          padding-bottom: 10px;
        }

        .review-card {
          background: #1b1a20;
          border: 1px solid #2e2c35;
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 14px;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #aaa7b2;
          margin-bottom: 6px;
        }

        .review-movie {
          font-weight: 700;
          color: #f5f3ef;
        }

        .review-text {
          font-size: 0.9rem;
          color: #d0cdd5;
          margin: 0;
          line-height: 1.4;
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
        a:focus-visible {
          outline: 2px solid #f4c96b;
          outline-offset: 3px;
        }

        @media (max-width: 768px) {
          .navbar {
            flex-direction: column;
            align-items: stretch;
          }
          .center-search-btn {
            width: 100%;
          }
        }
      `}</style>

      <header className="navbar">
        <a className="logo" href="#">
          <Film size={22} color="#f4c96b"></Film>
          <span>Pantheon</span>
        </a>

        {/* Centered Search Button */}
        <button
          type="button"
          className="center-search-btn"
          onClick={() => navigate("/search")}
        >
          <SearchIcon
            size={15}
            color="#f4c96b"
            className="search-btn-icon"
          ></SearchIcon>
          <span>Search for Movies...</span>
        </button>

        <div className="navbar-actions">
          <button
            type="button"
            className="account-btn"
            onClick={() => navigate("/profile")}
          >
            Account
          </button>
          <button
            type="button"
            className={"logout-btn"}
            onClick={handleAuthAction}
          >
            Logout
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
              {featuredMovie.overview || "Discover your next favorite movie."}
            </p>
            <div className="hero-actions">
              <button className="hero-cta" onClick={() => navigate("/search")}>
                Explore Search <span aria-hidden="true">↗</span>
              </button>
              <a className="hero-cta secondary" href="#movies">
                Browse popular movies
              </a>
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
            <div className="status-message">No movies found.</div>
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
                      <span>
                        {movie.release_date?.slice(0, 4) || "Year unknown"}
                      </span>
                      <span className="movie-score">
                        ★ {movie.vote_average?.toFixed(1) ?? "N/A"}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Recent Reviews Side Panel */}
        <aside className="sidebar">
          <h3>Recent User Reviews</h3>
          {recentReviews.map((review) => (
            <div className="review-card" key={review.id}>
              <div className="review-header">
                <span className="review-movie">{review.movie}</span>
                <span className="gold">★ {review.rating}/10</span>
              </div>
              <p className="review-text">"{review.text}"</p>
              <small
                style={{ color: "#85818d", display: "block", marginTop: "6px" }}
              >
                - {review.user}
              </small>
            </div>
          ))}
        </aside>
      </main>
    </div>
  );
}
