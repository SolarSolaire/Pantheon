import api from "./axios";

export async function fetchTrendingMovies(signal) {
  const { data } = await api.get("/movies/trending", {
    signal
  });
  return data.results || [];
}

export async function searchMovies(query, signal) {
  const { data } = await api.get("/movies/search", {
    params: { query },
    signal
  });
  return data.results || [];
}
