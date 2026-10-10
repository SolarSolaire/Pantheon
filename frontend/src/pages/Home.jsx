
import React, { useEffect, useState } from "react";
import "./home.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_URL = "https://image.tmdb.org/t/p/w1280";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [watchlist, setWatchlist] = useState(() =>
    JSON.parse(localStorage.getItem("pantheon-watchlist") || "[]")
  );
  const [ratings, setRatings] = useState(() =>
    JSON.parse(localStorage.getItem("pantheon-ratings") || "{}")
  );
  const [reviews, setReviews] = useState(() =>
    JSON.parse(localStorage.getItem("pantheon-reviews") || "{}")
  );
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [reviewText, setReviewText] = useState("");

  // Fetch popular movies or search TMDB.
  useEffect(() => {
    if (!API_KEY) {
      setError("Please add your TMDB API token to your .env file.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchMovies() {
      setLoading(true);
      setError("");

      try {
        const endpoint = search.trim()
          ? `${API_URL}/search/movie?query=${encodeURIComponent(
              search.trim()
            )}&language=en-US&page=1&include_adult=false`
          : `${API_URL}/movie/popular?language=en-US&page=1`;

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            accept: "application/json",
          },
          signal: controller.signal,
        });

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

    const timeout = setTimeout(fetchMovies, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search]);

  function toggleWatchlist(movie) {
    setWatchlist((current) => {
      const exists = current.some((item) => item.id === movie.id);
      const updated = exists
        ? current.filter((item) => item.id !== movie.id)
        : [...current, movie];

      localStorage.setItem("pantheon-watchlist", JSON.stringify(updated));
      return updated;
    });
  }

  function rateMovie(movieId, rating) {
    setRatings((current) => {
      const updated = { ...current, [movieId]: rating };
      localStorage.setItem("pantheon-ratings", JSON.stringify(updated));
      return updated;
    });
  }

  function openReview(movie) {
    setSelectedMovie(movie);
    setReviewText(reviews[movie.id] || "");
  }

  function saveReview() {
    if (!selectedMovie) return;

    setReviews((current) => {
      const updated = {
        ...current,
        [selectedMovie.id]: reviewText.trim(),
      };

      localStorage.setItem("pantheon-reviews", JSON.stringify(updated));
      return updated;
    });

    setSelectedMovie(null);
    setReviewText("");
  }

  const featuredMovie = movies.find((movie) => movie.backdrop_path);

  return (
    <div className="pantheon-app">
      <header className="navbar">
        <a className="logo" href="#">
          <span>Pantheon</span>
        </a>

        <nav className="nav-links">
          <a href="#featured">Discover</a>
          <a href="#movies">Movies</a>
          <a href="#watchlist">Watchlist</a>
          <a href="#reviews">My Reviews</a>
        </nav>

        <div className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Search movies..."
            aria-label="Search movies"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear search">
              ×
            </button>
          )}
        </div>
      </header>

      {!search && featuredMovie && (
        <section
          id="featured"
          className="hero"
          style={{
            backgroundImage: `linear-gradient(90deg, #101014 0%, #101014df 45%, #10101455 100%), linear-gradient(0deg, #101014, transparent 65%), url(${BACKDROP_URL}${featuredMovie.backdrop_path})`,
          }}
        >
          <div className="hero-content">
            <span className="eyebrow">✦ FEATURED FILM</span>
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

            <div className="hero-buttons">
              <button
                className="btn-primary"
                onClick={() => openReview(featuredMovie)}
              >
                Rate & Review
              </button>

              <button
                className="btn-secondary"
                onClick={() => toggleWatchlist(featuredMovie)}
              >
                {watchlist.some((m) => m.id === featuredMovie.id)
                  ? "✓ In Watchlist"
                  : "+ Add to Watchlist"}
              </button>
            </div>
          </div>
        </section>
      )}

      <main className="main-content">
        <section className="stats">
          <div className="stat">
            <span className="stat-icon">▣</span>
            <div>
              <strong>{watchlist.length}</strong>
              <small>Movies on watchlist</small>
            </div>
          </div>

          <div className="stat">
            <span className="stat-icon">★</span>
            <div>
              <strong>{Object.keys(ratings).length}</strong>
              <small>Movies rated</small>
            </div>
          </div>

          <div className="stat">
            <span className="stat-icon">✎</span>
            <div>
              <strong>
                {Object.values(reviews).filter((text) => text.trim()).length}
              </strong>
              <small>Reviews written</small>
            </div>
          </div>
        </section>

        <section id="movies">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                {search ? "SEARCH RESULTS" : "EXPLORE THE COLLECTION"}
              </span>
              <h2>{search ? `Results for "${search}"` : "Popular Movies"}</h2>
              <p>
                {search
                  ? "Find your movie and add your own rating."
                  : "Discover films to watch, rate, and review."}
              </p>
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
              {movies.map((movie) => {
                const saved = watchlist.some(
                  (item) => item.id === movie.id
                );

                return (
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

                      <button
                        className={`watch-btn ${saved ? "saved" : ""}`}
                        onClick={() => toggleWatchlist(movie)}
                        aria-label={
                          saved
                            ? `Remove ${movie.title} from watchlist`
                            : `Add ${movie.title} to watchlist`
                        }
                      >
                        {saved ? "✓" : "+"}
                      </button>
                    </div>

                    <div className="movie-info">
                      <h3>{movie.title}</h3>

                      <div className="movie-meta">
                        <span>
                          {movie.release_date?.slice(0, 4) || "Unknown year"}
                        </span>
                        <span>
                          {ratings[movie.id]
                            ? `Your rating: ${ratings[movie.id]}/5`
                            : "Not rated"}
                        </span>
                      </div>

                      <button
                        className="text-btn"
                        onClick={() => openReview(movie)}
                      >
                        Rate & Review ↗
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section id="watchlist" className="watchlist-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">SAVED FOR LATER</span>
              <h2>My Watchlist</h2>
              <p>Movies you want to watch next.</p>
            </div>
          </div>

          {watchlist.length === 0 ? (
            <div className="status-message">
              Your watchlist is empty. Select + on a movie to save it.
            </div>
          ) : (
            <div className="movie-grid">
              {watchlist.map((movie) => (
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
                      <div className="poster-placeholder">No poster</div>
                    )}

                    <button
                      className="watch-btn saved"
                      onClick={() => toggleWatchlist(movie)}
                      aria-label={`Remove ${movie.title} from watchlist`}
                    >
                      ✓
                    </button>
                  </div>

                  <div className="movie-info">
                    <h3>{movie.title}</h3>
                    <div className="movie-meta">
                      <span>{movie.release_date?.slice(0, 4)}</span>
                      <span>★ {movie.vote_average?.toFixed(1)}</span>
                    </div>
                    <button
                      className="text-btn"
                      onClick={() => openReview(movie)}
                    >
                      Rate & Review ↗
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id="reviews" className="my-reviews">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR MOVIE JOURNAL</span>
              <h2>My Reviews</h2>
              <p>Your saved thoughts and personal ratings.</p>
            </div>
          </div>

          {Object.entries(reviews).filter(([, text]) => text.trim()).length ===
          0 ? (
            <div className="status-message">
              No reviews yet. Select Rate & Review on any movie to get started.
            </div>
          ) : (
            <div className="reviews-list">
              {Object.entries(reviews)
                .filter(([, text]) => text.trim())
                .map(([id, text]) => {
                  const movie =
                    movies.find((m) => String(m.id) === id) ||
                    watchlist.find((m) => String(m.id) === id);

                  return (
                    <article className="review-item" key={id}>
                      {movie?.poster_path && (
                        <img
                          src={`${IMAGE_URL}${movie.poster_path}`}
                          alt=""
                        />
                      )}
                      <div>
                        <h3>{movie?.title || `Movie #${id}`}</h3>
                        <p>{text}</p>
                        <span className="gold">
                          ★ {ratings[id] || 0}/5
                        </span>
                      </div>
                    </article>
                  );
                })}
            </div>
          )}
        </section>
      </main>

      {selectedMovie && (
        <div
          className="modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedMovie(null);
            }
          }}
        >
          <section
            className="review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
          >
            <button
              className="modal-close"
              onClick={() => setSelectedMovie(null)}
              aria-label="Close review"
            >
              ×
            </button>

            <span className="eyebrow">YOUR REVIEW</span>
            <h2 id="review-title">{selectedMovie.title}</h2>
            <p className="modal-description">
              What did you think of this movie?
            </p>

            <div className="star-picker">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={
                    star <= (ratings[selectedMovie.id] || 0)
                      ? "star selected"
                      : "star"
                  }
                  onClick={() => rateMovie(selectedMovie.id, star)}
                  aria-label={`Rate ${star} out of 5`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              className="review-input"
              placeholder="Write your thoughts about this movie..."
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              rows={5}
            />

            <button className="btn-primary save-review" onClick={saveReview}>
              Save Review
            </button>
          </section>
        </div>
      )}

      <footer className="footer">
        <a className="logo" href="#">
          <span>Pantheon</span>
        </a>
        <p>
          Movie information and images provided by TMDB.
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </footer>
    </div>
  );
}


