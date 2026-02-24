import { useState, useEffect } from 'react';
import { searchMovies } from '../services/api';
import { getGenres } from '../services/api';

/**
 * Advanced movie search component.
 *
 * HOW IT DIFFERS FROM MovieFilters:
 * - MovieFilters is REACTIVE — each dropdown change triggers an immediate API call
 * - SearchMovies is EXPLICIT — user fills out a form and clicks "Search"
 *
 * WHY EXPLICIT SEARCH?
 * When combining multiple criteria (title + genre + year range + rating range),
 * reactive filtering would fire 4+ API calls while the user is still configuring.
 * Explicit search waits for the user to finish, then fires 1 call.
 *
 * ENDPOINT: GET /api/movies/search (different from /api/movies)
 * - Supports title and director partial matching
 * - Supports year and rating RANGES (min/max)
 * - Returns pagination metadata (total, pages, page)
 */

const ITEMS_PER_PAGE = 10;

const INITIAL_SEARCH = {
  title: '',
  director: '',
  genre: '',
  yearMin: '',
  yearMax: '',
  ratingMin: '',
  ratingMax: '',
};

export default function SearchMovies() {
  const [form, setForm] = useState(INITIAL_SEARCH);
  const [genres, setGenres] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  // appliedFilters tracks what was ACTUALLY searched (not what's in the form right now)
  const [appliedFilters, setAppliedFilters] = useState(null);

  useEffect(() => {
    getGenres().then((res) => {
      if (res.success) setGenres(res.data);
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const doSearch = async (searchFilters, searchPage) => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchMovies({
        ...searchFilters,
        page: searchPage,
        limit: ITEMS_PER_PAGE,
      });
      if (result.success) {
        setResults(result);
        setAppliedFilters(searchFilters);
      } else {
        setError(result.error || 'Search failed');
      }
    } catch (err) {
      setError('Could not connect to the API');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    doSearch(form, 1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    doSearch(appliedFilters, newPage);
  };

  const handleClear = () => {
    setForm(INITIAL_SEARCH);
    setResults(null);
    setAppliedFilters(null);
    setPage(1);
    setError(null);
  };

  // Build a human-readable list of which filters are active
  const getActiveFilterTags = () => {
    if (!appliedFilters) return [];
    const tags = [];
    if (appliedFilters.title) tags.push({ label: 'Title', value: `"${appliedFilters.title}"` });
    if (appliedFilters.director) tags.push({ label: 'Director', value: `"${appliedFilters.director}"` });
    if (appliedFilters.genre) {
      const genreLabel = genres.find((g) => g.value === appliedFilters.genre)?.label || appliedFilters.genre;
      tags.push({ label: 'Genre', value: genreLabel });
    }
    if (appliedFilters.yearMin && appliedFilters.yearMax) {
      tags.push({ label: 'Year', value: `${appliedFilters.yearMin}–${appliedFilters.yearMax}` });
    } else if (appliedFilters.yearMin) {
      tags.push({ label: 'Year', value: `${appliedFilters.yearMin}+` });
    } else if (appliedFilters.yearMax) {
      tags.push({ label: 'Year', value: `up to ${appliedFilters.yearMax}` });
    }
    if (appliedFilters.ratingMin && appliedFilters.ratingMax) {
      tags.push({ label: 'Rating', value: `${appliedFilters.ratingMin}–${appliedFilters.ratingMax}` });
    } else if (appliedFilters.ratingMin) {
      tags.push({ label: 'Rating', value: `${appliedFilters.ratingMin}+` });
    } else if (appliedFilters.ratingMax) {
      tags.push({ label: 'Rating', value: `up to ${appliedFilters.ratingMax}` });
    }
    return tags;
  };

  const filterTags = getActiveFilterTags();
  const pagination = results?.pagination;
  const totalPages = pagination?.pages || 1;

  return (
    <div className="search-movies">
      <form className="search-form" onSubmit={handleSubmit}>
        <h2>Advanced Search</h2>

        <div className="search-fields">
          {/* Text search fields */}
          <div className="search-field">
            <label htmlFor="search-title">Title</label>
            <input
              id="search-title"
              name="title"
              type="text"
              placeholder='e.g. "star", "dark", "lord"'
              value={form.title}
              onChange={handleChange}
            />
          </div>

          <div className="search-field">
            <label htmlFor="search-director">Director</label>
            <input
              id="search-director"
              name="director"
              type="text"
              placeholder='e.g. "nolan", "spielberg"'
              value={form.director}
              onChange={handleChange}
            />
          </div>

          {/* Genre dropdown */}
          <div className="search-field">
            <label htmlFor="search-genre">Genre</label>
            <select id="search-genre" name="genre" value={form.genre} onChange={handleChange}>
              <option value="">All genres</option>
              {genres.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          {/* Year range */}
          <div className="search-field search-field-range">
            <label>Year Range</label>
            <div className="range-inputs">
              <input
                name="yearMin"
                type="number"
                placeholder="From"
                min="1888"
                value={form.yearMin}
                onChange={handleChange}
              />
              <span className="range-separator">to</span>
              <input
                name="yearMax"
                type="number"
                placeholder="To"
                value={form.yearMax}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Rating range */}
          <div className="search-field search-field-range">
            <label>Rating Range</label>
            <div className="range-inputs">
              <input
                name="ratingMin"
                type="number"
                placeholder="Min"
                min="0"
                max="10"
                step="0.1"
                value={form.ratingMin}
                onChange={handleChange}
              />
              <span className="range-separator">to</span>
              <input
                name="ratingMax"
                type="number"
                placeholder="Max"
                min="0"
                max="10"
                step="0.1"
                value={form.ratingMax}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="search-actions">
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button type="button" className="search-clear-btn" onClick={handleClear}>
            Clear
          </button>
        </div>
      </form>

      {/* Error message */}
      {error && <p className="search-error">{error}</p>}

      {/* Applied filter tags */}
      {filterTags.length > 0 && (
        <div className="search-filter-tags">
          <span className="tags-label">Filters applied:</span>
          {filterTags.map((tag) => (
            <span key={tag.label} className="filter-tag">
              <strong>{tag.label}:</strong> {tag.value}
            </span>
          ))}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="search-results">
          <h3>
            {results.count > 0
              ? `Found ${pagination.total} movie${pagination.total !== 1 ? 's' : ''}`
              : 'No movies found'}
          </h3>

          {results.count > 0 && (
            <>
              <div className="movie-grid">
                {results.data.map((movie) => (
                  <div key={movie.id} className="movie-card">
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
                    {movie.reviewCount > 0 && (
                      <p className="review-count">{movie.reviewCount} review{movie.reviewCount !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    className="page-btn"
                    disabled={page >= totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Empty state before any search */}
      {!results && !loading && !error && (
        <div className="search-empty">
          <p>Configure your filters above and click <strong>Search</strong> to find movies.</p>
        </div>
      )}
    </div>
  );
}
