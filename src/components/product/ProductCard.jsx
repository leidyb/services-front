import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';
import placeholderImage from '../../assets/images/placeholder-product.png'; // <-- 1. IMPORTA TU IMAGEN PLACEHOLDER

const ProductCard = ({ product, onDelete, isDeleting = false }) => {
    const formattedPrice = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(product.price);

    const handleDeleteClick = (e) => { /* ... sin cambios ... */
        e.preventDefault(); 
        e.stopPropagation(); 
        if (onDelete) {
            onDelete(); 
        }
    };

   const getEstadoText = (estado) => { /* ... sin cambios ... */ 
        if (!estado) return '';
        return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
    };

    // 2. LÓGICA PARA DETERMINAR LA URL DE LA IMAGEN
    // Tu backend devuelve la ruta completa incluyendo /uploads, 
    // así que el frontend la usa si existe, o usa el placeholder.
    const imageUrl = product.imagenes 
                   ? `http://localhost:8080${product.imagenes}` 
                   : placeholderImage; // Usa el placeholder importado si no hay imagen

    return (
        <Link to={`/producto/${product.id}`} className="product-card-link">
            <div className="product-card">
                <div className="product-card-image-container">
                    {/* Siempre mostramos el tag img, pero su src cambia */}
                    <img 
                        src={imageUrl} 
                        alt={product.name || "Producto sin imagen"} 
                        className="product-card-image" 
                    />
                </div>
                <div className="product-card-content">
                    <div className="product-card-header">
                        <h3 className="product-name">{product.name}</h3>
                        {product.estado && (
                            <span className={`product-status status-${String(product.estado).toLowerCase()}`}>
                                {getEstadoText(product.estado)}
                            </span>
                        )}
                    </div>
                    <span className="product-category">{product.categoryName || product.categoria?.nombre}</span>
                    <p className="product-description">{product.description}</p>
                    <div className="product-card-footer">
                        <span className="product-price">{formattedPrice}</span>
                        <span className="product-stock">Stock: {product.stock !== null && product.stock !== undefined ? product.stock : 'N/A'}</span>
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

export default ProductCard;