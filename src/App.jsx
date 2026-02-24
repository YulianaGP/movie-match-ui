import { useState, useEffect, useCallback } from 'react';
import { getMovies, getRandomMovie } from './services/api';
import { useDebounce } from './hooks/useDebounce';
import MovieList from './components/MovieList';
import MovieForm from './components/MovieForm';
import MovieFilters from './components/MovieFilters';
import MovieDetailModal from './components/MovieDetailModal';
import Pagination from './components/Pagination';
import Dashboard from './components/Dashboard';
import SearchMovies from './components/SearchMovies';
import DiscoverMovies from './components/DiscoverMovies';
import './App.css';

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
  const [randomLoading, setRandomLoading] = useState(false);

  const debouncedDirector = useDebounce(filters.director, 300);

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

  useEffect(() => {
    if (activeTab === 'movies') {
      fetchMovies();
    }
  }, [fetchMovies, activeTab]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleRandomMovie = async () => {
    setRandomLoading(true);
    try {
      const result = await getRandomMovie();
      if (result.success) {
        setSelectedMovieId(result.data.id);
      }
    } catch (err) {
      console.error('Error fetching random movie:', err);
    } finally {
      setRandomLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Movie Match</h1>
        <p>Manage your movie collection</p>
        <div className="header-actions">
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
              className={`nav-tab ${activeTab === 'discover' ? 'active' : ''}`}
              onClick={() => setActiveTab('discover')}
            >
              Discover
            </button>
            <button
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
          </nav>
          <button
            className="random-btn"
            onClick={handleRandomMovie}
            disabled={randomLoading}
          >
            {randomLoading ? 'Loading...' : 'Random Movie'}
          </button>
        </div>
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

      {activeTab === 'discover' && <DiscoverMovies />}

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
