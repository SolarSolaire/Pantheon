import { useCallback, useEffect, useState } from "react";
import {
  addMovieToUserWatchlist,
  ensureLegacyUserDataMigrated,
  fetchUserReviews,
  fetchUserTitles,
  removeMovieFromUserWatchlist,
  setUserTitleWatched
} from "../api/userData";

export default function useUserWatchlist() {
  const [userTitles, setUserTitles] = useState([]);
  const [reviewedMovieIds, setReviewedMovieIds] = useState(() => new Set());
  const [watchlistError, setWatchlistError] = useState("");
  const [watchlistLoading, setWatchlistLoading] = useState(true);

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
    const userTitle = userTitles.find(
      (item) => String(item.id) === String(movie.id)
    );
    try {
      const updatedUserTitles = userTitle?.in_watchlist
        ? await removeMovieFromUserWatchlist(movie.id)
        : await addMovieToUserWatchlist(movie);
      setUserTitles(updatedUserTitles);
      setWatchlistError("");
      return true;
    } catch (error) {
      setWatchlistError(error.message || "Could not update your watchlist.");
      return false;
    }
  }, [userTitles]);

  const handleToggleWatched = useCallback(async (movie) => {
    const userTitle = userTitles.find(
      (item) => String(item.id) === String(movie.id)
    );
    try {
      setUserTitles(await setUserTitleWatched(movie, !userTitle?.watched));
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
