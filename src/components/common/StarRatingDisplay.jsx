
import React from 'react';
import './StarRatingDisplay.css';

const StarRatingDisplay = ({ rating, totalRatings, size = "1.2em" }) => {
    if (typeof rating !== 'number' || isNaN(rating) || rating < 0 || rating > 5) {
        return <span className="star-rating-text">N/A</span>;
    }

    const fullStars = Math.floor(rating);
    const halfStar = (rating % 1) >= 0.25 && (rating % 1) <= 0.75;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    const displayRating = rating.toFixed(1);

    return (
        <div className="star-rating-display" style={{ fontSize: size }}>
            {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`} className="star full">&#9733;</span>)}
            {halfStar && <span key="half" className="star half">&#9733;</span>} {/* Podrías usar un ícono de media estrella */}
            {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="star empty">&#9734;</span>)}
            {totalRatings !== undefined && (
                <span className="star-rating-text">
                    ({displayRating} de {totalRatings} calif.)
                </span>
            )}
            {totalRatings === undefined && (
                 <span className="star-rating-text">
                    ({displayRating})
                </span>
            )}
        </div>
    );
};

export default StarRatingDisplay;