import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/api';

/**
 * Dashboard component — displays aggregated movie & review statistics.
 *
 * DESIGN DECISIONS:
 * 1. Single API call — getDashboardStats() returns everything we need.
 *    The backend runs all queries in parallel, so this is efficient.
 *
 * 2. No chart library — genre bars are pure CSS (div width proportional
 *    to count). This keeps the bundle small and avoids dependencies.
 *
 * 3. Loading/error states — shows feedback while data loads.
 *    In production you might add skeleton screens here.
 *
 * FUTURE IMPROVEMENTS:
 * - Add per-section loading (fetch different stats independently)
 * - Add a refresh button to re-fetch stats
 * - Add date range filter for recent reviews
 */

function StarRating({ rating, max = 5 }) {
  return (
    <span className="star-rating">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`star ${i < rating ? 'filled' : 'empty'}`}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getDashboardStats();

        if (response.success) {
          setStats(response.data);
        } else {
          setError(response.error || 'Failed to load dashboard');
        }
      } catch (err) {
        setError('Could not connect to the server');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!stats) return null;

  // Find the max count for proportional bars
  const maxGenreCount = Math.max(...stats.moviesByGenre.map((g) => g.count), 1);

  return (
    <div className="dashboard">
      {/* --- Summary Cards --- */}
      <div className="dashboard-cards">
        <div className="stat-card">
          <span className="stat-value">{stats.totalMovies}</span>
          <span className="stat-label">Total Movies</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalReviews}</span>
          <span className="stat-label">Total Reviews</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.avgRating}</span>
          <span className="stat-label">Avg Review Rating</span>
        </div>
      </div>

      {/* --- Movies by Genre (bar chart) --- */}
      <div className="dashboard-section">
        <h3>Movies by Genre</h3>
        <div className="genre-bars">
          {stats.moviesByGenre.map((g) => (
            <div key={g.genre} className="genre-bar-row">
              <span className="genre-bar-label">{g.label}</span>
              <div className="genre-bar-track">
                <div
                  className="genre-bar-fill"
                  style={{ width: `${(g.count / maxGenreCount) * 100}%` }}
                />
              </div>
              <span className="genre-bar-count">{g.count}</span>
              <span className="genre-bar-avg">
                {g.avgRating > 0 ? `★ ${g.avgRating}` : '-'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* --- Top Rated Movies --- */}
      <div className="dashboard-section">
        <h3>Top 5 Highest Rated</h3>
        {stats.topRated.length === 0 ? (
          <p className="no-reviews">No movies yet</p>
        ) : (
          <div className="dashboard-list">
            {stats.topRated.map((movie, i) => (
              <div key={movie.id} className="dashboard-list-item">
                <span className="rank">#{i + 1}</span>
                <div className="list-item-info">
                  <span className="list-item-title">{movie.title}</span>
                  <span className="list-item-meta">
                    {movie.year} · {movie.reviewCount} review{movie.reviewCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <span className="rating">{movie.rating}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Most Reviewed Movies --- */}
      <div className="dashboard-section">
        <h3>Most Reviewed</h3>
        {stats.mostReviewed.length === 0 ? (
          <p className="no-reviews">No reviews yet</p>
        ) : (
          <div className="dashboard-list">
            {stats.mostReviewed.map((movie, i) => (
              <div key={movie.id} className="dashboard-list-item">
                <span className="rank">#{i + 1}</span>
                <div className="list-item-info">
                  <span className="list-item-title">{movie.title}</span>
                  <span className="list-item-meta">Rating: {movie.rating}</span>
                </div>
                <span className="review-count-badge">
                  {movie.reviewCount} review{movie.reviewCount !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Recent Reviews --- */}
      <div className="dashboard-section">
        <h3>Recent Reviews</h3>
        {stats.recentReviews.length === 0 ? (
          <p className="no-reviews">No reviews yet</p>
        ) : (
          <div className="review-list">
            {stats.recentReviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <span className="review-author">{review.author}</span>
                  <StarRating rating={review.rating} />
                </div>
                <p className="review-comment">{review.comment}</p>
                <div className="review-footer">
                  <span className="review-movie-tag">{review.movieTitle}</span>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
