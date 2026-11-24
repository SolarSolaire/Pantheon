import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  Eye,
  EyeOff,
  MessageSquareText,
  Star,
  UserRound,
} from "lucide-react";
import { isAuthenticated } from "../utils/auth";
import { fetchMovieDetails } from "../api/tmdb";
import { fetchMovieReviews, fetchUserProfile, logoutUser } from "../api/userData";
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
    color: "#f5f3ef",
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
    cursor: "pointer",
  },
  message: {
    padding: "18px",
    border: "1px solid #2b2931",
    borderRadius: "10px",
    backgroundColor: "#19181e",
    color: "#aaa7b2",
    textAlign: "center",
  },
  error: {
    borderColor: "#6a3338",
    backgroundColor: "#2e1a1c",
    color: "#ffb4b4",
  },
  hero: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: "32px",
    marginBottom: "40px",
  },
  posterColumn: {
    flex: "0 1 280px",
    width: "100%",
    maxWidth: "280px",
    minWidth: 0,
  },
  poster: {
    display: "block",
    width: "100%",
    aspectRatio: "2 / 3",
    objectFit: "cover",
    border: "1px solid #2b2931",
    borderRadius: "12px",
    backgroundColor: "#25232b",
    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.35)",
  },
  posterPlaceholder: {
    display: "grid",
    placeItems: "center",
    width: "100%",
    aspectRatio: "2 / 3",
    border: "1px solid #2b2931",
    borderRadius: "12px",
    backgroundColor: "#25232b",
    color: "#85818d",
  },
  details: {
    flex: "1 1 380px",
    minWidth: 0,
    paddingTop: "8px",
  },
  title: {
    margin: "0 0 10px",
    fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
    lineHeight: 1.12,
    overflowWrap: "anywhere",
  },
  metadata: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    margin: "0 0 18px",
  },
  metadataLabel: {
    display: "block",
    marginBottom: "5px",
    color: "#85818d",
    fontSize: "0.76rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  metadataValue: {
    color: "#f0edf4",
    fontSize: "0.92rem",
    lineHeight: 1.45,
  },
  runtime: {
    marginBottom: "18px",
    color: "#d0cdd5",
    fontSize: "0.98rem",
  },
  genreSection: {
    marginBottom: "20px",
  },
  genreList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "8px",
  },
  genreChip: {
    padding: "6px 10px",
    border: "1px solid #44414b",
    borderRadius: "999px",
    backgroundColor: "#242229",
    color: "#f4c96b",
    fontSize: "0.85rem",
  },
  overview: {
    margin: "0 0 20px",
    color: "#d0cdd5",
    fontSize: "0.98rem",
    lineHeight: 1.7,
    whiteSpace: "pre-line",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "24px",
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
    cursor: "pointer",
  },
  section: {
    marginTop: "36px",
  },
  sectionTitle: {
    margin: "0 0 16px",
    fontSize: "1.45rem",
  },
  category: {
    marginTop: "16px",
  },
  categoryTitle: {
    padding: "10px 0",
    color: "#f4c96b",
    fontSize: "1.05rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  peopleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))",
    gap: "18px 14px",
    padding: "0 0 16px",
  },
  personCard: {
    minWidth: 0,
    textAlign: "center",
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
    objectPosition: "center top",
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
    color: "#85818d",
  },
  personName: {
    margin: 0,
    color: "#f0edf4",
    fontSize: "0.88rem",
    fontWeight: 700,
    lineHeight: 1.35,
    overflowWrap: "anywhere",
  },
  personRole: {
    display: "block",
    marginTop: "4px",
    color: "#aaa7b2",
    fontSize: "0.76rem",
    lineHeight: 1.35,
    overflowWrap: "anywhere",
  },
  emptyText: {
    margin: 0,
    color: "#aaa7b2",
  },
  reviewsList: {
    display: "grid",
    gap: "16px",
  },
  reviewCard: {
    padding: "16px",
    border: "1px solid #2b2931",
    borderRadius: "10px",
    backgroundColor: "#19181e",
  },
  reviewHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  reviewUser: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#f0edf4",
    fontSize: "0.95rem",
    fontWeight: 700,
  },
  reviewRating: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "#f4c96b",
    fontSize: "0.9rem",
    fontWeight: 700,
  },
  reviewDate: {
    color: "#aaa7b2",
    fontSize: "0.8rem",
  },
  reviewText: {
    margin: 0,
    color: "#d0cdd5",
    fontSize: "0.95rem",
    lineHeight: 1.6,
    whiteSpace: "pre-line",
    overflowWrap: "anywhere",
  },
  emptyReviews: {
    padding: "40px 20px",
    border: "1px solid #2b2931",
    borderRadius: "10px",
    backgroundColor: "#19181e",
    textAlign: "center",
  },
};

