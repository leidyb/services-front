// Ruta: src/components/rating/RatingDisplay.jsx
import React from 'react';
import './RatingDisplay.css'; // Crearemos este archivo

const RatingDisplay = ({ rating }) => {
    const renderStars = (score) => {
        let stars = '';
        for (let i = 0; i < 5; i++) {
            stars += (i < score ? '\u2605' : '\u2606'); // Estrella llena o vacía
        }
        return stars;
    };

    return (
        <div className="rating-display-card">
            <div className="rating-header">
                <span className="rater-username">{rating.raterUsername || 'Anónimo'}</span>
                <span className="rating-score">{renderStars(rating.score)}</span>
            </div>
            <p className="rating-comment">{rating.comment || "Sin comentario."}</p>
            <p className="rating-date">
                {rating.createdAt ? new Date(rating.createdAt).toLocaleDateString('es-CO', {
                    year: 'numeric', month: 'long', day: 'numeric'
                }) : ''}
            </p>
        </div>
    );
};

export default RatingDisplay;