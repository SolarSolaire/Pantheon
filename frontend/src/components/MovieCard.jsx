import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bookmark,
  Eye,
  EyeOff,
  MessageSquareText,
  RotateCcw,
  Star,
  X
} from "lucide-react";
import { fetchMovieProductionCompany } from "../api/tmdb";
import { saveUserReview } from "../api/userData";
import { isAuthenticated } from "../utils/auth";
import ReviewComposerDialog from "./ReviewComposerDialog";

const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";

const movieStyles = {
  movieCard: {
    minWidth: 0,
    scrollSnapAlign: "start",
    position: "relative"
  },
  movieCardSurface: {
    width: "100%",
    backgroundColor: "#19181e",
    borderRadius: "13px",
    overflow: "hidden",
    border: "1px solid #2b2931",
    display: "flex",
    flexDirection: "column"
  },
  posterContainer: {
    position: "relative",
    aspectRatio: "2/3",
    backgroundColor: "#25232b",
    overflow: "hidden",
    cursor: "pointer"
  },
  posterImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block"
  },
  posterDimmer: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    pointerEvents: "none",
    transition: "opacity 0.2s ease"
  },
  posterHoverOverlay: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    padding: "48px 12px",
    background: "rgba(16, 16, 20, 0.58)",
    textAlign: "center",
    transition: "opacity 0.2s ease"
  },
  posterHoverContent: {
    position: "absolute",
    top: "56px",
    bottom: "60px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "calc(100% - 24px)",
    overflow: "hidden"
  },
  posterControlRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    alignItems: "center",
    justifyItems: "center",
    gap: "6px",
    width: "100%",
    marginTop: "8px"
  },
  posterControl: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    width: "100%",
    minWidth: 0,
    height: "36px",
    padding: "0 4px",
    border: "1px solid #4a4651",
    borderRadius: "8px",
    backgroundColor: "rgba(25, 24, 30, 0.92)",
    color: "#f5f3ef"
  },
  posterTitle: {
    color: "#f5f3ef",
    fontSize: "1rem",
    fontWeight: "700",
    lineHeight: "1.35",
    overflowWrap: "anywhere"
  },
  posterTitleGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "10px",
    width: "100%",
    textAlign: "left"
  },
  posterDescription: {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 7,
    overflow: "hidden",
    color: "#e1dee6",
    fontSize: "0.76rem",
    lineHeight: "1.4",
    textAlign: "left",
    overflowWrap: "anywhere"
  },
  posterMetadata: {
    position: "absolute",
    top: "12px",
    left: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "4px",
    maxWidth: "calc(100% - 24px)",
    textAlign: "left"
  },
  posterMetadataText: {
    color: "#c7c3ce",
    fontSize: "0.72rem",
    lineHeight: "1.2",
    overflowWrap: "anywhere"
  },
  ratingBadge: {
    boxSizing: "border-box",
    color: "#f4c96b",
    fontSize: "0.76rem",
    fontWeight: "800",
    whiteSpace: "nowrap"
  },
  userRatingButton: {
    cursor: "pointer",
    fontSize: "0.76rem",
    fontWeight: "800",
    whiteSpace: "nowrap"
  },
  reviewButton: {
    color: "#aaa7b2",
    cursor: "pointer"
  },
  removeButton: {
    position: "absolute",
    left: "12px",
    right: "12px",
    bottom: "12px"
  },
  genreBadge: {
    position: "absolute",
    top: "94px",
    right: "10px",
    backgroundColor: "rgba(16, 16, 20, 0.85)",
    color: "#aaa7b2",
    padding: "5px 8px",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "700",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  },
  actionButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "8px",
    borderRadius: "8px",
    fontSize: "0.82rem",
    fontWeight: "700",
    cursor: "pointer",
    border: "1px solid transparent",
    transition: "transform 0.15s ease"
  },
  actionButtonSecondary: {
    backgroundColor: "#242229",
    color: "#f0edf4",
    borderColor: "#44414b"
  },
  actionButtonActive: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "#10b981",
    color: "#10b981"
  },
  actionButtonPrimary: {
    backgroundColor: "transparent",
    color: "#f5f3ef",
    borderColor: "transparent"
  },
  posterIconButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    width: "34px",
    height: "34px",
    padding: 0,
    border: "none",
    borderRadius: "50%",
    backgroundColor: "transparent",
    color: "#f5f3ef",
    cursor: "pointer",
    filter: "drop-shadow(0 1px 3px rgba(0, 0, 0, 0.9))"
  },
  watchlistButton: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 2,
    width: "42px",
    height: "42px",
    borderLeft: "1px solid #2b2931",
    borderBottom: "1px solid #2b2931",
    borderRadius: "0 0 0 10px",
    backgroundColor: "rgba(25, 24, 30, 0.88)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.7)"
  },
  watchedButton: {
    position: "absolute",
    top: "42px",
    right: 0,
    zIndex: 2,
    width: "42px",
    height: "42px",
    borderLeft: "1px solid #2b2931",
    borderBottom: "1px solid #2b2931",
    borderRadius: "0 0 0 10px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.7)"
  },
  removedOverlay: {
    position: "absolute",
    inset: 0,
    zIndex: 5,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "16px",
    boxSizing: "border-box",
    backgroundColor: "rgba(12, 11, 15, 0.88)",
    color: "#f5f3ef",
    textAlign: "center"
  },
  removedMessage: {
    fontSize: "1.1rem",
    fontWeight: 800
  },
  undoButton: {
    padding: "8px 14px",
    border: "1px solid #f4c96b",
    borderRadius: "8px",
    backgroundColor: "rgba(244, 201, 107, 0.14)",
    color: "#f4c96b",
    font: "inherit",
    fontWeight: 700,
    cursor: "pointer"
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 50,
    backdropFilter: "blur(6px)"
  },
  modalContent: {
    backgroundColor: "#19181e",
    borderRadius: "14px",
    border: "1px solid #393740",
    maxWidth: "750px",
    width: "100%",
    padding: "28px",
    position: "relative",
    color: "#f5f3ef",
    boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
  },
  modalCloseButton: {
    position: "absolute",
    top: "16px",
    right: "16px",
    backgroundColor: "#242229",
    border: "1px solid #44414b",
    color: "#f5f3ef",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 2
  },
  modalLayout: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: "24px",
    alignItems: "start"
  },
  modalPoster: {
    width: "100%",
    aspectRatio: "2/3",
    objectFit: "cover",
    borderRadius: "10px",
    border: "1px solid #393740"
  },
  modalDetails: {
    display: "flex",
    flexDirection: "column"
  },
  modalHeaderRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "12px"
  },
  modalTitle: {
    fontSize: "1.5rem",
    fontWeight: "800",
    margin: 0,
    color: "#f5f3ef",
    lineHeight: "1.2"
  },
  modalGenreTag: {
    backgroundColor: "#242229",
    color: "#f4c96b",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "0.78rem",
    fontWeight: "700",
    border: "1px solid #44414b",
    whiteSpace: "nowrap"
  },
  modalMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
    fontSize: "0.88px",
    color: "#aaa7b2"
  },
  modalRatingBox: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#242229",
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid #44414b"
  },
  modalRatingScore: {
    fontSize: "1.1rem",
    fontWeight: "800",
    color: "#f4c96b"
  },
  modalRatingMax: {
    fontSize: "0.8rem",
    color: "#aaa7b2"
  },
  modalDate: {
    fontSize: "0.85rem",
    color: "#aaa7b2"
  },
  synopsisHeader: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#f5f3ef",
    margin: "0 0 6px 0"
  },
  modalOverview: {
    fontSize: "0.9rem",
    color: "#d0cdd5",
    lineHeight: "1.6",
    margin: "0 0 24px 0"
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    marginTop: "auto"
  },
  modalWatchlistActions: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    gap: "8px"
  },
  modalActionButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "11px 16px",
    borderRadius: "9px",
    fontSize: "0.9rem",
    fontWeight: "700",
    cursor: "pointer",
    border: "1px solid transparent"
  },
  modalTrackingButton: {
    flex: "none",
    width: "100%",
    boxSizing: "border-box"
  },
  ratingModalContent: {
    backgroundColor: "#19181e",
    borderRadius: "14px",
    border: "1px solid #393740",
    maxWidth: "440px",
    width: "100%",
    padding: "24px",
    color: "#f5f3ef",
    boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
  },
  ratingPopover: {
    position: "fixed",
    zIndex: 100,
    boxSizing: "border-box",
    padding: "8px",
    border: "1px solid #44414b",
    borderRadius: "10px",
    backgroundColor: "#19181e",
    color: "#f5f3ef",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.6)",
    transition: "opacity 0.18s ease"
  },
  ratingStarsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(10, minmax(0, 1fr)) 20px",
    alignItems: "center",
    justifyItems: "center",
    width: "100%"
  },
  ratingResetRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "20px",
    height: "28px"
  },
  ratingStarButton: {
    display: "grid",
    placeItems: "center",
    width: "100%",
    minWidth: 0,
    height: "28px",
    padding: 0,
    border: "none",
    backgroundColor: "transparent",
    color: "#85818d",
    cursor: "pointer"
  },
  ratingClearArea: {
    display: "grid",
    placeItems: "center",
    width: "20px",
    height: "14px",
    padding: 0,
    border: "none",
    backgroundColor: "transparent",
    color: "#aaa7b2",
    cursor: "pointer"
  },
  ratingPopoverClose: {
    display: "grid",
    placeItems: "center",
    width: "20px",
    height: "14px",
    padding: 0,
    border: "none",
    borderRadius: "6px",
    backgroundColor: "transparent",
    color: "#aaa7b2",
    cursor: "pointer"
  },
  ratingModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px"
  },
  ratingModalTitle: {
    fontSize: "1.2rem",
    fontWeight: "800",
    margin: 0,
    color: "#f5f3ef"
  },
  ratingModalSubtitle: {
    fontSize: "0.85rem",
    color: "#aaa7b2",
    margin: "0 0 20px 0"
  },
  scoreDisplayBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    backgroundColor: "#101014",
    border: "1px solid #393740",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px"
  },
  scoreDisplayNumber: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#f4c96b"
  },
  scoreDisplayScale: {
    fontSize: "1rem",
    color: "#aaa7b2",
    fontWeight: "600"
  },
  decimalInputContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px"
  },
  decimalInputLabel: {
    fontSize: "0.9rem",
    fontWeight: "700",
    color: "#f5f3ef"
  },
  decimalInput: {
    flex: 1,
    backgroundColor: "#101014",
    border: "1px solid #393740",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "1rem",
    color: "#f5f3ef",
    outline: "none"
  },
  sliderContainer: {
    marginBottom: "20px"
  },
  rangeSlider: {
    width: "100%",
    accentColor: "#f4c96b",
    cursor: "pointer",
    marginBottom: "6px"
  },
  sliderTicks: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.75rem",
    color: "#85818d"
  },
  presetsWrapper: {
    marginBottom: "20px"
  },
  presetsLabel: {
    display: "block",
    fontSize: "0.8rem",
    color: "#aaa7b2",
    marginBottom: "8px"
  },
  presetsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "6px"
  },
  presetButton: {
    backgroundColor: "#242229",
    border: "1px solid #44414b",
    color: "#f5f3ef",
    borderRadius: "6px",
    padding: "6px 0",
    fontSize: "0.8rem",
    fontWeight: "700",
    cursor: "pointer"
  },
  ratingErrorText: {
    color: "#ffb4b4",
    fontSize: "0.82rem",
    margin: "0 0 12px 0"
  },
  ratingModalActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end"
  },
  clearRatingButton: {
    backgroundColor: "transparent",
    border: "1px solid #6a3338",
    color: "#ffb4b4",
    borderRadius: "8px",
    padding: "9px 14px",
    fontSize: "0.85rem",
    fontWeight: "700",
    cursor: "pointer",
    marginRight: "auto"
  },
  cancelRatingButton: {
    backgroundColor: "#242229",
    border: "1px solid #44414b",
    color: "#f0edf4",
    borderRadius: "8px",
    padding: "9px 14px",
    fontSize: "0.85rem",
    fontWeight: "700",
    cursor: "pointer"
  },
  saveRatingButton: {
    backgroundColor: "#f4c96b",
    border: "none",
    color: "#17140d",
    borderRadius: "8px",
    padding: "9px 20px",
    fontSize: "0.85rem",
    fontWeight: "800",
    cursor: "pointer"
  },
  posterPlaceholder: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#85818d",
    fontSize: "0.85rem"
  }
};

