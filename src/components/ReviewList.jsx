import { useState } from 'react';
import { updateReview, deleteReview } from '../services/api';

const StarRating = ({ rating }) => (
  <span
    className="star-rating"
    aria-label={`Rating: ${rating} out of 5`}
    role="img"
  >
    {[1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        className={i <= rating ? 'star filled' : 'star empty'}
        aria-hidden="true"
      >
        {i <= rating ? '\u2605' : '\u2606'}
      </span>
    ))}
  </span>
);

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

/**
 * ReviewList with inline edit and delete capabilities.
 *
 * WHAT CHANGED:
 * - Each review now has Edit and Delete buttons
 * - Edit opens an inline form (same pattern as MovieEditForm)
 * - Delete asks for confirmation then calls DELETE endpoint
 * - onReviewChanged callback reloads just the reviews list
 */
export default function ReviewList({ reviews = [], movieId, onReviewChanged }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: '', comment: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  const handleEditStart = (review) => {
    setEditingId(review.id);
    setEditForm({ rating: String(review.rating), comment: review.comment });
    setEditError(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditError(null);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      const result = await updateReview(movieId, editingId, {
        rating: Number(editForm.rating),
        comment: editForm.comment,
      });
      if (result.success) {
        setEditingId(null);
        onReviewChanged();
      } else {
        setEditError(result.error || 'Failed to update review');
      }
    } catch {
      setEditError('Could not connect to the API');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const result = await deleteReview(movieId, reviewId);
      if (result.success) {
        onReviewChanged();
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  if (reviews.length === 0) {
    return <p className="no-reviews">No reviews yet. Be the first!</p>;
  }

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <div key={review.id} className="review-item">
          {editingId === review.id ? (
            <form className="review-edit-form" onSubmit={handleEditSubmit}>
              {editError && <p className="error">{editError}</p>}
              <div className="rating-select">
                <label htmlFor={`edit-rating-${review.id}`}>Rating</label>
                <select
                  id={`edit-rating-${review.id}`}
                  name="rating"
                  value={editForm.rating}
                  onChange={handleEditChange}
                  required
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Terrible</option>
                </select>
              </div>
              <textarea
                name="comment"
                value={editForm.comment}
                onChange={handleEditChange}
                required
                rows={2}
              />
              <div className="edit-actions">
                <button type="submit" className="save-btn" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save'}
                </button>
                <button type="button" className="cancel-btn" onClick={handleEditCancel}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="review-header">
                <span className="review-author">{review.author}</span>
                <StarRating rating={review.rating} />
              </div>
              <p className="review-comment">{review.comment}</p>
              <div className="review-footer-actions">
                <span className="review-date">{formatDate(review.createdAt)}</span>
                <div className="review-actions">
                  <button
                    className="review-edit-btn"
                    onClick={() => handleEditStart(review)}
                  >
                    Edit
                  </button>
                  <button
                    className="review-delete-btn"
                    onClick={() => handleDelete(review.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
