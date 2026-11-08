import { useCallback, useEffect, useState } from "react";
import {
  addMovieToUserWatchlist,
  ensureLegacyUserDataMigrated,
  fetchUserWatchlist,
  markUserWatchlistMovieWatched,
  removeMovieFromUserWatchlist
} from "../api/userData";

export default function useUserWatchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistError, setWatchlistError] = useState("");
  const [watchlistLoading, setWatchlistLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    ensureLegacyUserDataMigrated()
      .then(() => fetchUserWatchlist(controller.signal))
      .then(setWatchlist)
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
    const watchlistMovie = watchlist.find((item) => item.id === movie.id);
    try {
      const updatedWatchlist = !watchlistMovie
        ? await addMovieToUserWatchlist(movie)
        : watchlistMovie.watched
          ? await removeMovieFromUserWatchlist(movie.id)
          : await markUserWatchlistMovieWatched(movie.id);
      setWatchlist(updatedWatchlist);
      setWatchlistError("");
    } catch (error) {
      setWatchlistError(error.message || "Could not update your watchlist.");
    }
  }, [watchlist]);

  const handleRemoveMovie = useCallback(async (movieId) => {
    try {
      setWatchlist(await removeMovieFromUserWatchlist(movieId));
      setWatchlistError("");
    } catch (error) {
      setWatchlistError(error.message || "Could not update your watchlist.");
    }
  }, []);

  return {
    watchlist,
    watchlistError,
    watchlistLoading,
    handleToggleWatchlist,
    handleRemoveMovie
  };
}
