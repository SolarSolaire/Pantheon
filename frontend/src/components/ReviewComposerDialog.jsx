import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Star, X } from "lucide-react";
import { fetchMovieProductionCompany } from "../api/tmdb";
import { fetchUserReview } from "../api/userData";

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
  metadata: {
    margin: 0,
    color: "#aaa7b2",
    fontSize: "0.9rem"
  },
  sectionTitle: {
    margin: "0 0 10px",
    color: "#f5f3ef",
    fontSize: "1rem"
  },
  ratingStars: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "2px",
    marginBottom: "14px"
  },
  ratingStarButton: {
    display: "grid",
    placeItems: "center",
    flex: 1,
    minWidth: 0,
    padding: "4px 0",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "transparent",
    cursor: "pointer",
    transition: "transform 140ms ease, filter 140ms ease"
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

export default function ReviewComposerDialog({
  movie,
  productionCompany,
  initialReview,
  userRating,
  onSaveRating,
  onSave,
  onSaved,
  onClose
}) {
  const [reviewText, setReviewText] = useState(initialReview ?? "");
  const [reviewLoaded, setReviewLoaded] = useState(initialReview !== undefined);
  const [reviewLoadError, setReviewLoadError] = useState("");
  const [company, setCompany] = useState(productionCompany || "");
  const [rating, setRating] = useState(Math.round(Number(userRating) || 0));
  const [hoveredRating, setHoveredRating] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setRating(Math.round(Number(userRating) || 0));
  }, [userRating]);

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
            console.error(
              `Could not load production company for movie ${movie.id}:`,
              loadError
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

        <form onSubmit={handleSubmit}>
          <h3 style={styles.sectionTitle}>Your review</h3>
          <div
            role="group"
            aria-label="Rate this movie"
            style={styles.ratingStars}
          >
            {Array.from({ length: 10 }, (_, index) => {
              const starRating = index + 1;
              const displayedRating = hoveredRating || rating;
              const isSelected = starRating <= displayedRating;
              return (
                <button
                  key={starRating}
                  type="button"
                  aria-label={`Rate ${starRating} out of 10`}
                  aria-pressed={starRating === rating}
                  title={`${starRating} / 10`}
                  onMouseEnter={() => setHoveredRating(starRating)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onFocus={() => setHoveredRating(starRating)}
                  onBlur={() => setHoveredRating(0)}
                  onClick={() => {
                    setRating(starRating);
                    onSaveRating?.(movie, starRating.toFixed(1));
                  }}
                  style={{
                    ...styles.ratingStarButton,
                    color: isSelected ? "#f4c96b" : "#85818d"
                  }}
                >
                  <Star size={20} fill={isSelected ? "currentColor" : "none"} />
                </button>
              );
            })}
          </div>
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
