import { useState, useEffect, useCallback } from 'react';
import { getMovieById, getReviews } from '../services/api';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';

/**
 * Movie detail modal with separated data loading.
 *
 * WHAT CHANGED:
 * Movie data and reviews are now loaded INDEPENDENTLY:
 * - Movie info: GET /api/movies/:id
 * - Reviews:    GET /api/movies/:movieId/reviews (standalone endpoint)
 *
 * WHY SEPARATE?
 * 1. The movie info renders instantly — no waiting for reviews
 * 2. After creating/editing/deleting a review, we only reload reviews
 *    (not the entire movie + reviews combo)
 * 3. Opens the door for paginated reviews in the future
 */
export default function MovieDetailModal({ movieId, onClose }) {
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [movieLoading, setMovieLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const fetchMovie = useCallback(async () => {
    setMovieLoading(true);
    try {
      const result = await getMovieById(movieId);
      if (result.success) {
        setMovie(result.data);
      }
    } catch (err) {
      console.error('Error fetching movie:', err);
    } finally {
      setMovieLoading(false);
    }
  }, [movieId]);

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const result = await getReviews(movieId);
      if (result.success) {
        setReviews(result.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, [movieId]);

  // Load movie and reviews in parallel on mount
  useEffect(() => {
    fetchMovie();
    fetchReviews();
  }, [fetchMovie, fetchReviews]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        {movieLoading ? (
          <p className="loading">Loading movie details...</p>
        ) : !movie ? (
          <p className="error">Movie not found</p>
        ) : (
          <>
            <div className="modal-movie-info">
              <div className="modal-movie-header">
                <h2>{movie.title}</h2>
                <span className="rating">{movie.rating}/10</span>
              </div>
              <p className="movie-meta">
                {movie.year} &middot; {movie.director}
              </p>
              <div className="genres">
                {movie.genre.map((g) => (
                  <span key={g} className="genre-tag">{g}</span>
                ))}
              </div>
              <p className="description">{movie.description}</p>
            </div>

            <hr className="modal-divider" />

            <div className="modal-reviews-section">
              <h3>Reviews ({reviewsLoading ? '...' : reviews.length})</h3>
              {reviewsLoading ? (
                <p className="loading">Loading reviews...</p>
              ) : (
                <ReviewList
                  reviews={reviews}
                  movieId={movie.id}
                  onReviewChanged={fetchReviews}
                />
              )}
            </div>

            <hr className="modal-divider" />

            <ReviewForm movieId={movie.id} onReviewCreated={fetchReviews} />
          </>
        )}
      </div>
    </div>
  );
}
