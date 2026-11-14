import React, { useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieGrid from "./MovieGrid";
import styles from "../styles.jsx";

export default function MovieCarousel({
  label,
  movies,
  userRatings,
  userTitles,
  onSelect,
  onToggleWatchlist,
  onToggleWatched,
  onSaveRating,
  onClearRating
}) {

  const carouselRef = useRef(null);
  const pendingEndArrowRef = useRef(null);
  const [nearbyArrow, setNearbyArrow] = useState(null);
  const [edgeInset, setEdgeInset] = useState(40);
  const [scrollEdges, setScrollEdges] = useState({
    left: false,
    right: false
  });

  useLayoutEffect(() => {
    const carousel = carouselRef.current;
    const firstCard = carousel?.firstElementChild;
    if (!carousel || !firstCard) return undefined;

    let resizeFrame = null;
    let previousInset = edgeInset;

    function updateScrollEdges() {
      const left = carousel.scrollLeft > 1;
      const right =
        carousel.scrollLeft < carousel.scrollWidth - carousel.clientWidth - 1;
      if (
        (pendingEndArrowRef.current === "left" && !left) ||
        (pendingEndArrowRef.current === "right" && !right)
      ) {
        pendingEndArrowRef.current = null;
      }
      setScrollEdges((previous) =>
        previous.left === left && previous.right === right
          ? previous
          : { left, right }
      );
    }

    function updateEdgeInset() {
      const carouselStyle = window.getComputedStyle(carousel);
      const gap = Number.parseFloat(carouselStyle.columnGap) || 0;
      const cardWidth = firstCard.getBoundingClientRect().width;
      const step = cardWidth + gap;
      const fullCardCount = Math.max(
        1,
        Math.floor((carousel.clientWidth - gap) / step)
      );
      const peekWidth = Math.max(
        0,
        (carousel.clientWidth - gap - fullCardCount * step) / 2
      );
      const nextInset = Math.round(gap + peekWidth);
      if (nextInset !== previousInset) {
        const cards = Array.from(carousel.children);
        const currentTarget = carousel.scrollLeft + previousInset;
        const anchorIndex = cards.reduce(
          (closestIndex, card, index) =>
            Math.abs(card.offsetLeft - currentTarget) <
            Math.abs(cards[closestIndex].offsetLeft - currentTarget)
              ? index
              : closestIndex,
          0
        );
        previousInset = nextInset;
        setEdgeInset(nextInset);
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
          carousel.scrollLeft = Math.max(
            0,
            cards[anchorIndex].offsetLeft - nextInset
          );
          updateScrollEdges();
        });
      }
      updateScrollEdges();
    }

    updateEdgeInset();
    const resizeObserver = new ResizeObserver(updateEdgeInset);
    resizeObserver.observe(carousel);
    window.addEventListener("resize", updateEdgeInset);
    carousel.addEventListener("scroll", updateScrollEdges, { passive: true });
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateEdgeInset);
      carousel.removeEventListener("scroll", updateScrollEdges);
      cancelAnimationFrame(resizeFrame);
    };
  }, [movies.length]);

  function scrollByCard(direction) {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const cards = Array.from(carousel.children);
    if (cards.length < 2) return;

    const currentTarget = carousel.scrollLeft + edgeInset;
    const currentIndex = cards.reduce(
      (closestIndex, card, index) =>
        Math.abs(card.offsetLeft - currentTarget) <
        Math.abs(cards[closestIndex].offsetLeft - currentTarget)
          ? index
          : closestIndex,
      0
    );
    const carouselStyle = window.getComputedStyle(carousel);
    const gap = Number.parseFloat(carouselStyle.columnGap) || 0;
    const cardWidth = cards[0].getBoundingClientRect().width;
    const pageSize = Math.max(
      1,
      Math.floor((carousel.clientWidth - gap) / (cardWidth + gap))
    );
    const targetIndex = Math.max(
      0,
      Math.min(cards.length - 1, currentIndex + direction * pageSize)
    );
    const targetCard = cards[targetIndex];
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    const targetPosition = targetCard.offsetLeft - edgeInset;
    const isAtCarouselEnd =
      direction > 0 &&
      (targetIndex === cards.length - 1 || targetPosition >= maxScroll - 1);
    const isAtCarouselStart =
      direction < 0 && (targetIndex === 0 || targetPosition <= 1);
    const finalPosition = isAtCarouselEnd
      ? maxScroll
      : isAtCarouselStart
        ? 0
        : targetPosition;

    pendingEndArrowRef.current = isAtCarouselEnd
      ? "right"
      : isAtCarouselStart
        ? "left"
        : null;
    if (isAtCarouselEnd || isAtCarouselStart) {
      setNearbyArrow(null);
    }
    carousel.scrollTo({
      left: finalPosition,
      behavior: "smooth"
    });
  }

  function handlePointerMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const carousel = carouselRef.current;
    if (!carousel) return;

    const pointerX = event.clientX - bounds.left;
    const edgeDistance = 68;
    const canScrollLeft = carousel.scrollLeft > 1;
    const canScrollRight =
      carousel.scrollLeft < carousel.scrollWidth - carousel.clientWidth - 1;

    if (
      pointerX <= edgeDistance &&
      canScrollLeft &&
      pendingEndArrowRef.current !== "left"
    ) {
      setNearbyArrow("left");
    } else if (
      pointerX >= bounds.width - edgeDistance &&
      canScrollRight &&
      pendingEndArrowRef.current !== "right"
    ) {
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
        userTitles={userTitles}
        onSelect={onSelect}
        onToggleWatchlist={onToggleWatchlist}
        onToggleWatched={onToggleWatched}
        onSaveRating={onSaveRating}
        onClearRating={onClearRating}
        gridStyle={{
          ...styles.home.carousel,
          padding: "12px",
          scrollPadding: `8px ${edgeInset}px`
        }}
      />
      <>
        {nearbyArrow === "left" && scrollEdges.left && (
          <button
            type="button"
            aria-label={`Previous ${label.toLowerCase()} movie`}
            onClick={() => scrollByCard(-1)}
            style={{ ...styles.home.carouselArrow, ...styles.home.carouselArrowLeft }}
          >
            <ChevronLeft size={24} />
          </button>
        )}
        {nearbyArrow === "right" && scrollEdges.right && (
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