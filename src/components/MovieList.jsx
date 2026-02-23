import { useState } from 'react';
import { deleteMovie } from '../services/api';
import MovieEditForm from './MovieEditForm';

export default function MovieList({ movies, loading, onMovieDeleted, onMovieUpdated, onViewReviews }) {
  const [editingId, setEditingId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;

    try {
      const result = await deleteMovie(id);
      if (result.success) {
        onMovieDeleted();
      }
    } catch (err) {
      console.error('Error deleting movie:', err);
    }
  };

  const handleEditDone = () => {
    setEditingId(null);
    onMovieUpdated();
  };

  if (loading) {
    return <p className="loading">Loading movies...</p>;
  }

  if (movies.length === 0) {
    return <p className="empty">No movies found. Try adjusting your filters.</p>;
  }

  return (
    <div className="movie-list">
      <h2>Movies ({movies.length})</h2>
      <div className="movie-grid">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card">
            {editingId === movie.id ? (
              <MovieEditForm
                movie={movie}
                onMovieUpdated={handleEditDone}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <div className="movie-card-header">
                  <h3>{movie.title}</h3>
                  <span className="rating">{movie.rating}/10</span>
                </div>
                <p className="movie-meta">
                  {movie.year} &middot; {movie.director}
                </p>
                <div className="genres">
                  {movie.genre.map((g) => (
                    <span key={g} className="genre-tag">
                      {g}
                    </span>
                  ))}
                </div>
                <p className="description">{movie.description}</p>
                <div className="card-actions">
                  <button
                    className="reviews-btn"
                    onClick={() => onViewReviews(movie.id)}
                  >
                    Reviews
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() => setEditingId(movie.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(movie.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
