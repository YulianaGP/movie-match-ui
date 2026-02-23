import { useState, useEffect } from 'react';
import { getGenres } from '../services/api';

export default function MovieFilters({ filters, onFilterChange }) {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    getGenres().then((res) => {
      if (res.success) setGenres(res.data);
    });
  }, []);

  const handleChange = (e) => {
    onFilterChange({ ...filters, [e.target.name]: e.target.value });
  };

  const handleClear = () => {
    onFilterChange({ genre: '', minRating: '', director: '', sortBy: '', order: '' });
  };

  const hasActiveFilters = filters.genre || filters.minRating || filters.director || filters.sortBy;

  return (
    <div className="movie-filters">
      <h2>Filters</h2>

      <div className="filters-row">
        {/* Genre filter */}
        <div className="filter-group">
          <label htmlFor="genre">Genre</label>
          <select name="genre" id="genre" value={filters.genre} onChange={handleChange}>
            <option value="">All genres</option>
            {genres.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>

        {/* Minimum rating filter */}
        <div className="filter-group">
          <label htmlFor="minRating">Min Rating</label>
          <select name="minRating" id="minRating" value={filters.minRating} onChange={handleChange}>
            <option value="">Any rating</option>
            <option value="9">9+</option>
            <option value="8.5">8.5+</option>
            <option value="8">8+</option>
            <option value="7">7+</option>
          </select>
        </div>

        {/* Director search */}
        <div className="filter-group">
          <label htmlFor="director">Director</label>
          <input
            type="text"
            name="director"
            id="director"
            placeholder="Search director..."
            value={filters.director}
            onChange={handleChange}
          />
        </div>

        {/* Sort by */}
        <div className="filter-group">
          <label htmlFor="sortBy">Sort by</label>
          <select name="sortBy" id="sortBy" value={filters.sortBy} onChange={handleChange}>
            <option value="">Default</option>
            <option value="rating">Rating</option>
            <option value="year">Year</option>
            <option value="title">Title</option>
          </select>
        </div>

        {/* Sort order */}
        <div className="filter-group">
          <label htmlFor="order">Order</label>
          <select name="order" id="order" value={filters.order} onChange={handleChange}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <button className="clear-filters-btn" onClick={handleClear}>
          Clear filters
        </button>
      )}
    </div>
  );
}
