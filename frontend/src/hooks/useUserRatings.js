import { useCallback, useEffect, useState } from "react";
import {
  clearUserRating,
  loadUserRatings,
  mergeUserRatings,
  saveUserRating
} from "../utils/watchlist";

export default function useUserRatings() {
  const [userRatings, setUserRatings] = useState({});
  const [ratingsError, setRatingsError] = useState("");

  useEffect(() => {
    try {
      setUserRatings(loadUserRatings());
    } catch (error) {
      setRatingsError(error.message || "Could not load your ratings.");
    }
  }, []);

  const handleSaveRating = useCallback((movie, rating) => {
    try {
      setUserRatings(saveUserRating(movie.id, rating));
      setRatingsError("");
    } catch (error) {
      setRatingsError(error.message || "Could not save your rating.");
    }
  }, []);

  const handleClearRating = useCallback((movie) => {
    try {
      setUserRatings(clearUserRating(movie.id));
      setRatingsError("");
    } catch (error) {
      setRatingsError(error.message || "Could not clear your rating.");
    }
  }, []);

  const mergeRatings = useCallback((legacyRatings) => {
    try {
      setUserRatings(mergeUserRatings(legacyRatings));
      setRatingsError("");
    } catch (error) {
      setRatingsError(error.message || "Could not load your ratings.");
    }
  }, []);

  return { userRatings, ratingsError, handleSaveRating, handleClearRating, mergeRatings };
}
