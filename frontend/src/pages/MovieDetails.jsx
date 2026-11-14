import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  Eye,
  EyeOff,
  Star,
  UserRound
} from "lucide-react";
import { fetchMovieDetails } from "../api/tmdb";
import useUserRatings from "../hooks/useUserRatings";
import useUserWatchlist from "../hooks/useUserWatchlist";
import { MovieRatingDialog } from "../components/MovieCard";
import Navbar from "../components/Navbar";

const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const PROFILE_IMAGE_URL = "https://image.tmdb.org/t/p/w185";

const pageStyles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "32px clamp(20px, 5vw, 72px) 72px",
    color: "#f5f3ef"
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "24px",
    padding: "9px 13px",
    border: "1px solid #44414b",
    borderRadius: "8px",
    backgroundColor: "#242229",
    color: "#f0edf4",
    font: "inherit",
    cursor: "pointer"
  },
  message: {
    padding: "18px",
    border: "1px solid #2b2931",
    borderRadius: "10px",
    backgroundColor: "#19181e",
    color: "#aaa7b2",
    textAlign: "center"
  },
  error: {
    borderColor: "#6a3338",
    backgroundColor: "#2e1a1c",
    color: "#ffb4b4"
  },
  hero: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: "32px",
    marginBottom: "40px"
  },
  posterColumn: {
    flex: "0 1 280px",
    width: "100%",
    maxWidth: "280px",
    minWidth: 0
  },
  poster: {
    display: "block",
    width: "100%",
    aspectRatio: "2 / 3",
    objectFit: "cover",
    border: "1px solid #2b2931",
    borderRadius: "12px",
    backgroundColor: "#25232b",
    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.35)"
  },
  posterPlaceholder: {
    display: "grid",
    placeItems: "center",
    width: "100%",
    aspectRatio: "2 / 3",
    border: "1px solid #2b2931",
    borderRadius: "12px",
    backgroundColor: "#25232b",
    color: "#85818d"
  },
  details: {
    flex: "1 1 380px",
    minWidth: 0,
    paddingTop: "8px"
  },
  title: {
    margin: "0 0 18px",
    fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
    lineHeight: 1.12,
    overflowWrap: "anywhere"
  },
  metadata: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "12px",
    margin: "0 0 22px"
  },
  metadataItem: {
    padding: "12px 14px",
    border: "1px solid #2b2931",
    borderRadius: "9px",
    backgroundColor: "#19181e"
  },
  metadataLabel: {
    display: "block",
    marginBottom: "5px",
    color: "#85818d",
    fontSize: "0.76rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em"
  },
  metadataValue: {
    color: "#f0edf4",
    fontSize: "0.92rem",
    lineHeight: 1.45
  },
  overviewTitle: {
    margin: "0 0 8px",
    fontSize: "1.1rem"
  },
  overview: {
    margin: 0,
    color: "#d0cdd5",
    fontSize: "0.98rem",
    lineHeight: 1.7,
    whiteSpace: "pre-line"
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "24px"
  },
  actionButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minHeight: "42px",
    padding: "9px 13px",
    border: "1px solid #44414b",
    borderRadius: "8px",
    backgroundColor: "#242229",
    color: "#f0edf4",
    font: "inherit",
    fontWeight: 700,
    cursor: "pointer"
  },
  section: {
    marginTop: "36px"
  },
  sectionTitle: {
    margin: "0 0 16px",
    fontSize: "1.45rem"
  },
  trailerFrame: {
    display: "block",
    width: "100%",
    aspectRatio: "16 / 9",
    border: "1px solid #2b2931",
    borderRadius: "12px",
    backgroundColor: "#19181e"
  },
  category: {
    marginTop: "28px"
  },
  categoryTitle: {
    margin: "0 0 14px",
    fontSize: "1.1rem",
    color: "#f4c96b"
  },
  peopleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))",
    gap: "18px 14px"
  },
  personCard: {
    minWidth: 0,
    textAlign: "center"
  },
  portrait: {
    display: "block",
    width: "100%",
    maxWidth: "140px",
    aspectRatio: "2 / 3",
    margin: "0 auto 9px",
    border: "1px solid #393740",
    borderRadius: "8px",
    backgroundColor: "#25232b",
    objectFit: "cover",
    objectPosition: "center top"
  },
  portraitPlaceholder: {
    display: "grid",
    placeItems: "center",
    width: "100%",
    maxWidth: "140px",
    aspectRatio: "2 / 3",
    margin: "0 auto 9px",
    border: "1px solid #393740",
    borderRadius: "8px",
    backgroundColor: "#25232b",
    color: "#85818d"
  },
  personName: {
    margin: 0,
    color: "#f0edf4",
    fontSize: "0.88rem",
    fontWeight: 700,
    lineHeight: 1.35,
    overflowWrap: "anywhere"
  },
  personRole: {
    display: "block",
    marginTop: "4px",
    color: "#aaa7b2",
    fontSize: "0.76rem",
    lineHeight: 1.35,
    overflowWrap: "anywhere"
  },
  emptyText: {
    margin: 0,
    color: "#aaa7b2"
  }
};

