import { useState, useEffect } from 'react';
import { createMovie, getGenres } from '../services/api';

const INITIAL_FORM = {
  title: '',
  year: '',
  genre: [],
  rating: '',
  director: '',
  description: '',
};

export default function MovieForm({ onMovieCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);
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

      const result = await createMovie(movieData);

      if (result.success) {
        setForm(INITIAL_FORM);
        onMovieCreated();
      } else {
        setError(result.error || 'Failed to create movie');
      }
    } catch (err) {
      setError('Could not connect to the API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="movie-form" onSubmit={handleSubmit}>
      <h2>Add New Movie</h2>

      {error && <p className="error">{error}</p>}

      <input
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required
      />
      <input
        name="year"
        type="number"
        placeholder="Year"
        value={form.year}
        onChange={handleChange}
        required
      />

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
        name="rating"
        type="number"
        step="0.1"
        min="0"
        max="10"
        placeholder="Rating (0-10)"
        value={form.rating}
        onChange={handleChange}
        required
      />
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
        rows={3}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Add Movie'}
      </button>
    </form>
  );
}
