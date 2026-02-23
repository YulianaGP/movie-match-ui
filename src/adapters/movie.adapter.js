/**
 * Frontend data adapters.
 *
 * WHY ADAPTERS?
 * The frontend should NOT depend on the exact API response structure.
 * If the backend renames "genre" to "genres" tomorrow, you'd have to
 * update every component. With an adapter, you only change this file.
 *
 * Think of it as a "translator" between the API language and the UI language.
 *
 * WHEN TO USE:
 * - After fetching from API, pass through the adapter before using in components
 * - Example: const movies = response.data.map(adaptMovie)
 */

/** Adapt a movie from API response to frontend format */
export const adaptMovie = (raw) => ({
  id: raw.id,
  title: raw.title,
  year: raw.year,
  genre: raw.genre,
  rating: raw.rating,
  director: raw.director,
  description: raw.description,
  reviewCount: raw.reviewCount ?? 0,
});

/** Adapt a review from API response to frontend format */
export const adaptReview = (raw) => ({
  id: raw.id,
  movieId: raw.movieId,
  author: raw.author,
  rating: raw.rating,
  comment: raw.comment,
  createdAt: raw.createdAt,
});

/** Adapt a dashboard stat entry for genre bars */
export const adaptGenreStat = (raw) => ({
  genre: raw.genre,
  label: raw.label,
  count: raw.count,
  avgRating: raw.avgRating,
});
