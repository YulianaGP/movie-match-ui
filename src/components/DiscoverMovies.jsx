import { useState } from 'react';
import { getDiscoverMovies } from '../services/api';

/**
 * Discover Movies component.
 *
 * Calls GET /api/movies/discover which returns random movies enriched
 * with AI-generated content (anecdote, fun fact, sales pitch).
 *
 * If the backend has no OPENROUTER_API_KEY configured, the movies
 * still appear but without AI enrichment (ai_enriched will be null).
 */
export default function DiscoverMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleDiscover = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDiscoverMovies(3);
      if (result.success) {
        setMovies(result.data);
      } else {
        setError(result.error || 'Failed to discover movies');
      }
    } catch (err) {
      setError('Could not connect to the API');
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  return (
    <div className="discover-movies">
      <div className="discover-header">
        <h2>Discover Movies</h2>
        <p>Get random movie recommendations with AI-powered insights</p>
        <button
          className="discover-btn"
          onClick={handleDiscover}
          disabled={loading}
        >
          {loading ? 'Discovering...' : hasSearched ? 'Discover More' : 'Discover'}
        </button>
      </div>

      {error && <p className="search-error">{error}</p>}

      {movies.length > 0 && (
        <div className="discover-results">
          {movies.map((movie) => (
            <div key={movie.id} className="discover-card">
              <div className="movie-card-header">
                <h3>{movie.title}</h3>
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

              {movie.ai_enriched && (
                <div className="ai-enrichment">
                  <div className="ai-section">
                    <h4>Anecdote</h4>
                    <p>{movie.ai_enriched.anecdote}</p>
                  </div>
                  <div className="ai-section">
                    <h4>Fun Fact</h4>
                    <p>{movie.ai_enriched.funFact}</p>
                  </div>
                  <div className="ai-section">
                    <h4>Why Watch It</h4>
                    <p>{movie.ai_enriched.pitch}</p>
                  </div>
                </div>
              )}

              {!movie.ai_enriched && (
                <p className="ai-unavailable">
                  AI insights unavailable for this movie
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!hasSearched && !loading && (
        <div className="search-empty">
          <p>Click <strong>Discover</strong> to get random movie recommendations.</p>
        </div>
      )}
    </div>
  );
}