function formatReleaseDate(releaseDate) {
  if (!releaseDate) return "Unknown";
  const parsedDate = new Date(`${releaseDate}T00:00:00`);
  return Number.isNaN(parsedDate.getTime())
    ? releaseDate
    : parsedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
}

function formatRuntime(runtime) {
  if (!Number.isFinite(runtime) || runtime <= 0) return "Unknown";
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return hours ? `${hours}h ${minutes}m` : `${minutes} min`;
}

function getCrewCategories(crew) {
  const groups = new Map();
  crew.forEach((credit) => {
    const category =
      credit.department || credit.known_for_department || "Other";
    if (!groups.has(category)) groups.set(category, new Map());

    const people = groups.get(category);
    const id = credit.id == null
      ? `${credit.name}:${credit.job || ""}`
      : String(credit.id);
    const existing = people.get(id);
    if (existing) {
      if (credit.job && !existing.jobs.includes(credit.job)) {
        existing.jobs.push(credit.job);
      }
    } else {
      people.set(id, {
        ...credit,
        jobs: credit.job ? [credit.job] : []
      });
    }
  });

  return Array.from(groups, ([category, people]) => ({
    category,
    people: Array.from(people.values())
  })).sort((first, second) => first.category.localeCompare(second.category));
}

function getTrailer(videos = []) {
  const trailers = videos.filter(
    (video) =>
      video.type === "Trailer" &&
      video.key &&
      (video.site === "YouTube" || video.site === "Vimeo")
  );
  return trailers.find((video) => video.official) || trailers[0] || null;
}

function getTrailerUrl(trailer) {
  if (trailer.site === "YouTube") {
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(trailer.key)}`;
  }
  return `https://player.vimeo.com/video/${encodeURIComponent(trailer.key)}`;
}

