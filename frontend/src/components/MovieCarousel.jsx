import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieGrid from "./MovieGrid";
import styles from "../styles.jsx";

export default function MovieCarousel({
  label,
  movies,
  userRatings,
  watchlist,
  onSelect,
  onToggleWatchlist,
  onSaveRating,
  onClearRating
}) {
  const carouselRef = useRef(null);
  const [nearbyArrow, setNearbyArrow] = useState(null);

  function scrollByCard(direction) {
    const carousel = carouselRef.current;
    const firstCard = carousel?.firstElementChild;
    if (!carousel || !firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(carousel).columnGap) || 0;
    carousel.scrollBy({
      left: direction * (firstCard.getBoundingClientRect().width + gap),
      behavior: "smooth"
    });
  }

  function handlePointerMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - bounds.left;
    const edgeDistance = 68;

    if (pointerX <= edgeDistance) {
      setNearbyArrow("left");
    } else if (pointerX >= bounds.width - edgeDistance) {
      setNearbyArrow("right");
    } else {
      setNearbyArrow(null);
    }
  }

  return (
    <div
      style={styles.home.carouselFrame}
      onMouseMove={handlePointerMove}
      onMouseLeave={() => setNearbyArrow(null)}
    >
      <MovieGrid
        gridRef={carouselRef}
        movies={movies}
        userRatings={userRatings}
        watchlist={watchlist}
        onSelect={onSelect}
        onToggleWatchlist={onToggleWatchlist}
        onSaveRating={onSaveRating}
        onClearRating={onClearRating}
        gridStyle={styles.home.carousel}
      />
      <>
        {nearbyArrow === "left" && (
          <button
            type="button"
            aria-label={`Previous ${label.toLowerCase()} movie`}
            onClick={() => scrollByCard(-1)}
            style={{ ...styles.home.carouselArrow, ...styles.home.carouselArrowLeft }}
          >
            <ChevronLeft size={24} />
          </button>
        )}
        {nearbyArrow === "right" && (
          <button
            type="button"
            aria-label={`Next ${label.toLowerCase()} movie`}
            onClick={() => scrollByCard(1)}
            style={{ ...styles.home.carouselArrow, ...styles.home.carouselArrowRight }}
          >
            <ChevronRight size={24} />
          </button>
        )}
      </>
    </div>
  );
}
