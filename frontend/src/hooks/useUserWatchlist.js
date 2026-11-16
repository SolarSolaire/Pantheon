import { useCallback, useEffect, useState } from "react";
import {
  addMovieToUserWatchlist,
  ensureLegacyUserDataMigrated,
  fetchUserTitles,
  fetchUserReviews,
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
    fetchUserReviews(controller.signal)
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

    ensureLegacyUserDataMigrated()
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

  return {
    userTitles,
    reviewedMovieIds,
    watchlistError,
    watchlistLoading,
    handleToggleWatchlist,
    handleToggleWatched
  };
}
