import { useState, useRef, useEffect } from 'react';
import { createReview } from '../services/api';

const INITIAL_FORM = { author: '', rating: '', comment: '' };

export default function ReviewForm({ movieId, onReviewCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const authorRef = useRef(null);

  useEffect(() => {
    authorRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const reviewData = {
        author: form.author,
        rating: Number(form.rating),
        comment: form.comment,
      };

      const result = await createReview(movieId, reviewData);

      if (result.success) {
        setForm(INITIAL_FORM);
        onReviewCreated();
      } else {
        setError(result.error || 'Failed to create review');
      }
    } catch {
      setError('Could not connect to the API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h4>Write a Review</h4>

      {error && <p className="error">{error}</p>}

      <input
        ref={authorRef}
        name="author"
        placeholder="Your name"
        value={form.author}
        onChange={handleChange}
        required
      />

      <div className="rating-select">
        <label htmlFor="review-rating">Rating</label>
        <select
          id="review-rating"
          name="rating"
          value={form.rating}
          onChange={handleChange}
          required
        >
          <option value="">Select rating</option>
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Good</option>
          <option value="3">3 - Average</option>
          <option value="2">2 - Poor</option>
          <option value="1">1 - Terrible</option>
        </select>
      </div>

      <textarea
        name="comment"
        placeholder="Write your review..."
        value={form.comment}
        onChange={handleChange}
        required
        rows={3}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
