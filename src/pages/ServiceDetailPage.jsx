// Ruta: src/pages/ServiceDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getServiceById, deleteService } from '../services/trueServiceService';
import { getRatingsForService, createRating, deleteRating as apiDeleteRating } from '../services/ratingService';
import { getSellerProfile } from '../services/userService'; // <-- IMPORTAR SERVICIO DE PERFIL
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from '../components/common/ConfirmModal';
import RatingForm from '../components/rating/RatingForm';
import RatingDisplay from '../components/rating/RatingDisplay';
import StarRatingDisplay from '../components/common/StarRatingDisplay'; // <-- IMPORTAR COMPONENTE DE ESTRELLAS
import { toast } from 'react-toastify';
import placeholderServiceImage from '../assets/images/placeholder-service.png';
import './ProductDetailPage.css'; // Reutilizando estilos

const ServiceDetailPage = () => {
    const [service, setService] = useState(null);
    const [loadingService, setLoadingService] = useState(true);
    const [errorService, setErrorService] = useState(null);

    // --- NUEVOS ESTADOS PARA PERFIL DEL VENDEDOR ---
    const [sellerProfile, setSellerProfile] = useState(null);
    const [loadingSeller, setLoadingSeller] = useState(false); // Inicia en false, se activa con el servicio

    const [ratings, setRatings] = useState([]);
    const [loadingRatings, setLoadingRatings] = useState(true);
    const [ratingsPage, setRatingsPage] = useState(0);
    const [ratingsTotalPages, setRatingsTotalPages] = useState(0);
    const RATINGS_PAGE_SIZE = 5;
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [showRatingForm, setShowRatingForm] = useState(false);

    const { id: serviceId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    const [isConfirmDeleteServiceOpen, setIsConfirmDeleteServiceOpen] = useState(false);
    const [isDeletingService, setIsDeletingService] = useState(false);
    const [isConfirmDeleteRatingOpen, setIsConfirmDeleteRatingOpen] = useState(false);
    const [ratingToDeleteId, setRatingToDeleteId] = useState(null);
    const [isDeletingRating, setIsDeletingRating] = useState(false);

    const getEstadoText = (estado) => {
        if (!estado) return 'No especificado';
        return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
    };
    
    // Efecto para cargar detalles del servicio y luego el perfil del vendedor
    useEffect(() => {
        const fetchServiceAndSeller = async () => {
            if (!serviceId) { 
                setErrorService('ID de servicio no válido.'); 
                setLoadingService(false); 
                return; 
            }
            setLoadingService(true);
            setLoadingSeller(true); // Iniciar carga del vendedor
            try {
                const serviceData = await getServiceById(serviceId);
                setService(serviceData);
                // Una vez que tenemos el servicio, obtenemos el perfil del vendedor
                if (serviceData && serviceData.ofertadoPorUsername) {
                    try {
                        const profileData = await getSellerProfile(serviceData.ofertadoPorUsername);
                        setSellerProfile(profileData);
                    } catch (profileError) {
                        console.error("Error al cargar perfil del vendedor para servicio:", profileError);
                        setSellerProfile(null); 
                    }
                } else {
                    setSellerProfile(null); // No hay ofertante
                }
            } catch (err) { 
                setErrorService('No se pudo cargar el servicio.'); 
                toast.error('Error al cargar el servicio.'); 
            } 
            finally { 
                setLoadingService(false); 
                setLoadingSeller(false);
            }
        };
        fetchServiceAndSeller();
    }, [serviceId]);

    // ... (fetchServiceRatings, requestDeleteService, handleConfirmDeleteService, handleCancelDeleteService se mantienen igual) ...
    // ... (handleRatingSubmit, requestDeleteRating, handleConfirmDeleteRating, handleCancelDeleteRating se mantienen igual) ...
    // ... (logoutAndRedirect, canEditOrDeleteService, canRateService se mantienen igual) ...
    
    const fetchServiceRatings = useCallback(async (page = 0) => { /* ... sin cambios ... */ }, [serviceId]);
    useEffect(() => { if(serviceId) fetchServiceRatings(ratingsPage); }, [serviceId, ratingsPage, fetchServiceRatings]);
    const requestDeleteService = () => { if (isDeletingService) return; setIsConfirmDeleteServiceOpen(true); };
    const handleConfirmDeleteService = async () => { if (service) { setIsDeletingService(true); try { await deleteService(service.id); toast.success(`¡Servicio "${service.name}" eliminado!`); navigate('/servicios'); } catch (err) { toast.error(err.message); if (err.status === 401 || err.status === 403) logoutAndRedirect(); setIsDeletingService(false); setIsConfirmDeleteServiceOpen(false); } } };
    const handleCancelDeleteService = () => { if (isDeletingService) return; setIsConfirmDeleteServiceOpen(false);};
    const handleRatingSubmit = async (ratingData) => { if (!serviceId) return; setIsSubmittingRating(true); try { await createRating({ ...ratingData, serviceId: parseInt(serviceId) }); toast.success("¡Gracias por tu calificación!"); fetchServiceRatings(); setShowRatingForm(false); } catch (err) { toast.error(err.message); if (err.status === 401 || err.status === 403) logoutAndRedirect(); } finally { setIsSubmittingRating(false); } };
    const requestDeleteRating = (ratingId) => { setRatingToDeleteId(ratingId); setIsConfirmDeleteRatingOpen(true);};
    const handleConfirmDeleteRating = async () => { if (ratingToDeleteId) { setIsDeletingRating(true); try { await apiDeleteRating(ratingToDeleteId); toast.success("Calificación eliminada."); fetchServiceRatings(); } catch (err) { toast.error(err.message); if (err.status === 401 || err.status === 403) logoutAndRedirect(); } finally { setIsConfirmDeleteRatingOpen(false); setRatingToDeleteId(null); setIsDeletingRating(false); } } };
    const handleCancelDeleteRating = () => setIsConfirmDeleteRatingOpen(false);
    const logoutAndRedirect = () => { toast.info("Tu sesión puede haber expirado."); logout(); navigate('/login'); };
    const canEditOrDeleteService = isAuthenticated && service && (user?.username === service.ofertadoPorUsername || user?.roles?.includes('ROLE_ADMIN'));
    const canRateService = isAuthenticated && service && user?.username !== service.ofertadoPorUsername;


    if (loadingService) return <div className="page-loading">Cargando detalle del servicio...</div>;
    if (errorService) return <div className="page-error" style={{ color: 'red' }}>Error: {errorService} <Link to="/servicios">Volver al catálogo</Link></div>;
    if (!service) return <div className="page-info">Servicio no encontrado. <Link to="/servicios">Volver al catálogo</Link></div>;

    const formattedPrice = service.estimatedPrice !== null && service.estimatedPrice !== undefined 
        ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(service.estimatedPrice)
        : 'A convenir';
    const imageUrl = service.imagenes ? (service.imagenes.startsWith('http') ? service.imagenes : `http://localhost:8080${service.imagenes}`) : placeholderServiceImage;

    return (
        <div className="product-detail-page">
            {imageUrl && (
                <div className="product-detail-image-container">
                    <img src={imageUrl} alt={service.name || "Servicio"} className="product-detail-image" />
                </div>
            )}
            <div className="product-detail-content">
                <h1>{service.name}</h1>
                {service.estado && ( <p><strong>Estado:</strong> <span className={`status-badge status-${String(service.estado).toLowerCase()}`}>{getEstadoText(service.estado)}</span></p> )}
                <p><strong>Categoría:</strong> {service.categoryName || 'N/A'}</p>
                <p className="product-detail-price"><strong>Precio Estimado:</strong> {formattedPrice}</p>
                
                {/* --- MOSTRAR INFO DEL VENDEDOR Y SU CALIFICACIÓN --- */}
                <div className="seller-info" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                    <strong>Ofertado por:</strong> 
                    <span className="seller-username-display" style={{ color: '#333' /* o tu color preferido */ }}>
                        {service.ofertadoPorUsername || 'No especificado'}
                    </span>
                    {!loadingSeller && sellerProfile && sellerProfile.totalOverallRatings > 0 && (
                        <StarRatingDisplay 
                            rating={sellerProfile.overallAverageRating} 
                            totalRatings={sellerProfile.totalOverallRatings} 
                            size="1em" 
                        />
                    )}
                    {!loadingSeller && sellerProfile && sellerProfile.totalOverallRatings === 0 && (
                        <span style={{fontSize: '0.9em', color: '#777'}}>(Sin calificaciones aún)</span>
                    )}
                    {loadingSeller && <span style={{fontSize: '0.9em', color: '#777'}}>Cargando calificación del vendedor...</span>}
                </div>
                {/* --- FIN INFO DEL VENDEDOR --- */}
                
                <div><h3>Descripción Detallada:</h3><p>{service.description || "N/A"}</p></div>
                <div className="product-detail-actions">{/* ... (botones Editar, Eliminar Servicio, Volver) ... */}
                     {canEditOrDeleteService && (
                        <>
                            <Link to={`/servicio/${service.id}/editar`} className="action-button edit-button">Editar</Link>
                            <button onClick={requestDeleteService} className="action-button delete-button" disabled={isDeletingService}>
                                {isDeletingService ? "Eliminando..." : "Eliminar Servicio"}
                            </button>
                        </>
                    )}
                    <Link to="/servicios" className="action-button back-button">Volver al Catálogo</Link>
                </div>
            </div>

            {/* --- SECCIÓN DE CALIFICACIONES DEL SERVICIO --- */}
            <div className="ratings-section">
                <h2>Calificaciones del Servicio</h2>
                {canRateService && !showRatingForm && ( <button onClick={() => setShowRatingForm(true)} className="action-button" style={{marginBottom: '15px'}}>Dejar una Calificación</button> )}
                {showRatingForm && ( <RatingForm onSubmit={handleRatingSubmit} isSubmitting={isSubmittingRating} /> )}
                {loadingRatings && <p>Cargando calificaciones...</p>}
                {!loadingRatings && ratings.length === 0 && <p>Este servicio aún no tiene calificaciones. ¡Sé el primero!</p>}
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
                       {/* TODO: Paginación para ratings si ratingsTotalPages > 1 */}
                    </div>
                )}
            </div>
            {/* ... (ConfirmModals se mantienen igual) ... */}
            <ConfirmModal isOpen={isConfirmDeleteServiceOpen} title="Confirmar Eliminación de Servicio" message={`¿Eliminar "${service?.name}"?`} onConfirm={handleConfirmDeleteService} onCancel={handleCancelDeleteService} isConfirmDisabled={isDeletingService} isCancelDisabled={isDeletingService} confirmText={isDeletingService ? "Eliminando..." : "Sí, Eliminar"} />
            <ConfirmModal isOpen={isConfirmDeleteRatingOpen} title="Confirmar Eliminación de Calificación" message="¿Eliminar esta calificación?" onConfirm={handleConfirmDeleteRating} onCancel={handleCancelDeleteRating} isConfirmDisabled={isDeletingRating} isCancelDisabled={isDeletingRating} confirmText={isDeletingRating ? "Eliminando..." : "Sí, Eliminar"} />
        </div>
    );
};

export default ServiceDetailPage;