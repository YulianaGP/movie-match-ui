import { useState, useEffect, useCallback } from 'react';
import { getMovies } from './services/api';
import { useDebounce } from './hooks/useDebounce';
import MovieList from './components/MovieList';
import MovieForm from './components/MovieForm';
import MovieFilters from './components/MovieFilters';
import MovieDetailModal from './components/MovieDetailModal';
import Pagination from './components/Pagination';
import Dashboard from './components/Dashboard';
import SearchMovies from './components/SearchMovies';
import './App.css';

/**
 * Main application component.
 *
 * WHAT CHANGED:
 * 1. Added tab navigation (Movies | Dashboard)
 * 2. Added useDebounce on the director filter to reduce API calls
 * 3. Dashboard component lazy-loads when tab is selected
 *
 * WHAT'S PRESERVED:
 * - All existing state management for movies
 * - Filter behavior identical to before
 * - Modal behavior identical to before
 */

const ITEMS_PER_PAGE = 10;

const INITIAL_FILTERS = {
  genre: '',
  minRating: '',
  director: '',
  sortBy: '',
  order: 'desc',
};

function App() {
  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [activeTab, setActiveTab] = useState('movies');

  // Debounce the director filter — waits 300ms after user stops typing
  const debouncedDirector = useDebounce(filters.director, 300);

  /**
   * Fetch movies from the API with current filters.
   *
   * WHY useCallback?
   * This function is passed as a prop (onMovieCreated, onMovieDeleted, etc.)
   * and also called inside useEffect. useCallback ensures that the function
   * reference only changes when its dependencies change, preventing:
   * 1. Stale closures — always captures the latest filter/page values
   * 2. Unnecessary re-renders — child components don't re-render if the
   *    function reference hasn't changed
   */
  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMovies({
        genre: filters.genre,
        minRating: filters.minRating,
        director: debouncedDirector,
        sortBy: filters.sortBy,
        order: filters.order,
        page,
        limit: ITEMS_PER_PAGE,
      });
      if (result.success) {
        setMovies(result.data);
        setTotal(result.total);
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.genre, filters.minRating, filters.sortBy, filters.order, debouncedDirector, page]);

  // Fetch when filters change (using debounced director)
  useEffect(() => {
    if (activeTab === 'movies') {
      fetchMovies();
    }
  }, [fetchMovies, activeTab]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Movie Match</h1>
        <p>Manage your movie collection</p>
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'movies' ? 'active' : ''}`}
            onClick={() => setActiveTab('movies')}
          >
            Movies
          </button>
          <button
            className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Search
          </button>
          <button
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
        </nav>
      </header>

      {activeTab === 'movies' && (
        <main className="app-main">
          <MovieForm onMovieCreated={fetchMovies} />
          <MovieFilters filters={filters} onFilterChange={handleFilterChange} />
          <MovieList
            movies={movies}
            loading={loading}
            onMovieDeleted={fetchMovies}
            onMovieUpdated={fetchMovies}
            onViewReviews={setSelectedMovieId}
          />
          <Pagination
            page={page}
            totalItems={total}
            limit={ITEMS_PER_PAGE}
            onPageChange={setPage}
          />
        </main>
      )}

      {activeTab === 'search' && <SearchMovies />}

      {activeTab === 'dashboard' && <Dashboard />}

      {selectedMovieId && (
        <MovieDetailModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
        />
      )}
    </div>
  );
}

export default App;
