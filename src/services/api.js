// API base URL - change this in production
const API_URL = 'http://localhost:3000/api';

/**
 * Fetch all movies from the API with optional filters
 */
export const getMovies = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.genre) params.append('genre', filters.genre);
  if (filters.minRating) params.append('minRating', filters.minRating);
  if (filters.director) params.append('director', filters.director);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.order) params.append('order', filters.order);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const query = params.toString();
  const url = query ? `${API_URL}/movies?${query}` : `${API_URL}/movies`;

  const response = await fetch(url);
  const data = await response.json();
  return data;
};

/**
 * Fetch valid genres from the API
 */
export const getGenres = async () => {
  const response = await fetch(`${API_URL}/movies/genres`);
  const data = await response.json();
  return data;
};

/**
 * Fetch a single movie by ID
 */
export const getMovieById = async (id) => {
  const response = await fetch(`${API_URL}/movies/${id}`);
  const data = await response.json();
  return data;
};

/**
 * Create a new movie
 */
export const createMovie = async (movieData) => {
  const response = await fetch(`${API_URL}/movies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(movieData),
  });
  const data = await response.json();
  return data;
};

/**
 * Update an existing movie
 */
export const updateMovie = async (id, movieData) => {
  const response = await fetch(`${API_URL}/movies/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(movieData),
  });
  const data = await response.json();
  return data;
};

/**
 * Delete a movie
 */
export const deleteMovie = async (id) => {
  const response = await fetch(`${API_URL}/movies/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  return data;
};

/**
 * Fetch all reviews for a movie
 */
export const getReviews = async (movieId) => {
  const response = await fetch(`${API_URL}/movies/${movieId}/reviews`);
  const data = await response.json();
  return data;
};

/**
 * Create a new review for a movie
 */
export const createReview = async (movieId, reviewData) => {
  const response = await fetch(`${API_URL}/movies/${movieId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reviewData),
  });
  const data = await response.json();
  return data;
};

/**
 * Fetch dashboard statistics (aggregations, top rated, etc.)
 */
export const getDashboardStats = async () => {
  const response = await fetch(`${API_URL}/dashboard`);
  const data = await response.json();
  return data;
};