function getPosterUrl(posterPath) {
  if (!posterPath) return "";
  return posterPath.startsWith("http")
    ? posterPath
    : `${IMAGE_URL}${posterPath}`;
}

function MovieRatingDialog({
  movie,
  userRating,
  onSave,
  onClear,
  onClose
}) {
  const inputId = useId();
  const [ratingInput, setRatingInput] = useState(userRating || "8.0");
  const [ratingError, setRatingError] = useState("");

  function handleSave(event) {
    event.preventDefault();
    const rating = parseFloat(ratingInput);
    if (Number.isNaN(rating) || rating < 0 || rating > 10) {
      setRatingError("Please enter a rating between 0.0 and 10.0");
      return;
    }

    try {
      onSave(movie, rating.toFixed(1));
      onClose();
    } catch (error) {
      setRatingError(error.message || "Could not save your rating.");
    }
  }

  function handleClear() {
    try {
      onClear(movie);
      onClose();
    } catch (error) {
      setRatingError(error.message || "Could not remove your rating.");
    }
  }

  const parsedRating = parseFloat(ratingInput);
  const displayedRating =
    !Number.isNaN(parsedRating) && parsedRating >= 0 && parsedRating <= 10
      ? parsedRating.toFixed(1)
      : "--";
  const sliderValue = Number.isNaN(parsedRating)
    ? 7
    : Math.min(10, Math.max(0, parsedRating));

  return createPortal(
    <div style={movieStyles.modalOverlay} onClick={onClose}>
      <div
        style={movieStyles.ratingModalContent}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={movieStyles.ratingModalHeader}>
          <h3 style={movieStyles.ratingModalTitle}>
            Rate "{movie.title}"
          </h3>
          <button
            type="button"
            style={movieStyles.modalCloseButton}
            onClick={onClose}
            aria-label="Close rating dialog"
          >
            <X size={18} />
          </button>
        </div>
        <p style={movieStyles.ratingModalSubtitle}>
          Enter a decimal rating from 0.0 to 10.0 (e.g. 7.3 or 8.8):
        </p>

        <form onSubmit={handleSave}>
          <div style={movieStyles.scoreDisplayBox}>
            <Star size={32} fill="#f4c96b" color="#f4c96b" />
            <span style={movieStyles.scoreDisplayNumber}>
              {displayedRating}
            </span>
            <span style={movieStyles.scoreDisplayScale}>/ 10.0</span>
          </div>

          <div style={movieStyles.decimalInputContainer}>
            <label htmlFor={inputId} style={movieStyles.decimalInputLabel}>
              Rating:
            </label>
            <input
              id={inputId}
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
              style={movieStyles.decimalInput}
            />
          </div>

          <div style={movieStyles.sliderContainer}>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={sliderValue}
              onChange={(event) => {
                setRatingInput(parseFloat(event.target.value).toFixed(1));
                setRatingError("");
              }}
              style={movieStyles.rangeSlider}
              aria-label="Rating slider"
            />
            <div style={movieStyles.sliderTicks}>
              <span>0.0</span>
              <span>2.5</span>
              <span>5.0</span>
              <span>7.5</span>
              <span>10.0</span>
            </div>
          </div>

          <div style={movieStyles.presetsWrapper}>
            <span style={movieStyles.presetsLabel}>Quick picks:</span>
            <div style={movieStyles.presetsGrid}>
              {[6.5, 7.3, 7.8, 8.2, 8.8, 9.4].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => {
                    setRatingInput(preset.toFixed(1));
                    setRatingError("");
                  }}
                  style={movieStyles.presetButton}
                >
                  {preset.toFixed(1)}
                </button>
              ))}
            </div>
          </div>

          {ratingError && (
            <p style={movieStyles.ratingErrorText}>{ratingError}</p>
          )}

          <div style={movieStyles.ratingModalActions}>
            {userRating && onClear && (
              <button
                type="button"
                onClick={handleClear}
                style={movieStyles.clearRatingButton}
              >
                Remove
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={movieStyles.cancelRatingButton}
            >
              Cancel
            </button>
            <button type="submit" style={movieStyles.saveRatingButton}>
              Save Rating
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export function MovieRatingDropdown({
  movie,
  userRating,
  onSave,
  onClear,
  isOpen,
  onOpenChange
}) {
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);
  const closeTimerRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);
  const [rating, setRating] = useState(Number(userRating) || 0);
  const [position, setPosition] = useState({ left: 0, top: 0, width: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    return () => clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    function updatePosition() {
      const cardBounds = buttonRef.current
        ?.closest("article")
        ?.getBoundingClientRect();
      const buttonBounds = buttonRef.current?.getBoundingClientRect();
      if (!cardBounds || !buttonBounds) return;
      const width = Math.min(cardBounds.width, window.innerWidth - 16);
      const popoverHeight = popoverRef.current?.getBoundingClientRect().height || 56;
      const belowButtonTop = buttonBounds.bottom + 8;
      setPosition({
        left: Math.max(
          8,
          Math.min(
            cardBounds.left + (cardBounds.width - width) / 2,
            window.innerWidth - width - 8
          )
        ),
        top:
          belowButtonTop + popoverHeight <= window.innerHeight - 8
            ? belowButtonTop
            : Math.max(8, buttonBounds.top - popoverHeight - 8),
        width
      });
    }

    function closeAfterPointerLeaves() {
      if (closeTimerRef.current) return;
      closeTimerRef.current = setTimeout(() => {
        setIsClosing(true);
        closeTimerRef.current = setTimeout(() => {
          onOpenChange(false);
          setIsClosing(false);
          closeTimerRef.current = null;
        }, 180);
      }, 120);
    }

    function handlePointerMove(event) {
      const card = buttonRef.current?.closest("article");
      const pointerIsInCard = card && (() => {
        const bounds = card.getBoundingClientRect();
        return (
          event.clientX >= bounds.left &&
          event.clientX <= bounds.right &&
          event.clientY >= bounds.top &&
          event.clientY <= bounds.bottom
        );
      })();
      const bounds = popoverRef.current?.getBoundingClientRect();
      const pointerIsInPopover =
        bounds &&
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;

      if (pointerIsInCard || pointerIsInPopover) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
        setIsClosing(false);
      } else {
        closeAfterPointerLeaves();
      }
    }

    function handlePointerDown(event) {
      if (
        !buttonRef.current?.contains(event.target) &&
        !popoverRef.current?.contains(event.target)
      ) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
        onOpenChange(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
        onOpenChange(false);
      }
    }

    updatePosition();
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  function clearRating() {
    if (!onClear) {
      setError("Could not clear your rating.");
      return;
    }

    try {
      onClear(movie);
      setRating(0);
      setError("");
    } catch (clearError) {
      setError(clearError.message || "Could not clear your rating.");
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={
          userRating
            ? `Change your rating, currently ${userRating} out of 10`
            : "Rate this movie"
        }
        aria-expanded={isOpen}
        title={userRating ? `Your rating: ${userRating} / 10` : "Rate this movie"}
        onClick={() => {
          clearTimeout(closeTimerRef.current);
          closeTimerRef.current = null;
          setIsClosing(false);
          setRating(Number(userRating) || 0);
          setError("");
          onOpenChange(!isOpen);
        }}
        style={{
          ...movieStyles.posterControl,
          ...movieStyles.userRatingButton,
          color: userRating ? "#19181e" : "#f4c96b",
          backgroundColor: userRating ? "#f4c96b" : "rgba(25, 24, 30, 0.92)",
          borderColor: userRating ? "#f4c96b" : "#4a4651"
        }}
      >
        <Star
          size={14}
          fill={userRating ? "currentColor" : "none"}
          color="currentColor"
        />
        {userRating && <span>{userRating}</span>}
      </button>
      {isOpen &&
        createPortal(
            <div
            ref={popoverRef}
            data-movie-rating-popover
            style={{
              ...movieStyles.ratingPopover,
              left: `${position.left}px`,
              top: `${position.top}px`,
              width: `${position.width}px`,
              opacity: isClosing ? 0 : 1,
              pointerEvents: position.width && !isClosing ? "auto" : "none",
              visibility: position.width ? "visible" : "hidden"
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onMouseEnter={() => {
              clearTimeout(closeTimerRef.current);
              closeTimerRef.current = null;
              setIsClosing(false);
            }}
          >
            <div style={movieStyles.ratingStarsRow}>
              {Array.from({ length: 10 }, (_, index) => {
                const starRating = index + 1;
                const isSelected = starRating <= Math.round(rating);
                const starSize = 13;
                return (
                  <button
                    key={starRating}
                    type="button"
                    aria-label={`Rate ${starRating} out of 10`}
                    aria-pressed={starRating === Math.round(rating)}
                    title={`${starRating} / 10`}
                    onClick={() => {
                      if (userRating && starRating === Math.round(Number(userRating))) {
                        clearRating();
                        return;
                      }

                      setRating(starRating);
                      try {
                        onSave(movie, starRating.toFixed(1));
                        setError("");
                      } catch (saveError) {
                        setError(saveError.message || "Could not save your rating.");
                      }
                    }}
                    style={{
                      ...movieStyles.ratingStarButton,
                      color: isSelected ? "#f4c96b" : "#85818d"
                    }}
                  >
                    <Star
                      size={starSize}
                      fill={isSelected ? "currentColor" : "none"}
                    />
                  </button>
                );
              })}
              <div style={movieStyles.ratingResetRow}>
                <button
                  type="button"
                  aria-label="Close rating choices"
                  title="Close"
                  onClick={() => {
                    clearTimeout(closeTimerRef.current);
                    closeTimerRef.current = null;
                    onOpenChange(false);
                    setIsClosing(false);
                  }}
                  style={movieStyles.ratingPopoverClose}
                >
                  <X size={11} />
                </button>
                <button
                  type="button"
                  aria-label="Reset rating"
                  title="Reset rating"
                  disabled={!userRating || !onClear}
                  onClick={clearRating}
                  style={{
                    ...movieStyles.ratingClearArea,
                    cursor: userRating && onClear ? "pointer" : "default",
                    opacity: userRating && onClear ? 1 : 0.45
                  }}
                >
                  <RotateCcw size={10} />
                </button>
              </div>
            </div>
            {error && <p style={movieStyles.ratingErrorText}>{error}</p>}
          </div>,
          document.body
        )}
    </>
  );
}

export function MovieDetailsDialog({
  movie,
  userRating,
  isInWatchlist,
  isWatched = false,
  onToggleWatchlist,
  onToggleWatched,
  onSaveRating,
  onClearRating,
  onClose
}) {
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const posterUrl = getPosterUrl(movie.poster_path);

  return (
    <>
      {createPortal(
        <div
          style={movieStyles.modalOverlay}
          onClick={onClose}
        >
          <div
            style={movieStyles.modalContent}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              style={movieStyles.modalCloseButton}
              onClick={onClose}
              aria-label="Close movie details"
            >
              <X size={20} />
            </button>

            <div style={movieStyles.modalLayout}>
              {posterUrl && (
                <img
                  src={posterUrl}
                  alt={movie.title}
                  style={movieStyles.modalPoster}
                />
              )}
              <div style={movieStyles.modalDetails}>
                <div style={movieStyles.modalHeaderRow}>
                  <h2 style={movieStyles.modalTitle}>{movie.title}</h2>
                  {movie.genre && (
                    <span style={movieStyles.modalGenreTag}>{movie.genre}</span>
                  )}
                </div>

                <div style={movieStyles.modalMetaRow}>
                  <div style={movieStyles.modalRatingBox}>
                    <Star size={18} fill="#f4c96b" color="#f4c96b" />
                    <span style={movieStyles.modalRatingScore}>
                      {movie.vote_average != null
                        ? Number(movie.vote_average).toFixed(1)
                        : "N/A"}
                    </span>
                    <span style={movieStyles.modalRatingMax}>/ 10</span>
                  </div>
                  <span style={movieStyles.modalDate}>
                    Release Date: {movie.release_date || "Unknown"}
                  </span>
                </div>

                <h3 style={movieStyles.synopsisHeader}>Synopsis</h3>
                <p style={movieStyles.modalOverview}>
                  {movie.overview || "No overview available."}
                </p>

                <div style={movieStyles.modalActions}>
                  <div style={movieStyles.modalWatchlistActions}>
                    <button
                      type="button"
                      onClick={() => onToggleWatchlist(movie)}
                      aria-pressed={isInWatchlist}
                      style={{
                        ...movieStyles.modalActionButton,
                        ...movieStyles.modalTrackingButton,
                        ...movieStyles.actionButtonSecondary,
                        ...(isInWatchlist
                          ? {
                              backgroundColor: "rgba(244, 201, 107, 0.16)",
                              borderColor: "#f4c96b",
                              color: "#f4c96b"
                            }
                          : {})
                      }}
                    >
                      <Bookmark
                        size={16}
                        fill={isInWatchlist ? "currentColor" : "none"}
                      />
                      <span>
                        {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleWatched(movie)}
                      aria-pressed={isWatched}
                      style={{
                        ...movieStyles.modalActionButton,
                        ...movieStyles.modalTrackingButton,
                        ...(isWatched
                          ? movieStyles.actionButtonActive
                          : movieStyles.actionButtonSecondary)
                      }}
                    >
                      {isWatched ? <Eye size={16} /> : <EyeOff size={16} />}
                      <span>{isWatched ? "Mark as Unwatched" : "Mark as Watched"}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setRatingDialogOpen(true)}
                    style={{
                      ...movieStyles.modalActionButton,
                      ...movieStyles.actionButtonPrimary
                    }}
                  >
                    <Star
                      size={16}
                      fill={userRating ? "#f4c96b" : "none"}
                      color="#f4c96b"
                    />
                    <span>
                      {userRating
                        ? `Your Rating: ${userRating}/10`
                        : "Rate this Movie"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      {ratingDialogOpen && (
        <MovieRatingDialog
          movie={movie}
          userRating={userRating}
          onSave={onSaveRating}
          onClear={onClearRating}
          onClose={() => setRatingDialogOpen(false)}
        />
      )}
    </>
  );
}

export default function MovieCard({
  movie,
  userRating,
  isInWatchlist = false,
  isWatched = false,
  onSelect,
  onToggleWatchlist,
  onToggleWatched,
  onSaveRating,
  onClearRating,
  onRemove,
  isRemoved = false,
  onUndoRemoval
}) {
  const [cardHovered, setCardHovered] = useState(false);
  const [trackingButtonHovered, setTrackingButtonHovered] = useState(false);
  const [ratingPopoverOpen, setRatingPopoverOpen] = useState(false);
  const [reviewComposerOpen, setReviewComposerOpen] = useState(false);
  const [productionCompany, setProductionCompany] = useState({
    status: "idle",
    name: null
  });
  const isMountedRef = useRef(true);
  const cardActive =
    (cardHovered && !trackingButtonHovered) || ratingPopoverOpen;
  const posterUrl = getPosterUrl(movie.poster_path);
  const canReview = isAuthenticated();

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!cardActive || productionCompany.status !== "idle" || !movie.id) return;

    setProductionCompany({ status: "loading", name: null });
    fetchMovieProductionCompany(movie.id)
      .then((name) => {
        if (isMountedRef.current) {
          setProductionCompany({ status: "loaded", name });
        }
      })
      .catch((error) => {
        console.error(`Could not load production company for movie ${movie.id}:`, error);
        if (isMountedRef.current) {
          setProductionCompany({ status: "error", name: null });
        }
      });
  }, [cardActive, movie.id, productionCompany.status]);

  return (
    <article
      style={movieStyles.movieCard}
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => {
        setCardHovered(false);
      }}
      onFocus={() => setCardHovered(true)}
      onBlur={(event) => {
        const focusMovedToRatingPopover = event.relatedTarget?.closest?.(
          "[data-movie-rating-popover]"
        );
        if (
          !event.currentTarget.contains(event.relatedTarget) &&
          !focusMovedToRatingPopover
        ) {
          setCardHovered(false);
        }
      }}
    >
      <div
        style={movieStyles.movieCardSurface}
      >
        <div
          style={{
            ...movieStyles.posterContainer,
            ...(onSelect ? {} : { cursor: "default" })
          }}
          onClick={onSelect ? () => onSelect(movie) : undefined}
        >
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              style={movieStyles.posterImage}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          ) : (
            <div style={movieStyles.posterPlaceholder}>Poster unavailable</div>
          )}
          <div
            style={{
              ...movieStyles.posterDimmer,
              opacity: cardActive ? 1 : 0
            }}
          />
          <div
            style={{
              ...movieStyles.posterHoverOverlay,
              opacity: cardActive ? 1 : 0,
              pointerEvents: cardActive ? "auto" : "none"
            }}
          >
            <div style={movieStyles.posterMetadata}>
              <span style={movieStyles.posterMetadataText}>
                {movie.release_date || "Release date unknown"}
              </span>
              <span style={movieStyles.posterMetadataText}>
                {productionCompany.status === "loading"
                  ? "Loading production company..."
                  : productionCompany.status === "error"
                    ? "Production company unavailable"
                    : productionCompany.name || ""}
              </span>
            </div>
            <div
              style={movieStyles.posterHoverContent}
            >
              <div style={movieStyles.posterTitleGroup}>
                <span style={movieStyles.posterTitle}>{movie.title}</span>
                <span style={movieStyles.posterDescription}>
                  {movie.overview || "No description available."}
                </span>
              </div>
            </div>
            {onRemove && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove(movie);
                }}
                style={{
                  ...movieStyles.actionButton,
                  ...movieStyles.actionButtonSecondary,
                  ...movieStyles.removeButton
                }}
              >
                <X size={14} />
                <span>Remove</span>
              </button>
            )}
          </div>
          {onToggleWatchlist && (
            <button
              type="button"
              onMouseEnter={() => setTrackingButtonHovered(true)}
              onMouseLeave={() => setTrackingButtonHovered(false)}
              aria-label={
                isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
              }
              aria-pressed={isInWatchlist}
              title={
                isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
              }
              onClick={(event) => {
                event.stopPropagation();
                onToggleWatchlist(movie);
              }}
              style={{
                ...movieStyles.posterIconButton,
                ...movieStyles.watchlistButton,
                backgroundColor: isInWatchlist
                  ? "rgba(244, 201, 107, 0.42)"
                  : "rgba(25, 24, 30, 0.55)",
                borderColor: isInWatchlist ? "#f4c96b" : "#393740",
                color: "#f4c96b"
              }}
            >
              <Bookmark size={22} fill={isInWatchlist ? "currentColor" : "none"} />
            </button>
          )}
          {onToggleWatched && (
            <button
              type="button"
              onMouseEnter={() => setTrackingButtonHovered(true)}
              onMouseLeave={() => setTrackingButtonHovered(false)}
              aria-label={isWatched ? "Mark as unwatched" : "Mark as watched"}
              aria-pressed={isWatched}
              title={isWatched ? "Mark as unwatched" : "Mark as watched"}
              onClick={(event) => {
                event.stopPropagation();
                onToggleWatched(movie);
              }}
              style={{
                ...movieStyles.posterIconButton,
                ...movieStyles.watchedButton,
                backgroundColor: isWatched
                  ? "rgba(16, 185, 129, 0.24)"
                  : "rgba(25, 24, 30, 0.55)",
                borderColor: isWatched ? "#10b981" : "#393740",
                color: isWatched ? "#10b981" : "#d0cdd5"
              }}
            >
              {isWatched ? <Eye size={22} /> : <EyeOff size={22} />}
            </button>
          )}
          {movie.genre && (
            <div style={movieStyles.genreBadge}>{movie.genre}</div>
          )}
          {isRemoved && (
            <div style={movieStyles.removedOverlay}>
              <span style={movieStyles.removedMessage}>Removed</span>
              <button
                type="button"
                style={movieStyles.undoButton}
                onClick={(event) => {
                  event.stopPropagation();
                  onUndoRemoval?.(movie);
                }}
              >
                Undo
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        style={movieStyles.posterControlRow}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          style={{
            ...movieStyles.posterControl,
            ...movieStyles.ratingBadge
          }}
          aria-label={`TMDB rating ${
            movie.vote_average != null
              ? Number(movie.vote_average).toFixed(1)
              : "not available"
          }`}
        >
          <Star size={13} fill="#f4c96b" color="#f4c96b" />
          <span>
            {movie.vote_average != null
              ? Number(movie.vote_average).toFixed(1)
              : "N/A"}
          </span>
        </div>
        {onSaveRating ? (
          <MovieRatingDropdown
            movie={movie}
            userRating={userRating}
            onSave={onSaveRating}
            onClear={onClearRating}
            isOpen={ratingPopoverOpen}
            onOpenChange={setRatingPopoverOpen}
          />
        ) : (
          <span />
        )}
        <button
          type="button"
          disabled={!canReview}
          aria-label={
            canReview ? `Write a review for ${movie.title}` : "Sign in to write a review"
          }
          title={canReview ? "Write a review" : "Sign in to write a review"}
          onClick={() => setReviewComposerOpen(true)}
          style={{
            ...movieStyles.posterControl,
            ...movieStyles.reviewButton,
            cursor: canReview ? "pointer" : "not-allowed",
            opacity: canReview ? 1 : 0.55
          }}
        >
          <MessageSquareText size={15} />
        </button>
      </div>
      {reviewComposerOpen && (
        <ReviewComposerDialog
          movie={movie}
          productionCompany={productionCompany.name}
          userRating={userRating}
          RatingControl={MovieRatingDropdown}
          onSaveRating={onSaveRating}
          onClearRating={onClearRating}
          onSave={saveUserReview}
          onClose={() => setReviewComposerOpen(false)}
        />
      )}
    </article>
  );
}
