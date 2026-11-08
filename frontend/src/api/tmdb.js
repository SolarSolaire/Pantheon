import api from "./axios";

async function fetchMovies(endpoint, signal, params) {
  const { data } = await api.get(`/movies/${endpoint}`, {
    params,
    signal
  });
  return data.results || [];
}

async function fetchMoviesWithFourMore(endpoint, signal) {
  const [movies, nextPage] = await Promise.all([
    fetchMovies(endpoint, signal, { page: 1 }),
    fetchMovies(endpoint, signal, { page: 2 })
  ]);
  const movieIds = new Set(movies.map((movie) => movie.id));
  const additionalMovies = nextPage
    .filter((movie) => !movieIds.has(movie.id))
    .slice(0, 4);
  return [...movies, ...additionalMovies];
}

export async function fetchTrendingMovies(signal) {
  return fetchMoviesWithFourMore("trending", signal);
}

export async function fetchPopularMovies(signal) {
  return fetchMovies("popular", signal);
}

export async function fetchUpcomingMovies(signal) {
  return fetchMoviesWithFourMore("upcoming", signal);
}

export async function fetchNowPlayingMovies(signal) {
  return fetchMoviesWithFourMore("now-playing", signal);
}

export async function fetchMovieProductionCompany(movieId, signal) {
  const { data } = await api.get(
    `/movies/details/${movieId}/production-company`,
    { signal }
  );
  return data.productionCompany;
}

export async function searchMovies(query, signal) {
  return fetchMovies("search", signal, { query });
}
