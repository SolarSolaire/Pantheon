import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { fetchMovieProductionCompany } from "../api/tmdb";
import { fetchUserReview } from "../api/userData";

const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    backgroundColor: "rgba(0, 0, 0, 0.82)",
    backdropFilter: "blur(6px)"
  },
  dialog: {
    position: "relative",
    width: "min(760px, 100%)",
    maxHeight: "calc(100vh - 40px)",
    overflowY: "auto",
    padding: "28px",
    border: "1px solid #393740",
    borderRadius: "14px",
    backgroundColor: "#19181e",
    color: "#f5f3ef",
    boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
  },
  close: {
    position: "absolute",
    top: "16px",
    right: "16px",
    zIndex: 1,
    width: "36px",
    height: "36px",
    display: "grid",
    placeItems: "center",
    padding: 0,
    border: "1px solid #44414b",
    borderRadius: "50%",
    backgroundColor: "#242229",
    color: "#f5f3ef",
    cursor: "pointer"
  },
  header: {
    display: "grid",
    gridTemplateColumns: "minmax(100px, 170px) minmax(0, 1fr)",
    gap: "22px",
    alignItems: "start",
    paddingRight: "28px"
  },
  poster: {
    width: "100%",
    aspectRatio: "2/3",
    objectFit: "cover",
    border: "1px solid #393740",
    borderRadius: "10px",
    backgroundColor: "#25232b"
  },
  details: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "9px"
  },
  title: {
    margin: "2px 0 0",
    color: "#f5f3ef",
    fontSize: "1.45rem",
    lineHeight: 1.2
  },
  metadata: {
    margin: 0,
    color: "#aaa7b2",
    fontSize: "0.9rem"
  },
  sectionTitle: {
    margin: "24px 0 10px",
    color: "#f5f3ef",
    fontSize: "1rem"
  },
  textarea: {
    width: "100%",
    minHeight: "160px",
    resize: "vertical",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #44414b",
    borderRadius: "9px",
    backgroundColor: "#111015",
    color: "#f5f3ef",
    font: "inherit",
    lineHeight: 1.5
  },
  error: {
    margin: "10px 0 0",
    color: "#ffb4b4",
    fontSize: "0.88rem"
  },
  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "14px"
  },
  count: {
    color: "#aaa7b2",
    fontSize: "0.82rem"
  },
  save: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#f4c96b",
    color: "#17140d",
    fontSize: "0.9rem",
    fontWeight: 800,
    cursor: "pointer"
  }
};

function getYear(date) {
  return date ? date.slice(0, 4) : "Year unknown";
}

export default function ReviewComposerDialog({
  movie,
  productionCompany,
  initialReview,
  userRating,
  RatingControl,
  onSaveRating,
  onClearRating,
  onSave,
  onSaved,
  onClose
}) {
  const [reviewText, setReviewText] = useState(initialReview ?? "");
  const [reviewLoaded, setReviewLoaded] = useState(initialReview !== undefined);
  const [reviewLoadError, setReviewLoadError] = useState("");
  const [company, setCompany] = useState(productionCompany || "");
  const [companyError, setCompanyError] = useState("");
  const [ratingPopoverOpen, setRatingPopoverOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    if (initialReview === undefined) {
      fetchUserReview(movie.id, controller.signal)
        .then((review) => setReviewText(review?.review_text || ""))
        .catch((loadError) => {
          if (!controller.signal.aborted) {
            setReviewLoadError(
              loadError.message || "Could not load your existing review."
            );
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setReviewLoaded(true);
        });
    }

    if (!company) {
      fetchMovieProductionCompany(movie.id, controller.signal)
        .then((name) => {
          if (!controller.signal.aborted) setCompany(name || "");
        })
        .catch((loadError) => {
          if (!controller.signal.aborted) {
            setCompanyError(
              loadError.message || "Could not load the production company."
            );
          }
        });
    }
    return () => controller.abort();
  }, [company, initialReview, movie.id]);

  async function handleSubmit(event) {
    event.preventDefault();
    const text = reviewText.trim();
    if (!text || text.length > 5000) {
      setError("Enter a review between 1 and 5000 characters.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const savedReview = await onSave(
        {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path || null,
          release_date: movie.release_date || "",
          overview: movie.overview || "",
          production_company: company || null
        },
        text
      );
      onSaved?.(savedReview);
      onClose();
    } catch (saveError) {
      setError(saveError.message || "Could not save your review.");
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <article
        style={styles.dialog}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
      >
        <button
          type="button"
          style={styles.close}
          aria-label="Close review editor"
          onClick={onClose}
        >
          <X size={18} />
        </button>
        <div style={styles.header}>
          {movie.poster_path ? (
            <img
              src={`${IMAGE_URL}${movie.poster_path}`}
              alt={`${movie.title} poster`}
              style={styles.poster}
              onError={(event) => {
                event.currentTarget.style.visibility = "hidden";
              }}
            />
          ) : (
            <div
              role="img"
              aria-label="Movie poster unavailable"
              style={{
                ...styles.poster,
                display: "grid",
                placeItems: "center",
                color: "#aaa7b2",
                fontSize: "0.85rem",
                textAlign: "center"
              }}
            >
              Poster unavailable
            </div>
          )}
          <div style={styles.details}>
            <h2 style={styles.title}>{movie.title}</h2>
            <p style={styles.metadata}>{getYear(movie.release_date)}</p>
            <p style={styles.metadata}>
              {company || (companyError ? "Production company unavailable" : "Loading production company...")}
            </p>
            {RatingControl && onSaveRating && (
              <RatingControl
                movie={movie}
                userRating={userRating}
                onSave={onSaveRating}
                onClear={onClearRating}
                isOpen={ratingPopoverOpen}
                onOpenChange={setRatingPopoverOpen}
              />
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <h3 style={styles.sectionTitle}>Your review</h3>
          <textarea
            value={reviewText}
            onChange={(event) => {
              setReviewText(event.target.value);
              setError("");
            }}
            maxLength={5000}
            disabled={!reviewLoaded || saving}
            placeholder="What did you think of this movie?"
            aria-label="Your review"
            style={styles.textarea}
          />
          {!reviewLoaded && <p style={styles.metadata}>Loading your review...</p>}
          {reviewLoadError && <p style={styles.error}>{reviewLoadError}</p>}
          {companyError && <p style={styles.error}>{companyError}</p>}
          {error && <p style={styles.error}>{error}</p>}
          <div style={styles.actions}>
            <span style={styles.count}>{reviewText.length}/5000</span>
            <button
              type="submit"
              style={{
                ...styles.save,
                opacity: !reviewLoaded || saving ? 0.6 : 1,
                cursor: !reviewLoaded || saving ? "default" : "pointer"
              }}
              disabled={!reviewLoaded || saving}
            >
              {saving ? "Saving..." : "Save review"}
            </button>
          </div>
        </form>
      </article>
    </div>,
    document.body
  );
}