function StaffCategory({ title, people, isCast = false }) {
  return (
    <section style={pageStyles.category}>
      <h3 style={pageStyles.categoryTitle}>{title}</h3>
      <div style={pageStyles.peopleGrid}>
        {people.map((person, index) => {
          const role = isCast
            ? person.character
            : person.jobs?.join(", ") || person.job;
          return (
            <article
              key={person.credit_id || `${person.id || person.name}-${index}`}
              style={pageStyles.personCard}
            >
              {person.profile_path ? (
                <img
                  src={`${PROFILE_IMAGE_URL}${person.profile_path}`}
                  alt={person.name}
                  loading="lazy"
                  style={pageStyles.portrait}
                />
              ) : (
                <div
                  role="img"
                  aria-label={`No portrait available for ${person.name}`}
                  style={pageStyles.portraitPlaceholder}
                >
                  <UserRound size={32} />
                </div>
              )}
              <p style={pageStyles.personName}>{person.name}</p>
              {role && <span style={pageStyles.personRole}>{role}</span>}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function MovieDetails() {
  const navigate = useNavigate();
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const { userRatings, ratingsError, handleSaveRating, handleClearRating } =
    useUserRatings();
  const {
    userTitles,
    watchlistError,
    watchlistLoading,
    handleToggleWatchlist,
    handleToggleWatched
  } = useUserWatchlist();

  useEffect(() => {
    const controller = new AbortController();
    setMovie(null);
    setLoading(true);
    setError("");

    fetchMovieDetails(movieId, controller.signal)
      .then(setMovie)
      .catch((fetchError) => {
        if (!controller.signal.aborted) {
          setError(
            fetchError.response?.data?.message ||
              fetchError.message ||
              "Could not load movie details."
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [movieId]);

  const crewCategories = useMemo(
    () => getCrewCategories(movie?.credits?.crew || []),
    [movie]
  );
  const userTitle = userTitles.find(
    (title) => String(title.id) === String(movie?.id)
  );
  const userRating = movie ? userRatings[movie.id] : null;
  const trailer = getTrailer(movie?.videos?.results || []);
  const cast = movie?.credits?.cast || [];
  const productionCompanies =
    movie?.production_companies?.map((company) => company.name).filter(Boolean) ||
    [];

  return (
    <div>
      <Navbar
        actions={[
          { label: "Home", onClick: () => navigate("/home") },
          { label: "Search", onClick: () => navigate("/search") },
          { label: "Watchlist", onClick: () => navigate("/watchlist") }
        ]}
      />
      <main style={pageStyles.container}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={pageStyles.backButton}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        {loading && <div style={pageStyles.message}>Loading movie details...</div>}
        {!loading && error && (
          <div role="alert" style={{ ...pageStyles.message, ...pageStyles.error }}>
            {error}
          </div>
        )}
        {!loading && !error && movie && (
          <>
            <section style={pageStyles.hero}>
              <div style={pageStyles.posterColumn}>
                {movie.poster_path ? (
                  <img
                    src={`${IMAGE_URL}${movie.poster_path}`}
                    alt={`${movie.title} poster`}
                    style={pageStyles.poster}
                  />
                ) : (
                  <div style={pageStyles.posterPlaceholder}>Poster unavailable</div>
                )}
              </div>

              <div style={pageStyles.details}>
                <h1 style={pageStyles.title}>{movie.title}</h1>
                <div style={pageStyles.metadata}>
                  <div style={pageStyles.metadataItem}>
                    <span style={pageStyles.metadataLabel}>Studio</span>
                    <span style={pageStyles.metadataValue}>
                      {productionCompanies.join(", ") || "Unknown"}
                    </span>
                  </div>
                  <div style={pageStyles.metadataItem}>
                    <span style={pageStyles.metadataLabel}>Release date</span>
                    <span style={pageStyles.metadataValue}>
                      {formatReleaseDate(movie.release_date)}
                    </span>
                  </div>
                  <div style={pageStyles.metadataItem}>
                    <span style={pageStyles.metadataLabel}>Runtime</span>
                    <span style={pageStyles.metadataValue}>
                      {formatRuntime(movie.runtime)}
                    </span>
                  </div>
                  <div style={pageStyles.metadataItem}>
                    <span style={pageStyles.metadataLabel}>Genres</span>
                    <span style={pageStyles.metadataValue}>
                      {movie.genres?.map((genre) => genre.name).join(", ") ||
                        "Unknown"}
                    </span>
                  </div>
                </div>

                <h2 style={pageStyles.overviewTitle}>Description</h2>
                <p style={pageStyles.overview}>
                  {movie.overview || "No description available."}
                </p>

                <div style={pageStyles.actions}>
                  <button
                    type="button"
                    disabled={watchlistLoading}
                    aria-pressed={Boolean(userTitle?.in_watchlist)}
                    onClick={() => handleToggleWatchlist(movie)}
                    style={{
                      ...pageStyles.actionButton,
                      ...(userTitle?.in_watchlist
                        ? { borderColor: "#f4c96b", color: "#f4c96b" }
                        : {})
                    }}
                  >
                    <Bookmark
                      size={17}
                      fill={userTitle?.in_watchlist ? "currentColor" : "none"}
                    />
                    <span>
                      {userTitle?.in_watchlist
                        ? "Remove from Watchlist"
                        : "Add to Watchlist"}
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={watchlistLoading}
                    aria-pressed={Boolean(userTitle?.watched)}
                    onClick={() => handleToggleWatched(movie)}
                    style={{
                      ...pageStyles.actionButton,
                      ...(userTitle?.watched
                        ? { borderColor: "#10b981", color: "#10b981" }
                        : {})
                    }}
                  >
                    {userTitle?.watched ? (
                      <Eye size={17} />
                    ) : (
                      <EyeOff size={17} />
                    )}
                    <span>
                      {userTitle?.watched
                        ? "Mark as Unwatched"
                        : "Mark as Watched"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRatingDialogOpen(true)}
                    style={pageStyles.actionButton}
                  >
                    <Star
                      size={17}
                      fill={userRating ? "#f4c96b" : "none"}
                      color="#f4c96b"
                    />
                    <span>
                      {userRating ? `Your Rating: ${userRating}/10` : "Rate Movie"}
                    </span>
                  </button>
                </div>
                {watchlistError && (
                  <p role="alert" style={{ ...pageStyles.personRole, color: "#ffb4b4" }}>
                    {watchlistError}
                  </p>
                )}
                {ratingsError && (
                  <p role="alert" style={{ ...pageStyles.personRole, color: "#ffb4b4" }}>
                    {ratingsError}
                  </p>
                )}
              </div>
            </section>

            {trailer && (
              <section style={pageStyles.section}>
                <h2 style={pageStyles.sectionTitle}>Trailer</h2>
                <iframe
                  src={getTrailerUrl(trailer)}
                  title={`${movie.title} trailer`}
                  style={pageStyles.trailerFrame}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </section>
            )}

            <section style={pageStyles.section}>
              <h2 style={pageStyles.sectionTitle}>Cast and crew</h2>
              {cast.length > 0 && (
                <StaffCategory title="Cast" people={cast} isCast />
              )}
              {crewCategories.map(({ category, people }) => (
                <StaffCategory
                  key={category}
                  title={category}
                  people={people}
                />
              ))}
              {cast.length === 0 && crewCategories.length === 0 && (
                <p style={pageStyles.emptyText}>No cast or crew information available.</p>
              )}
            </section>
          </>
        )}
      </main>
      {ratingDialogOpen && movie && (
        <MovieRatingDialog
          movie={movie}
          userRating={userRating}
          onSave={handleSaveRating}
          onClear={handleClearRating}
          onClose={() => setRatingDialogOpen(false)}
        />
      )}
    </div>
  );
}
