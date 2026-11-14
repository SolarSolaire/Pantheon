import React, { useId } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

const searchStyles = {
  navWrap: {
    position: "relative",
    flex: "1 1 200px",
    maxWidth: "330px",
    minWidth: 0
  },
  navForm: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "0 0 0 13px",
    border: "1px solid #393740",
    borderRadius: "10px",
    backgroundColor: "#1b1a20",
    color: "#aaa7b2"
  },
  navInput: {
    width: "100%",
    minWidth: 0,
    padding: "12px 0",
    border: 0,
    outline: 0,
    backgroundColor: "transparent",
    color: "#f5f3ef",
    font: "inherit"
  },
  navClearButton: {
    display: "flex",
    alignItems: "center",
    padding: "4px",
    border: 0,
    backgroundColor: "transparent",
    color: "#85818d",
    cursor: "pointer"
  },
  submitButton: {
    padding: "11px 15px",
    border: "1px solid transparent",
    borderRadius: "0 9px 9px 0",
    alignSelf: "stretch",
    backgroundColor: "#f4c96b",
    color: "#17140d",
    font: "inherit",
    fontWeight: "700",
    whiteSpace: "nowrap",
    cursor: "pointer"
  },
  suggestionsDropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    left: 0,
    zIndex: 30,
    overflow: "hidden",
    border: "1px solid #393740",
    borderRadius: "10px",
    backgroundColor: "#1b1a20",
    boxShadow: "0 14px 32px #0008"
  },
  suggestionItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "10px 12px",
    border: 0,
    borderBottom: "1px solid #302e36",
    backgroundColor: "transparent",
    color: "#f5f3ef",
    textAlign: "left",
    cursor: "pointer"
  },
  suggestionPoster: {
    flex: "0 0 34px",
    width: "34px",
    height: "48px",
    borderRadius: "4px",
    backgroundColor: "#302e36",
    objectFit: "cover"
  },
  suggestionText: {
    display: "block",
    textAlign: "left"
  },
  suggestionTitle: {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: "700"
  },
  suggestionYear: {
    display: "block",
    marginTop: "3px",
    color: "#aaa7b2",
    fontSize: "0.78rem"
  },
  suggestionStatus: {
    padding: "13px",
    color: "#aaa7b2",
    fontSize: "0.86rem"
  },
  heroWrap: {
    position: "relative",
    maxWidth: "680px",
    margin: "0 auto 28px auto"
  },
  heroInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 44px 14px 50px",
    fontSize: "16px",
    backgroundColor: "#1b1a20",
    border: "1px solid #393740",
    borderRadius: "30px",
    color: "#f5f3ef",
    outline: "none",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.4)"
  },
  heroIcon: {
    position: "absolute",
    left: "18px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none"
  },
  heroClearButton: {
    position: "absolute",
    right: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    color: "#85818d",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "4px"
  }
};

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search movies...",
  mode = "nav",
  suggestions = [],
  suggestionsLoading = false,
  suggestionsError = "",
  dropdownOpen = false,
  onSuggestionSelect,
  onFocus,
  onKeyDown,
  onClear
}) {
  const navigate = useNavigate();
  const suggestionsId = useId();
  const hasQuery = Boolean(value.trim());
  const hasSuggestions = mode === "nav" && dropdownOpen && hasQuery;

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.(event);
  }

  function handleChange(event) {
    onChange(event.target.value);
  }

  function handleClear() {
    onChange("");
    onClear?.();
  }

  function handleSuggestionSelect(movie) {
    if (onSuggestionSelect) {
      onSuggestionSelect(movie);
      return;
    }

    const movieId = movie.id ?? movie.tmdb_id ?? movie.movie_id;
    if (movieId != null) {
      navigate(`/movies/${encodeURIComponent(String(movieId))}`);
    }
  }

  if (mode === "hero") {
    return (
      <div style={searchStyles.heroWrap}>
        <Search
          size={20}
          color="#85818d"
          style={searchStyles.heroIcon}
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder={placeholder}
          aria-label="Search movies"
          value={value}
          onChange={handleChange}
          style={searchStyles.heroInput}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            style={searchStyles.heroClearButton}
            title="Clear search"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={searchStyles.navWrap}>
      <form style={searchStyles.navForm} role="search" onSubmit={handleSubmit}>
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          placeholder={placeholder}
          aria-label="Search movies"
          value={value}
          autoComplete="off"
          aria-expanded={Boolean(hasSuggestions)}
          aria-controls={suggestionsId}
          style={searchStyles.navInput}
          onFocus={onFocus}
          onChange={handleChange}
          onKeyDown={onKeyDown}
        />
        {value && (
          <button
            type="button"
            style={searchStyles.navClearButton}
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
        {onSubmit && (
          <button
            type="submit"
            style={searchStyles.submitButton}
          >
            Enter
          </button>
        )}
      </form>

      {hasSuggestions && (
        <div
          style={searchStyles.suggestionsDropdown}
          id={suggestionsId}
          role="listbox"
          aria-label="Suggested movies"
        >
          {suggestionsLoading ? (
            <div style={searchStyles.suggestionStatus} role="status" aria-live="polite">
              Searching movies…
            </div>
          ) : suggestionsError ? (
            <div style={searchStyles.suggestionStatus} role="status" aria-live="polite">
              {suggestionsError}
            </div>
          ) : suggestions.length ? (
            suggestions.map((movie) => (
              <button
                type="button"
                className="home-suggestion-item"
                style={searchStyles.suggestionItem}
                role="option"
                aria-selected="false"
                key={movie.id}
                onClick={() => handleSuggestionSelect(movie)}
              >
                {movie.poster_path ? (
                  <img
                    style={searchStyles.suggestionPoster}
                    src={`${IMAGE_URL}${movie.poster_path}`}
                    alt=""
                  />
                ) : (
                  <span
                    style={searchStyles.suggestionPoster}
                    aria-hidden="true"
                  />
                )}
                <span style={searchStyles.suggestionText}>
                  <span style={searchStyles.suggestionTitle}>{movie.title}</span>
                  <span style={searchStyles.suggestionYear}>
                    {movie.release_date?.slice(0, 4) || "Release year unknown"}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <div style={searchStyles.suggestionStatus}>
              No matching movies found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
