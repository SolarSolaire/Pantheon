import api from "./axios";

async function fetchMovies(endpoint, signal) {
  const { data } = await api.get(`/movies/${endpoint}`, {
    signal
  });
  return data.results || [];
}

export async function fetchTrendingMovies(signal) {
  return fetchMovies("trending", signal);
}

export async function fetchPopularMovies(signal) {
  return fetchMovies("popular", signal);
}

export async function fetchUpcomingMovies(signal) {
  return fetchMovies("upcoming", signal);
}

export async function fetchNowPlayingMovies(signal) {
  return fetchMovies("now-playing", signal);
}

export async function fetchMovieProductionCompany(movieId, signal) {
  const { data } = await api.get(
    `/movies/details/${movieId}/production-company`,
    { signal }
  );
  return data.productionCompany;
}

export async function searchMovies(query, signal) {
  const { data } = await api.get("/movies/search", {
    params: { query },
    signal
  });
  return data.results || [];
}
