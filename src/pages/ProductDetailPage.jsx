
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, deleteProduct } from '../services/productService';
import { getRatingsForProduct, createRating, deleteRating as apiDeleteRating } from '../services/ratingService';
import { getSellerProfile } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from '../components/common/ConfirmModal';
import RatingForm from '../components/rating/RatingForm';
import RatingDisplay from '../components/rating/RatingDisplay';
import StarRatingDisplay from '../components/common/StarRatingDisplay';
import { toast } from 'react-toastify';
import placeholderImage from '../assets/images/placeholder-product.png';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
    const [product, setProduct] = useState(null);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [errorProduct, setErrorProduct] = useState(null);

    const [sellerProfile, setSellerProfile] = useState(null);
    const [loadingSeller, setLoadingSeller] = useState(false);


    const [ratings, setRatings] = useState([]);
    const [loadingRatings, setLoadingRatings] = useState(true);
    const [ratingsPage, setRatingsPage] = useState(0);
    const [ratingsTotalPages, setRatingsTotalPages] = useState(0);
    const RATINGS_PAGE_SIZE = 5;
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [showRatingForm, setShowRatingForm] = useState(false);

    const { id: productId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    const [isConfirmDeleteProductOpen, setIsConfirmDeleteProductOpen] = useState(false);
    const [isDeletingProduct, setIsDeletingProduct] = useState(false);
    const [isConfirmDeleteRatingOpen, setIsConfirmDeleteRatingOpen] = useState(false);
    const [ratingToDeleteId, setRatingToDeleteId] = useState(null);
    const [isDeletingRating, setIsDeletingRating] = useState(false);

    const getEstadoText = (estado) => {
        if (!estado) return 'No especificado';
        return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
    };


    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) { setErrorProduct('ID de producto no válido.'); setLoadingProduct(false); return; }
            setLoadingProduct(true);
            setLoadingSeller(true);
            try {
                const productData = await getProductById(productId);
                setProduct(productData);

                if (productData && productData.ofertadoPorUsername) {
                    try {
                        const profileData = await getSellerProfile(productData.ofertadoPorUsername);
                        setSellerProfile(profileData);
                    } catch (profileError) {
                        console.error("Error al cargar perfil del vendedor:", profileError);

                        setSellerProfile(null);
                    }
                }
            } catch (err) {
                setErrorProduct('No se pudo cargar el producto.');
                toast.error('Error al cargar el producto.');
            }
            finally {
                setLoadingProduct(false);
                setLoadingSeller(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const fetchRatings = useCallback(async (page = 0) => { /* ... sin cambios ... */
        if (!productId) return;
        setLoadingRatings(true);
        try {
            const data = await getRatingsForProduct(productId, page, RATINGS_PAGE_SIZE);
            setRatings(data.content);
            setRatingsPage(data.number);
            setRatingsTotalPages(data.totalPages);
        } catch (err) { toast.error('Error al cargar calificaciones.'); }
        finally { setLoadingRatings(false); }
    }, [productId]);


    useEffect(() => {
        fetchRatings(ratingsPage);
    }, [productId, ratingsPage, fetchRatings]);


    const requestDeleteProduct = () => { if (isDeletingProduct) return; setIsConfirmDeleteProductOpen(true); };
    const handleConfirmDeleteProduct = async () => {
        if (product) {
            setIsDeletingProduct(true);
            try { await deleteProduct(product.id); toast.success(`¡Producto "${product.name}" eliminado!`); navigate('/'); }
            catch (err) { toast.error(err.message); if (err.status === 401 || err.status === 403) logoutAndRedirect(); setIsDeletingProduct(false); setIsConfirmDeleteProductOpen(false); }
        }
    };
    const handleCancelDeleteProduct = () => { if (isDeletingProduct) return; setIsConfirmDeleteProductOpen(false); };


    const handleRatingSubmit = async (ratingData) => { /* ... sin cambios ... */
        if (!productId) return;
        setIsSubmittingRating(true);
        try {
            await createRating({ ...ratingData, productId: parseInt(productId) });
            toast.success("¡Gracias por tu calificación!");
            fetchRatings();
            setShowRatingForm(false);
        } catch (err) {
            toast.error(err.message || "Error al enviar calificación.");
            if (err && (err.status === 401 || err.status === 403)) logoutAndRedirect();
        } finally {
            setIsSubmittingRating(false);
        }
    };

    const requestDeleteRating = (ratingId) => { setRatingToDeleteId(ratingId); setIsConfirmDeleteRatingOpen(true); };
    const handleConfirmDeleteRating = async () => {
        if (ratingToDeleteId) {
            setIsDeletingRating(true);
            try { await apiDeleteRating(ratingToDeleteId); toast.success("Calificación eliminada."); fetchRatings(); }
            catch (err) { toast.error(err.message); if (err.status === 401 || err.status === 403) logoutAndRedirect(); }
            finally { setIsConfirmDeleteRatingOpen(false); setRatingToDeleteId(null); setIsDeletingRating(false); }
        }
    };
    const handleCancelDeleteRating = () => setIsConfirmDeleteRatingOpen(false);

    const logoutAndRedirect = () => { /* ... sin cambios ... */
        toast.info("Tu sesión puede haber expirado o no tienes permisos.");
        logout();
        navigate('/login');
    };

    const canEditOrDeleteProduct = isAuthenticated && product && (user?.username === product.ofertadoPorUsername || user?.roles?.includes('ROLE_ADMIN'));
    const canRate = isAuthenticated && product && user?.username !== product.ofertadoPorUsername;

    if (loadingProduct) return <div className="page-loading">Cargando detalle del producto...</div>;

    if (errorProduct) return <div className="page-error" style={{ color: 'red' }}>Error: {errorProduct} <Link to="/">Volver al catálogo</Link></div>;
    if (!product) return <div className="page-info">Producto no encontrado. <Link to="/">Volver al catálogo</Link></div>;


    const formattedPrice = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(product.price);
    const imageUrl = product.imagenes ? product.imagenes : placeholderImage; 

    return (
        <div className="product-detail-page">
            {/* ... (Imagen del producto, Nombre, Estado, Categoría, Precio, Stock se mantienen) ... */}
            {imageUrl && (<div className="product-detail-image-container"><img src={imageUrl} alt={product.name || "Producto"} className="product-detail-image" /></div>)}
            <div className="product-detail-content">
                <h1>{product.name}</h1>
                {product.estado && (<p><strong>Estado:</strong> <span className={`status-badge status-${String(product.estado).toLowerCase()}`}>{getEstadoText(product.estado)}</span></p>)}
                <p><strong>Categoría:</strong> {product.categoryName || 'N/A'}</p>
                <p className="product-detail-price"><strong>Precio:</strong> {formattedPrice}</p>
                <p><strong>Stock:</strong> {product.stock !== null && product.stock !== undefined ? product.stock : 'N/A'}</p>

                {/* --- MOSTRAR INFO DEL VENDEDOR Y SU CALIFICACIÓN --- */}
                <div className="seller-info">
                    <strong>Ofertado por:</strong>
                    <span className="seller-username-display">
                        {product.ofertadoPorUsername || 'No especificado'}
                    </span>
                    {!loadingSeller && sellerProfile && sellerProfile.totalOverallRatings > 0 && (
                        <StarRatingDisplay
                            rating={sellerProfile.overallAverageRating}
                            totalRatings={sellerProfile.totalOverallRatings}
                            size="1em"
                        />
                    )}
                    {!loadingSeller && sellerProfile && sellerProfile.totalOverallRatings === 0 && (
                        <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#777' }}>(Sin calificaciones aún)</span>
                    )}
                    {loadingSeller && <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#777' }}>Cargando calificación del vendedor...</span>}
                </div>
                {/* --- FIN INFO DEL VENDEDOR --- */}

                <div><h3>Descripción:</h3><p>{product.description || "N/A"}</p></div>
                <div className="product-detail-actions">{/* ... (botones Editar, Eliminar Producto, Volver) ... */}</div>
            </div>

            {/* --- SECCIÓN DE CALIFICACIONES DEL PRODUCTO (sin cambios importantes) --- */}
            <div className="ratings-section">
                <h2>Calificaciones del Producto</h2>
                {canRate && !showRatingForm && (<button onClick={() => setShowRatingForm(true)} className="action-button" style={{ marginBottom: '15px' }}>Dejar una Calificación</button>)}
                {showRatingForm && (<RatingForm onSubmit={handleRatingSubmit} isSubmitting={isSubmittingRating} />)}
                {loadingRatings && <p>Cargando calificaciones...</p>}
                {!loadingRatings && ratings.length === 0 && <p>Este producto aún no tiene calificaciones. ¡Sé el primero!</p>}
                {!loadingRatings && ratings.length > 0 && (
                    <div className="ratings-list">
                        {ratings.map(rating => (
                            <div key={rating.id} className="rating-item-container">
                                <RatingDisplay rating={rating} />
                                {isAuthenticated && (user?.username === rating.raterUsername || user?.roles?.includes('ROLE_ADMIN')) && (
                                    <button onClick={() => requestDeleteRating(rating.id)} className="delete-rating-button" disabled={isDeletingRating && ratingToDeleteId === rating.id}>
                                        {isDeletingRating && ratingToDeleteId === rating.id ? '...' : 'X'}
                                    </button>
                                )}
                            </div>
                        ))}
                        {/* TODO: Añadir controles de paginación para ratings si ratingsTotalPages > 1 */}
                    </div>
                )}
            </div>
            {/* ... (ConfirmModals se mantienen igual) ... */}
        </div>
    );
};

export default ProductDetailPage;