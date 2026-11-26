import React, { useEffect, useRef, useState } from "react";
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
    backdropFilter: "blur(6px)",
    opacity: 1,
    transition: "opacity 180ms ease"
  },
  dialog: {
    position: "relative",
    width: "min(560px, 100%)",
    boxSizing: "border-box",
    maxHeight: "calc(100vh - 40px)",
    overflowY: "auto",
    padding: "24px 16px 16px",
    border: "1px solid #393740",
    borderRadius: "14px",
    backgroundColor: "#19181e",
    color: "#f5f3ef",
    boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
    transform: "translateY(8px) scale(0.98)",
    transition: "transform 180ms ease"
  },
  close: {
    position: "absolute",
    top: "16px",
    right: "calc(5% - 3.5px)",
    zIndex: 1,
    width: "36px",
    height: "36px",
    display: "grid",
    placeItems: "center",
    padding: 0,
    border: "none",
    backgroundColor: "transparent",
    color: "#f5f3ef",
    cursor: "pointer"
  },
  metadata: {
    margin: 0,
    color: "#aaa7b2",
    fontSize: "0.9rem"
  },
  sectionTitle: {
    margin: "0 0 14px",
    textAlign: "center",
    color: "#f5f3ef",
    fontSize: "1rem"
  },
  ratingStars: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "2px",
    marginBottom: "18px"
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
  reviewToggle: {
    display: "block",
    margin: "0 0 14px",
    marginLeft: "max(0px, calc(5% - 10.9px))",
    padding: 0,
    border: "none",
    backgroundColor: "transparent",
    color: "#60a5fa",
    font: "inherit",
    fontWeight: 700,
    textDecoration: "underline",
    textUnderlineOffset: "3px",
    cursor: "pointer"
  },
  reviewField: {
    maxHeight: 0,
    overflow: "hidden",
    opacity: 0,
    visibility: "hidden",
    transition:
      "max-height 240ms ease, opacity 180ms ease, visibility 0s linear 240ms"
  },
  reviewFieldExpanded: {
    maxHeight: "420px",
    opacity: 1,
    visibility: "visible",
    transitionDelay: "0s"
  },
  textarea: {
    width: "100%",
    minHeight: "180px",
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
    marginTop: "18px"
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
  onClearRating,
  onMarkWatched,
  onSave,
  canWriteReview = true,
  onClose
}) {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const closeTimerRef = useRef(null);
  const [reviewText, setReviewText] = useState(initialReview ?? "");
  const [reviewLoaded, setReviewLoaded] = useState(initialReview !== undefined);
  const [reviewLoadError, setReviewLoadError] = useState("");
  const [company, setCompany] = useState(productionCompany || "");
  const [rating, setRating] = useState(Math.round(Number(userRating) || 0));
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewExpanded, setReviewExpanded] = useState(initialReview !== undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleClose() {
    if (isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, 180);
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    setRating(Math.round(Number(userRating) || 0));
  }, [userRating]);

  useEffect(() => {
    const controller = new AbortController();
    if (initialReview === undefined) {
      fetchUserReview(movie.id, controller.signal)
        .then((review) => {
          const text = review?.review_text || "";
          setReviewText(text);
          if (text) setReviewExpanded(true);
        })
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
    if (rating < 1 || rating > 10) {
      setError("Rate this movie before saving a review.");
      return;
    }
    if (!text || text.length > 5000) {
      setError("Enter a review between 1 and 5000 characters.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave(
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
      const watched = await onMarkWatched?.(movie);
      if (watched === false) {
        setError(
          "Review saved, but could not mark this movie as watched."
        );
        return;
      }
      handleClose();
    } catch (saveError) {
      setError(saveError.message || "Could not save your review.");
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div
      style={{
        ...styles.overlay,
        opacity: isVisible && !isClosing ? 1 : 0,
        pointerEvents: isVisible && !isClosing ? "auto" : "none"
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <article
        style={{
          ...styles.dialog,
          ...(isVisible && !isClosing
            ? { transform: "translateY(0) scale(1)" }
            : {})
        }}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape") handleClose();
        }}
      >
        <button
          type="button"
          style={styles.close}
          aria-label="Close review editor"
          onClick={handleClose}
        >
          <X size={18} />
        </button>

        <form onSubmit={handleSubmit}>
          <h3 style={styles.sectionTitle}>Rate this movie</h3>
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
                  onClick={async () => {
                    const previousRating = rating;
                    if (starRating === previousRating) {
                      if (!onClearRating) return;
                      try {
                        const cleared = await onClearRating(movie);
                        if (cleared === false) {
                          setError("Could not clear your rating.");
                          return;
                        }
                        setRating(0);
                        setHoveredRating(0);
                        setError("");
                      } catch (ratingError) {
                        setError(
                          ratingError.message || "Could not clear your rating."
                        );
                      }
                      return;
                    }

                    setRating(starRating);
                    try {
                      const saved = await onSaveRating?.(
                        movie,
                        starRating.toFixed(1)
                      );
                      if (saved === false) {
                        setRating(previousRating);
                        setError("Could not save your rating.");
                        return;
                      }
                      const watched = await onMarkWatched?.(movie);
                      if (watched === false) {
                        setError(
                          "Rating saved, but could not mark this movie as watched."
                        );
                        return;
                      }
                      setError("");
                    } catch (ratingError) {
                      setRating(previousRating);
                      setError(ratingError.message || "Could not save your rating.");
                    }
                  }}
                  style={{
                    ...styles.ratingStarButton,
                    color: isSelected ? "#60a5fa" : "#85818d"
                  }}
                >
                  <Star size={20} fill={isSelected ? "currentColor" : "none"} />
                </button>
              );
            })}
          </div>
          {canWriteReview && (
            <button
              type="button"
              aria-expanded={reviewExpanded}
              onClick={() => setReviewExpanded((expanded) => !expanded)}
              style={styles.reviewToggle}
            >
              {reviewExpanded
                ? "Hide review"
                : reviewText
                  ? "Edit review"
                  : "Write a review"}
            </button>
          )}
          <div
            style={{
              ...styles.reviewField,
              ...(reviewExpanded ? styles.reviewFieldExpanded : {})
            }}
            aria-hidden={!reviewExpanded}
          >
            <textarea
              value={reviewText}
              onChange={(event) => {
                setReviewText(event.target.value);
                setError("");
              }}
              maxLength={5000}
              disabled={!reviewExpanded || !reviewLoaded || saving}
              placeholder="What did you think of this movie?"
              aria-label="Your review"
              style={styles.textarea}
            />
          </div>
          {reviewLoadError && <p style={styles.error}>{reviewLoadError}</p>}
          {reviewExpanded && canWriteReview && rating < 1 && (
            <p style={styles.metadata}>A rating is required to save a review.</p>
          )}
          {error && <p style={styles.error}>{error}</p>}
          {reviewExpanded && canWriteReview && (
            <div style={styles.actions}>
              <span style={styles.count}>{reviewText.length}/5000</span>
              <button
                type="submit"
                style={{
                  ...styles.save,
                  opacity:
                    !reviewLoaded || saving || !reviewText.trim() || rating < 1
                      ? 0.6
                      : 1,
                  cursor:
                    !reviewLoaded || saving || !reviewText.trim() || rating < 1
                      ? "default"
                      : "pointer"
                }}
                disabled={
                  !reviewLoaded || saving || !reviewText.trim() || rating < 1
                }
              >
                {saving ? "Saving..." : "Save review"}
              </button>
            </div>
          )}
        </form>
      </article>
    </div>,
    document.body
  );
}
