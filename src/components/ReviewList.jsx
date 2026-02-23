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

export default function ReviewList({ reviews = [] }) {
  if (reviews.length === 0) {
    return <p className="no-reviews">No reviews yet. Be the first!</p>;
  }

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <div key={review.id} className="review-item">
          <div className="review-header">
            <span className="review-author">{review.author}</span>
            <StarRating rating={review.rating} />
          </div>

          <p className="review-comment">{review.comment}</p>

          <span className="review-date">
            {formatDate(review.createdAt)}
          </span>
        </div>
      ))}
    </div>
  );
}
