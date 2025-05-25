// Ruta: src/components/rating/RatingForm.jsx
import React, { useState } from 'react';
import './RatingForm.css'; // Crearemos este archivo para los estilos

const RatingForm = ({ onSubmit, isSubmitting = false, existingRating = null }) => {
    // Si hay una calificación existente (ej. para editar, aunque no lo implementaremos ahora),
    // podríamos pre-llenar el formulario. Por ahora, solo para creación.
    const [score, setScore] = useState(existingRating ? existingRating.score : 0);
    const [hoverScore, setHoverScore] = useState(0); // Para el efecto hover en las estrellas
    const [comment, setComment] = useState(existingRating ? existingRating.comment : '');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (score === 0) {
            // Podrías usar toast aquí si lo deseas
            alert("Por favor, selecciona una puntuación (estrellas).");
            return;
        }
        onSubmit({ score, comment });
    };

    const Star = ({ starId, marked, onMouseEnter, onMouseLeave, onClick }) => {
        return (
            <span
                className={`star ${marked ? 'marked' : ''}`}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={onClick}
                role="button" // Para accesibilidad
                tabIndex={0} // Para que sea enfocable
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()} // Para accesibilidad
            >
                {marked ? '\u2605' : '\u2606'} {/* Estrella llena vs. vacía */}
            </span>
        );
    };


    return (
        <form onSubmit={handleSubmit} className="rating-form">
            <h4>Deja tu Calificación</h4>
            <div className="form-group">
                <label>Puntuación:</label>
                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((starId) => (
                        <Star
                            key={starId}
                            starId={starId}
                            marked={(hoverScore || score) >= starId}
                            onMouseEnter={() => setHoverScore(starId)}
                            onMouseLeave={() => setHoverScore(0)}
                            onClick={() => setScore(starId)}
                        />
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="comment">Comentario (Opcional):</label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="4"
                    disabled={isSubmitting}
                    placeholder="Escribe tu opinión sobre el producto/servicio..."
                />
            </div>

            <button type="submit" className="submit-button" disabled={isSubmitting || score === 0}>
                {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
            </button>
        </form>
    );
};

export default RatingForm;