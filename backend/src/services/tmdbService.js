const axios = require('axios');

const TMDB_API_URL = 'https://api.themoviedb.org/3';

class TmdbServiceError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'TmdbServiceError';
    this.status = status;
  }
}

class TMDBService {
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
    return this.request('/search/movie', {
      query,
      page,
      include_adult: false
    });
  }

  async getTitleDetails(tmdbId) {
    return this.request(`/movie/${tmdbId}`);
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
