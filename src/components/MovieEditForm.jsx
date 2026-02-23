import { useState, useEffect } from 'react';
import { updateMovie, getGenres } from '../services/api';

export default function MovieEditForm({ movie, onMovieUpdated, onCancel }) {
  const [form, setForm] = useState({
    title: movie.title,
    year: String(movie.year),
    genre: movie.genre,
    rating: String(movie.rating),
    director: movie.director,
    description: movie.description,
  });
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getGenres().then((res) => {
      if (res.success) setGenres(res.data);
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenreToggle = (genreValue) => {
    setForm((prev) => ({
      ...prev,
      genre: prev.genre.includes(genreValue)
        ? prev.genre.filter((g) => g !== genreValue)
        : [...prev.genre, genreValue],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (form.genre.length === 0) {
      setError('Please select at least one genre');
      setLoading(false);
      return;
    }

    try {
      const movieData = {
        title: form.title,
        year: Number(form.year),
        genre: form.genre,
        rating: Number(form.rating),
        director: form.director,
        description: form.description,
      };

      const result = await updateMovie(movie.id, movieData);

      if (result.success) {
        onMovieUpdated();
      } else {
        setError(result.error || 'Failed to update movie');
      }
    } catch (err) {
      setError('Could not connect to the API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="movie-edit-form" onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}

      <input
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required
      />
      <div className="edit-row">
        <input
          name="year"
          type="number"
          placeholder="Year"
          value={form.year}
          onChange={handleChange}
          required
        />
        <input
          name="rating"
          type="number"
          step="0.1"
          min="0"
          max="10"
          placeholder="Rating"
          value={form.rating}
          onChange={handleChange}
          required
        />
      </div>

      <div className="genre-checkboxes">
        <label>Genres</label>
        <div className="genre-options">
          {genres.map((g) => (
            <label key={g.value} className="genre-checkbox-label">
              <input
                type="checkbox"
                checked={form.genre.includes(g.value)}
                onChange={() => handleGenreToggle(g.value)}
              />
              {g.label}
            </label>
          ))}
        </div>
      </div>

      <input
        name="director"
        placeholder="Director"
        value={form.director}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        required
        rows={2}
      />
      <div className="edit-actions">
        <button type="submit" className="save-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button type="button" className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
