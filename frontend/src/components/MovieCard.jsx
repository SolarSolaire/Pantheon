import React, { useId, useState } from "react";
import { createPortal } from "react-dom";
import { Bookmark, Calendar, Check, Info, Star, X } from "lucide-react";

const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";

const movieStyles = {
  movieCard: {
    minWidth: 0,
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
  posterOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(16, 16, 20, 0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.2s ease"
  },
  quickViewText: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#101014",
    color: "#f5f3ef",
    padding: "8px 14px",
    borderRadius: "20px",
    fontSize: "0.82rem",
    fontWeight: "700",
    border: "1px solid #393740"
  },
  ratingBadge: {
    position: "absolute",
    top: "10px",
    left: "10px",
    backgroundColor: "rgba(16, 16, 20, 0.85)",
    color: "#f4c96b",
    padding: "6px 8px",
    borderRadius: "7px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "0.82rem",
    fontWeight: "800",
    border: "1px solid rgba(255, 255, 255, 0.15)"
  },
  genreBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(16, 16, 20, 0.85)",
    color: "#aaa7b2",
    padding: "5px 8px",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "700",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  },
  cardBody: {
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    flex: 1
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "8px"
  },
  movieTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    margin: 0,
    color: "#f5f3ef",
    lineHeight: "1.4",
    cursor: "pointer",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  movieMeta: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "0.82rem",
    color: "#aaa7b2",
    flexShrink: 0
  },
  overviewText: {
    fontSize: "0.85rem",
    color: "#d0cdd5",
    lineHeight: "1.5",
    margin: "0 0 14px 0",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    flex: 1
  },
  userRatedBar: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#221d1b",
    border: "1px solid #553d20",
    color: "#f4c96b",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "0.8rem",
    marginBottom: "12px",
    fontWeight: "600"
  },
  cardActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginTop: "auto"
  },
  actionButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "9px 10px",
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
    backgroundColor: "#242229",
    color: "#f5f3ef",
    borderColor: "#44414b"
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

export function MovieDetailsDialog({
  movie,
  userRating,
  isInWatchlist,
  onToggleWatchlist,
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
                  <button
                    type="button"
                    onClick={() => onToggleWatchlist(movie)}
                    style={{
                      ...movieStyles.modalActionButton,
                      ...(isInWatchlist
                        ? movieStyles.actionButtonActive
                        : movieStyles.actionButtonSecondary)
                    }}
                  >
                    {isInWatchlist ? (
                      <>
                        <Check size={16} color="#10b981" />
                        <span style={{ color: "#10b981" }}>
                          Saved in Watchlist
                        </span>
                      </>
                    ) : (
                      <>
                        <Bookmark size={16} />
                        <span>Add to Watchlist</span>
                      </>
                    )}
                  </button>

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
  onSelect,
  onToggleWatchlist,
  onSaveRating,
  onClearRating,
  onRemove,
  missingYearLabel = "N/A"
}) {
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const posterUrl = getPosterUrl(movie.poster_path);
  const releaseYear = movie.release_date?.split("-")[0] || missingYearLabel;

  return (
    <article style={movieStyles.movieCard}>
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
        {onSelect && (
          <div style={movieStyles.posterOverlay}>
            <span style={movieStyles.quickViewText}>
              <Info size={14} /> View Details
            </span>
          </div>
        )}
        <div style={movieStyles.ratingBadge}>
          <Star size={13} fill="#f4c96b" color="#f4c96b" />
          <span>
            {movie.vote_average != null
              ? Number(movie.vote_average).toFixed(1)
              : "N/A"}
          </span>
        </div>
        {movie.genre && (
          <div style={movieStyles.genreBadge}>{movie.genre}</div>
        )}
      </div>

      <div style={movieStyles.cardBody}>
        <div style={movieStyles.cardHeader}>
          <h2
            style={{
              ...movieStyles.movieTitle,
              ...(onSelect ? {} : { cursor: "default" })
            }}
            title={movie.title}
            onClick={onSelect ? () => onSelect(movie) : undefined}
          >
            {movie.title}
          </h2>
          <div style={movieStyles.movieMeta}>
            <Calendar size={13} color="#85818d" />
            <span>{releaseYear}</span>
          </div>
        </div>

        <p style={movieStyles.overviewText}>
          {movie.overview || "No overview available."}
        </p>

        {userRating && (
          <div style={movieStyles.userRatedBar}>
            <Star size={13} fill="#f4c96b" color="#f4c96b" />
            <span>
              Your rating: <strong>{userRating} / 10</strong>
            </span>
          </div>
        )}

        <div style={movieStyles.cardActions}>
          {onToggleWatchlist && (
            <button
              type="button"
              onClick={() => onToggleWatchlist(movie)}
              style={{
                ...movieStyles.actionButton,
                ...(isInWatchlist
                  ? movieStyles.actionButtonActive
                  : movieStyles.actionButtonSecondary)
              }}
              title={
                isInWatchlist
                  ? "Remove from watchlist"
                  : "Add to watchlist"
              }
            >
              {isInWatchlist ? (
                <>
                  <Check size={14} color="#10b981" />
                  <span style={{ color: "#10b981" }}>In Watchlist</span>
                </>
              ) : (
                <>
                  <Bookmark size={14} />
                  <span>Watchlist</span>
                </>
              )}
            </button>
          )}

          {onSaveRating && (
            <button
              type="button"
              onClick={() => setRatingDialogOpen(true)}
              style={{
                ...movieStyles.actionButton,
                ...movieStyles.actionButtonPrimary
              }}
            >
              <Star
                size={14}
                fill={userRating ? "#f4c96b" : "none"}
                color="#f4c96b"
              />
              <span>{userRating ? `${userRating} ★` : "Rate"}</span>
            </button>
          )}

          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(movie)}
              style={{
                ...movieStyles.actionButton,
                ...movieStyles.actionButtonSecondary
              }}
            >
              <X size={14} />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>

      {ratingDialogOpen && (
        <MovieRatingDialog
          movie={movie}
          userRating={userRating}
          onSave={onSaveRating}
          onClear={onClearRating}
          onClose={() => setRatingDialogOpen(false)}
        />
      )}
    </article>
  );
}
