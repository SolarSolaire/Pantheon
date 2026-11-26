import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMovieDetails } from "../api/tmdb"; // <-- Added this import
import {
  addMovieToUserWatchlist,
  ensureLegacyUserDataMigrated,
  fetchUserReviews,
  fetchUserTitles,
  removeMovieFromUserWatchlist,
  setUserTitleWatched
} from "../api/userData";

function mergeUserTitleStatus(userTitles, movie, status) {
  const titleId = String(status.id ?? movie.id);
  const existingIndex = userTitles.findIndex(
    (item) => String(item.id) === titleId
  );
  const existingTitle = userTitles[existingIndex];
  if (!status.in_watchlist && !status.watched) {
    return userTitles.filter((item) => String(item.id) !== titleId);
  }

  const updatedTitle = {
    ...(existingTitle || movie),
    id: status.id ?? movie.id,
    media_type: existingTitle?.media_type || movie.media_type || "movie",
    in_watchlist: status.in_watchlist,
    watched: status.watched,
    watched_at: status.watched_at ?? null,
    added_at: status.added_at ?? existingTitle?.added_at ?? null
  };
  const nextTitles = [...userTitles];
  if (existingIndex === -1) {
    nextTitles.push(updatedTitle);
  } else {
    nextTitles[existingIndex] = updatedTitle;
  }
  return nextTitles.sort((left, right) => {
    const addedAtDifference =
      (Date.parse(left.added_at || "") || 0) -
      (Date.parse(right.added_at || "") || 0);
    return addedAtDifference || Number(left.id) - Number(right.id);
  });
}

function restoreUserTitle(userTitles, movieId, title, previousIndex) {
  const nextTitles = userTitles.filter(
    (item) => String(item.id) !== movieId
  );
  if (title) {
    nextTitles.splice(Math.min(previousIndex, nextTitles.length), 0, title);
  }
  return nextTitles;
}

export default function useUserWatchlist() {
  const [userTitles, setUserTitles] = useState([]);
  const [reviewedMovieIds, setReviewedMovieIds] = useState(() => new Set());
  const [watchlistError, setWatchlistError] = useState("");
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const pendingWatchlistIds = useRef(new Set());

  useEffect(() => {
    const controller = new AbortController();
    const migration = ensureLegacyUserDataMigrated();
    migration
      .then(() => fetchUserTitles(controller.signal))
      .then(setUserTitles)
      .catch((error) => {
        if (!controller.signal.aborted) {
          setWatchlistError(error.message || "Could not load your watchlist.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setWatchlistLoading(false);
      });
    migration
      .then(() => fetchUserReviews(controller.signal))
      .then((reviews) => {
        if (!controller.signal.aborted) {
          setReviewedMovieIds(
            new Set(reviews.map((review) => String(review.movie_id)))
          );
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.error("Could not load reviewed movie statuses:", error);
        }
      });

    return () => controller.abort();
  }, []);

  const handleToggleWatchlist = useCallback(async (movie) => {
    const movieId = String(movie.id);
    if (pendingWatchlistIds.current.has(movieId)) return false;
    pendingWatchlistIds.current.add(movieId);

    const previousIndex = userTitles.findIndex(
      (item) => String(item.id) === movieId
    );
    const previousTitle = userTitles[previousIndex];
    const shouldAddToWatchlist = !previousTitle?.in_watchlist;
    const optimisticStatus = {
      id: movie.id,
      in_watchlist: shouldAddToWatchlist,
      watched: Boolean(previousTitle?.watched),
      watched_at: previousTitle?.watched_at ?? null,
      added_at: shouldAddToWatchlist
        ? new Date().toISOString()
        : previousTitle?.added_at ?? null
    };

    setUserTitles((currentTitles) =>
      mergeUserTitleStatus(currentTitles, movie, optimisticStatus)
    );
    setWatchlistError("");

    try {
      const updatedStatus = shouldAddToWatchlist
        ? await addMovieToUserWatchlist(movie)
        : await removeMovieFromUserWatchlist(movie.id);
      if (
        updatedStatus?.id == null ||
        String(updatedStatus.id) !== movieId ||
        typeof updatedStatus.in_watchlist !== "boolean" ||
        typeof updatedStatus.watched !== "boolean"
      ) {
        throw new Error("The server returned an invalid watchlist status.");
      }

      setUserTitles((currentTitles) =>
        mergeUserTitleStatus(currentTitles, movie, updatedStatus)
      );
      return true;
    } catch (error) {
      setUserTitles((currentTitles) =>
        restoreUserTitle(
          currentTitles,
          movieId,
          previousTitle,
          previousIndex
        )
      );
      setWatchlistError(error.message || "Could not update your watchlist.");
      return false;
    } finally {
      pendingWatchlistIds.current.delete(movieId);
    }
  }, [userTitles]);

  const handleToggleWatched = useCallback(async (movie) => {
    // 1. Create a copy of the movie payload
    let moviePayload = { ...movie };

    // 2. Intercept missing runtime (e.g., when clicking from the Home screen)
    if (typeof moviePayload.runtime !== 'number' || moviePayload.runtime === 0) {
      try {
        const fullDetails = await fetchMovieDetails(movie.id);
        moviePayload.runtime = fullDetails.runtime || 0;
      } catch (err) {
        console.error("Could not fetch missing runtime for stats:", err);
        moviePayload.runtime = 0;
      }
    }

    const userTitle = userTitles.find(
      (item) => String(item.id) === String(movie.id)
    );
    try {
      // 3. Send the enriched moviePayload instead of the raw movie
      setUserTitles(await setUserTitleWatched(moviePayload, !userTitle?.watched));
      setWatchlistError("");
      return true;
    } catch (error) {
      setWatchlistError(error.message || "Could not update watched status.");
      return false;
    }
  }, [userTitles]);

  const markMovieReviewed = useCallback((movieId) => {
    setReviewedMovieIds((previous) => {
      const updated = new Set(previous);
      updated.add(String(movieId));
      return updated;
    });
  }, []);
  const unmarkMovieReviewed = useCallback((movieId) => {
    setReviewedMovieIds((previous) => {
      const updated = new Set(previous);
      updated.delete(String(movieId));
      return updated;
    });
  }, []);

  return {
    userTitles,
    reviewedMovieIds,
    markMovieReviewed,
    unmarkMovieReviewed,
    watchlistError,
    watchlistLoading,
    handleToggleWatchlist,
    handleToggleWatched
  };
}