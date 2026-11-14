const axios = require('axios');

const TMDB_API_URL = 'https://api.themoviedb.org/3';

class TmdbServiceError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'TmdbServiceError';
    this.status = status;
  }
}

async function mapWithConcurrency(values, concurrency, callback) {
  const results = new Array(values.length);
  let nextIndex = 0;
  const workerCount = Math.min(concurrency, values.length);

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < values.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await callback(values[index]);
      }
    })
  );

  return results;
}

class TMDBService {
  constructor() {
    this.searchDetailsCache = new Map();
  }

  getApiKey() {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new TmdbServiceError('TMDB is not configured on the server.', 503);
    }
    return apiKey;
  }

  async request(path, params = {}, language = 'en-US') {
    try {
      const response = await axios.get(`${TMDB_API_URL}${path}`, {
        params: {
          ...params,
          language,
          api_key: this.getApiKey()
        },
        headers: { Accept: 'application/json' },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      if (error instanceof TmdbServiceError) throw error;
      const status = error.response?.status;
      throw new TmdbServiceError(
        status ? `TMDB request failed: ${status}` : 'TMDB is temporarily unavailable.',
        502
      );
    }
  }

  async searchTitles(query, page = 1) {
    const searchResults = await this.request('/search/movie', {
      query,
      page,
      region: 'US',
      include_adult: false
    });
    const candidates = (searchResults.results || []).filter(
      (movie) =>
        typeof movie.poster_path === 'string' && movie.poster_path.trim()
    );
    const details = await mapWithConcurrency(
      candidates,
      4,
      (movie) => this.getSearchDetails(movie.id)
    );
    const results = candidates.filter((movie, index) => {
      const movieDetails = details[index];
      const hasUSTheatricalRelease =
        movieDetails.release_dates?.results?.some(
          (country) =>
            country.iso_3166_1 === 'US' &&
            country.release_dates?.some(
              (release) =>
                [2, 3].includes(release.type) && Boolean(release.release_date)
            )
        ) || false;

      return Number.isFinite(movieDetails.runtime) &&
        movieDetails.runtime >= 40 &&
        hasUSTheatricalRelease;
    });

    return { ...searchResults, results };
  }

  async getTitleDetails(tmdbId, params = {}) {
    return this.request(`/movie/${tmdbId}`, params);
  }

  async getMoviePageDetails(tmdbId) {
    return this.getTitleDetails(tmdbId, {
      append_to_response: 'credits,videos'
    });
  }

  async getSearchDetails(tmdbId) {
    const cachedDetails = this.searchDetailsCache.get(tmdbId);
    if (cachedDetails) {
      this.searchDetailsCache.delete(tmdbId);
      this.searchDetailsCache.set(tmdbId, cachedDetails);
      return cachedDetails;
    }

    const detailsPromise = this.getTitleDetails(tmdbId, {
      append_to_response: 'release_dates'
    });
    this.searchDetailsCache.set(tmdbId, detailsPromise);
    if (this.searchDetailsCache.size > 500) {
      this.searchDetailsCache.delete(this.searchDetailsCache.keys().next().value);
    }

    try {
      return await detailsPromise;
    } catch (error) {
      if (this.searchDetailsCache.get(tmdbId) === detailsPromise) {
        this.searchDetailsCache.delete(tmdbId);
      }
      throw error;
    }
  }

  async getTrendingTitles(page = 1) {
    return this.request('/trending/movie/week', { page });
  }

  async getPopularTitles(page = 1) {
    return this.request('/movie/popular', { page });
  }

  async getUpcomingTitles(page = 1) {
    const dateParts = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
        .formatToParts(new Date())
        .map(({ type, value }) => [type, value])
    );
    const today = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
    return this.request('/discover/movie', {
      page,
      with_origin_country: 'US',
      with_original_language: 'en',
      region: 'US',
      'primary_release_date.gte': today,
      with_release_type: '3|2',
      'with_runtime.gte': 40,
      sort_by: 'popularity.desc',
      include_adult: false
    });
  }

  async getNowPlayingTitles(page = 1) {
    return this.request('/movie/now_playing', { page });
  }

  async getProductionCompany(tmdbId) {
    const details = await this.getTitleDetails(tmdbId);
    return details.production_companies?.[0]?.name || null;
  }
}

module.exports = new TMDBService();
