import { useCallback, useEffect, useState } from "react";
import {
  clearUserRating,
  ensureLegacyUserDataMigrated,
  fetchUserRatings,
  saveUserRating
} from "../api/userData";

export default function useUserRatings() {
  const [userRatings, setUserRatings] = useState({});
  const [ratingsError, setRatingsError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    try {
      ensureLegacyUserDataMigrated()
        .then(() => fetchUserRatings(controller.signal))
        .then(setUserRatings)
        .catch((error) => {
          if (!controller.signal.aborted) {
            setRatingsError(error.message || "Could not load your ratings.");
          }
        });
    } catch (error) {
      setRatingsError(error.message || "Could not load your ratings.");
    }
    return () => controller.abort();
  }, []);

  const handleSaveRating = useCallback(async (movie, rating) => {
    try {
      await saveUserRating(movie.id, rating, movie);
      setUserRatings((previous) => ({ ...previous, [movie.id]: rating }));
      setRatingsError("");
    } catch (error) {
      setRatingsError(error.message || "Could not save your rating.");
    }
  }, []);

  const handleClearRating = useCallback(async (movie) => {
    try {
      await clearUserRating(movie.id);
      setUserRatings((previous) => {
        const updated = { ...previous };
        delete updated[movie.id];
        return updated;
      });
      setRatingsError("");
    } catch (error) {
      setRatingsError(error.message || "Could not clear your rating.");
    }
  }, []);
  return { userRatings, ratingsError, handleSaveRating, handleClearRating };
}
