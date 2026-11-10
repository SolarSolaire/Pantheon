import api from "./axios";

const legacyMigrations = new Map();

function getLegacyStorageKeys() {
  const token = localStorage.getItem("pantheon_token");
  const payload = token?.split(".")[1];
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(paddedBase64), (character) =>
      character.charCodeAt(0)
    );
    const claims = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof claims.user_id !== "string" && typeof claims.user_id !== "number") {
      return null;
    }

    return {
      watchlist: `pantheon_watchlist_${claims.user_id}`,
      ratings: `pantheon_ratings_${claims.user_id}`
    };
  } catch (error) {
    throw new Error(`Could not identify your account to migrate saved data: ${error.message}`);
  }
}

function readLegacyJson(storageKey, description) {
  const storedValue = localStorage.getItem(storageKey);
  if (!storedValue) return null;
  try {
    return JSON.parse(storedValue);
  } catch {
    throw new Error(`Could not migrate your saved ${description}; its stored data is invalid.`);
  }
}

function getLegacyMovies(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (!data || !Array.isArray(data.lists) || typeof data.activeListId !== "string") {
    throw new Error("Could not migrate your saved watchlist; its stored data is invalid.");
  }
  const activeList = data.lists.find((list) => list.id === data.activeListId);
  if (!activeList || !Array.isArray(activeList.movies)) {
    throw new Error("Could not migrate your saved watchlist; its active list is invalid.");
  }
  return activeList.movies;
}

async function migrateLegacyUserData() {
  const keys = getLegacyStorageKeys();
  if (!keys) return;

  const [storedWatchlists, storedRatings] = await Promise.all([
    Promise.resolve(readLegacyJson(keys.watchlist, "watchlist")),
    Promise.resolve(readLegacyJson(keys.ratings, "ratings"))
  ]);
  if (!storedWatchlists && !storedRatings) return;

  const movies = getLegacyMovies(storedWatchlists);
  if (
    storedRatings &&
    (typeof storedRatings !== "object" || Array.isArray(storedRatings))
  ) {
    throw new Error("Could not migrate your saved ratings; its stored data is invalid.");
  }
  if (movies.some((movie) => !movie?.id || !movie.title)) {
    throw new Error("Could not migrate your saved watchlist; a movie entry is invalid.");
  }
  const ratings = { ...(storedRatings || {}) };
  movies.forEach((movie) => {
    if (movie?.user_rating != null) ratings[movie.id] = movie.user_rating;
  });

  for (const movie of movies) {
    if (movie?.id && movie.title) {
      await api.post("/user-data/watchlist", movie);
    }
  }
  for (const [movieId, rating] of Object.entries(ratings)) {
    await api.put(`/user-data/ratings/${encodeURIComponent(movieId)}`, { rating });
  }

  localStorage.removeItem(keys.watchlist);
  localStorage.removeItem(keys.ratings);
}

export function ensureLegacyUserDataMigrated() {
  const token = localStorage.getItem("pantheon_token");
  if (!legacyMigrations.has(token)) {
    const migration = migrateLegacyUserData().catch((error) => {
      legacyMigrations.delete(token);
      throw error;
    });
    legacyMigrations.set(token, migration);
  }
  return legacyMigrations.get(token);
}

export async function fetchUserRatings(signal) {
  const { data } = await api.get("/user-data/ratings", { signal });
  return data.ratings;
}

export async function saveUserRating(movieId, rating, movie) {
  await api.put(`/user-data/ratings/${encodeURIComponent(movieId)}`, {
    rating,
    movie
  });
}

export async function clearUserRating(movieId) {
  await api.delete(`/user-data/ratings/${encodeURIComponent(movieId)}`);
}

export async function fetchUserTitles(signal) {
  const { data } = await api.get("/user-data/titles", { signal });
  return data.titles;
}

export async function addMovieToUserWatchlist(movie) {
  const { data } = await api.post("/user-data/watchlist", movie);
  return data.titles;
}

export async function setUserTitleWatched(movie, watched) {
  const { data } = await api.put(
    `/user-data/titles/${encodeURIComponent(movie.id)}/watched`,
    { movie, watched }
  );
  return data.titles;
}

export async function removeMovieFromUserWatchlist(movieId) {
  const { data } = await api.delete(
    `/user-data/watchlist/${encodeURIComponent(movieId)}`
  );
  return data.titles;
}

export async function fetchUserReviews(signal) {
  const { data } = await api.get("/user-data/reviews", { signal });
  return data.reviews;
}

export async function fetchUserReview(movieId, signal) {
  const { data } = await api.get(
    `/user-data/reviews/${encodeURIComponent(movieId)}`,
    { signal }
  );
  return data.review;
}

export async function saveUserReview(movie, reviewText) {
  const { data } = await api.put(
    `/user-data/reviews/${encodeURIComponent(movie.id)}`,
    { movie, review_text: reviewText }
  );
  return data.review;
}

export async function deleteUserReview(movieId) {
  await api.delete(`/user-data/reviews/${encodeURIComponent(movieId)}`);
}

export async function fetchUserProfile(signal) {
  const { data } = await api.get("/auth/profile", { signal });
  return data.user;
}

export async function updateUserProfile(username) {
  const { data } = await api.put("/auth/profile", { username });
  return data.user;
}

export async function fetchUserStatistics(signal) {
  const { data } = await api.get("/user-data/statistics", { signal });
  return data.statistics;
}

export async function logoutUser() {
  const token = localStorage.getItem("pantheon_token");
  if (!token) return;
  try {
    await api.post("/auth/logout");
  } finally {
    localStorage.removeItem("pantheon_token");
  }
}