function formatReleaseDate(releaseDate) {
  if (!releaseDate) return "Unknown";
  const parsedDate = new Date(`${releaseDate}T00:00:00`);
  return Number.isNaN(parsedDate.getTime())
    ? releaseDate
    : parsedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
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
    const id =
      credit.id == null
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
        jobs: credit.job ? [credit.job] : [],
      });
    }
  });

  return Array.from(groups, ([category, people]) => ({
    category,
    people: Array.from(people.values()),
  })).sort((first, second) => first.category.localeCompare(second.category));
}

function getCrewPeople(crew, predicate) {
  return getCrewCategories(crew.filter(predicate)).flatMap(
    ({ people }) => people,
  );
}

function StaffCategory({ title, people, isCast = false, defaultOpen = false }) {
  const peopleWithPortraitsFirst = [...people].sort(
    (first, second) =>
      Number(!first.profile_path) - Number(!second.profile_path),
  );

  return (
    <details style={pageStyles.category} open={defaultOpen}>
      <summary style={pageStyles.categoryTitle}>{title}</summary>
      <div style={pageStyles.peopleGrid}>
        {peopleWithPortraitsFirst.map((person, index) => {
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
    </details>
  );
}

export default function MovieDetails() {
  const navigate = useNavigate();
  const { movieId } = useParams();
  
  // New state to hold the current user's profile data
  const [currentUser, setCurrentUser] = useState(null);
  
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewsError, setReviewsError] = useState("");
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const { userRatings, ratingsError, handleSaveRating, handleClearRating } =
    useUserRatings();
  const {
    userTitles,
    watchlistError,
    watchlistLoading,
    handleToggleWatchlist,
    handleToggleWatched,
  } = useUserWatchlist();

  // Authentication and user loading effect
  useEffect(() => {
    const redirectIfSignedOut = () => {
      if (!isAuthenticated()) {
        navigate("/login", { replace: true });
        return false;
      }
      return true;
    };

    const loadUser = async () => {
      if (redirectIfSignedOut()) {
        try {
          const profile = await fetchUserProfile();
          setCurrentUser(profile);
        } catch (error) {
          console.error("Failed to load user profile:", error);
        }
      }
    };

    loadUser();

    window.addEventListener("storage", redirectIfSignedOut);
    window.addEventListener("focus", redirectIfSignedOut);
    return () => {
      window.removeEventListener("storage", redirectIfSignedOut);
      window.removeEventListener("focus", redirectIfSignedOut);
    };
  }, [navigate]);

  async function saveRatingAndMarkWatched(ratingMovie, rating) {
    const saved = await handleSaveRating(ratingMovie, rating);
    if (saved === false) return false;

    const userTitle = userTitles.find(
      (title) => String(title.id) === String(ratingMovie.id),
    );
    if (userTitle?.watched) return true;

    const watched = await handleToggleWatched(ratingMovie);
    if (watched === false) {
      throw new Error("Rating saved, but could not mark the movie as watched.");
    }
    return true;
  }

  async function handleAuthAction() {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Could not revoke user session:", error);
    }
    navigate("/login", { replace: true });
  }

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
              "Could not load movie details.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [movieId]);

  // Fetches reviews from the backend
  useEffect(() => {
    const controller = new AbortController();
    setReviews([]);
    setReviewsLoading(true);
    setReviewsError("");

    fetchMovieReviews(movieId, controller.signal)
      .then((data) => setReviews(data || []))
      .catch((err) => {
        if (!controller.signal.aborted) {
          setReviewsError(
            err.response?.data?.message ||
              err.message ||
              "Could not load reviews.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setReviewsLoading(false);
      });

    return () => controller.abort();
  }, [movieId]);

  const crew = movie?.credits?.crew || [];
  const directors = useMemo(
    () => getCrewPeople(crew, (credit) => credit.job === "Director"),
    [crew],
  );
  const writers = useMemo(
    () =>
      getCrewPeople(
        crew,
        (credit) => credit.department === "Writing" || credit.job === "Writer",
      ),
    [crew],
  );
  const crewCategories = useMemo(
    () =>
      getCrewCategories(
        crew.filter(
          (credit) =>
            credit.job !== "Director" &&
            credit.department !== "Writing" &&
            credit.job !== "Writer",
        ),
      ),
    [crew],
  );
  const userTitle = userTitles.find(
    (title) => String(title.id) === String(movie?.id),
  );
  const userRating = movie ? userRatings[movie.id] : null;
  const cast = movie?.credits?.cast || [];
  const productionCompanies =
    movie?.production_companies
      ?.map((company) => company.name)
      .filter(Boolean) || [];

  return (
    <div>
      <Navbar
        userName={currentUser?.name || currentUser?.username}
        actions={[
          { label: "Home", onClick: () => navigate("/home") },
          { label: "Watchlist", onClick: () => navigate("/watchlist") },
          { label: "Reviews", onClick: () => navigate("/reviews") },
          { label: "Account", onClick: () => navigate("/profile") },
          { label: "Logout", onClick: handleAuthAction }
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

        {loading && (
          <div style={pageStyles.message}>Loading movie details...</div>
        )}
        {!loading && error && (
          <div
            role="alert"
            style={{ ...pageStyles.message, ...pageStyles.error }}
          >
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
                  <div style={pageStyles.posterPlaceholder}>
                    Poster unavailable
                  </div>
                )}
              </div>

              <div style={pageStyles.details}>
                <h1 style={pageStyles.title}>{movie.title}</h1>
                <p style={pageStyles.runtime}>
                  <strong>Runtime:</strong> {formatRuntime(movie.runtime)}
                </p>
                <div style={pageStyles.metadata}>
                  <span style={pageStyles.metadataValue}>
                    {formatReleaseDate(movie.release_date)}
                  </span>
                  <span style={pageStyles.metadataValue}>
                    {productionCompanies.join(", ") || "Unknown"}
                  </span>
                </div>
                <p style={pageStyles.overview}>
                  {movie.overview || "No overview available."}
                </p>
                <div style={pageStyles.genreSection}>
                  <span style={pageStyles.metadataLabel}>Genres</span>
                  <div style={pageStyles.genreList}>
                    {movie.genres?.length ? (
                      movie.genres.map((genre) => (
                        <span key={genre.id} style={pageStyles.genreChip}>
                          {genre.name}
                        </span>
                      ))
                    ) : (
                      <span style={pageStyles.genreChip}>Unknown</span>
                    )}
                  </div>
                </div>

                <div style={pageStyles.actions}>
                  <button
                    type="button"
                    disabled={watchlistLoading}
                    aria-pressed={Boolean(userTitle?.in_watchlist)}
                    onClick={() => handleToggleWatchlist(movie)}
                    style={{
                      ...pageStyles.actionButton,
                      ...(userTitle?.in_watchlist
                        ? {
                            backgroundColor: "rgba(244, 201, 107, 0.14)",
                            borderColor: "#f4c96b",
                            color: "#f4c96b",
                            boxShadow: "0 0 8px rgba(244, 201, 107, 0.4)",
                          }
                        : {}),
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
                        ? {
                            borderColor: "#10b981",
                            color: "#10b981",
                            boxShadow: "0 0 8px rgba(16, 185, 129, 0.65)",
                          }
                        : {}),
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
                      {userRating
                        ? `Your Rating: ${userRating}/10`
                        : "Rate Movie"}
                    </span>
                  </button>
                </div>
                {watchlistError && (
                  <p
                    role="alert"
                    style={{ ...pageStyles.personRole, color: "#ffb4b4" }}
                  >
                    {watchlistError}
                  </p>
                )}
                {ratingsError && (
                  <p
                    role="alert"
                    style={{ ...pageStyles.personRole, color: "#ffb4b4" }}
                  >
                    {ratingsError}
                  </p>
                )}
              </div>
            </section>

            {/* --- COLLAPSIBLE REVIEWS SECTION --- */}
            <section style={pageStyles.section}>
              <h2 style={pageStyles.sectionTitle}>User Reviews</h2>
              <details style={pageStyles.category} open>
                <summary style={pageStyles.categoryTitle}>All Reviews</summary>
                <div style={{ marginTop: "16px" }}>
                  {reviewsLoading && (
                    <p style={pageStyles.emptyText}>Loading reviews...</p>
                  )}
                  {!reviewsLoading && reviewsError && (
                    <p style={{ ...pageStyles.emptyText, color: "#ffb4b4" }}>
                      {reviewsError}
                    </p>
                  )}
                  {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                    <div style={pageStyles.emptyReviews}>
                      <MessageSquareText
                        size={32}
                        color="#5b5763"
                        style={{ marginBottom: "12px" }}
                      />
                      <p style={pageStyles.emptyText}>
                        No reviews yet. Be the first to review this movie!
                      </p>
                    </div>
                  )}
                  {!reviewsLoading && !reviewsError && reviews.length > 0 && (
                    <div style={pageStyles.reviewsList}>
                      {reviews.map((review) => (
                        <article
                          key={review.review_id}
                          style={pageStyles.reviewCard}
                        >
                          <div style={pageStyles.reviewHeader}>
                            <div style={pageStyles.reviewUser}>
                              <UserRound size={18} color="#aaa7b2" />
                              <span>{review.username}</span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                              }}
                            >
                              <span style={pageStyles.reviewDate}>
                                {new Date(
                                  review.created_at,
                                ).toLocaleDateString()}
                              </span>
                              {review.user_rating && (
                                <div style={pageStyles.reviewRating}>
                                  <Star size={14} fill="#f4c96b" />
                                  <span>{review.user_rating}/10</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <p style={pageStyles.reviewText}>
                            {review.review_text}
                          </p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </details>
            </section>

            <section style={pageStyles.section}>
              <h2 style={pageStyles.sectionTitle}>Cast and crew</h2>
              {cast.length > 0 && (
                <StaffCategory title="Cast" people={cast} isCast defaultOpen />
              )}
              {directors.length > 0 && (
                <StaffCategory
                  title="Director"
                  people={directors}
                  defaultOpen
                />
              )}
              {writers.length > 0 && (
                <StaffCategory title="Writer" people={writers} defaultOpen />
              )}
              {crewCategories.map(({ category, people }) => (
                <StaffCategory
                  key={category}
                  title={category}
                  people={people}
                />
              ))}
              {cast.length === 0 &&
                directors.length === 0 &&
                writers.length === 0 &&
                crewCategories.length === 0 && (
                  <p style={pageStyles.emptyText}>
                    No cast or crew information available.
                  </p>
                )}
            </section>
          </>
        )}
      </main>
      {ratingDialogOpen && movie && (
        <MovieRatingDialog
          movie={movie}
          userRating={userRating}
          onSave={saveRatingAndMarkWatched}
          onClear={handleClearRating}
          onClose={() => setRatingDialogOpen(false)}
        />
      )}
    </div>
  );
}