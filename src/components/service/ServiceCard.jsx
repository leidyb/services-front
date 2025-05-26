import React from 'react';
import { Link } from 'react-router-dom';
import placeholderServiceImage from '../../assets/images/placeholder-service.png';
import '../product/ProductCard.css';

const ServiceCard = ({ service, onDelete, isDeleting = false }) => {
    const formattedPrice = service.estimatedPrice !== null && service.estimatedPrice !== undefined 
        ? new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(service.estimatedPrice)
        : 'Precio a convenir';

    const handleDeleteClick = (e) => {
        e.preventDefault(); 
        e.stopPropagation(); 
        if (onDelete) {
            onDelete(); 
        }
    };

    const getEstadoText = (estado) => {
        if (!estado) return '';
        return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
    };

    const imageUrl = service.imagenes ? service.imagenes : placeholderImage; 

    return (
        <Link to={`/servicio/${service.id}`} className="product-card-link"> 
            <div className="product-card">
                {imageUrl && (
                    <div className="product-card-image-container">
                        <img src={imageUrl} alt={service.name} className="product-card-image" />
                    </div>
                )}
                <div className="product-card-content">
                    <div className="product-card-header">
                        <h3 className="product-name">{service.name}</h3>
                        {service.estado && (
                            <span className={`product-status status-${String(service.estado).toLowerCase()}`}>
                                {getEstadoText(service.estado)}
                            </span>
                        )}
                    </div>
                    <span className="product-category">{service.categoryName}</span>
                    <p className="product-description" style={{ whiteSpace: 'pre-wrap', maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {service.description}
                    </p>
                    <div className="product-card-footer">
                        <span className="product-price">{formattedPrice}</span>
                    </div>
                </div>
                {onDelete && (
                     <div className="product-card-actions">
                         <button 
                            onClick={handleDeleteClick} 
                            className="delete-button"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </button>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ServiceCard;