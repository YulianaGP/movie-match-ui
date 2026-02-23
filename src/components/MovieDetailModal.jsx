import { useState, useEffect, useCallback } from 'react';
import { getMovieById } from '../services/api';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';

export default function MovieDetailModal({ movieId, onClose }) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMovie = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMovieById(movieId);
      if (result.success) {
        setMovie(result.data);
      }
    } catch (err) {
      console.error('Error fetching movie:', err);
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    fetchMovie();
  }, [fetchMovie]);

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

        {loading ? (
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
              <h3>Reviews ({movie.reviews?.length || 0})</h3>
              <ReviewList reviews={movie.reviews || []} />
            </div>

            <hr className="modal-divider" />

            <ReviewForm movieId={movie.id} onReviewCreated={fetchMovie} />
          </>
        )}
      </div>
    </div>
  );
}
