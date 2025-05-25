// Ruta: src/pages/EditServicePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ServiceForm from '../components/service/ServiceForm';
import { getServiceById, updateService } from '../services/trueServiceService';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import './CreateProductPage.css'; // Reutilizando estilos

const EditServicePage = () => {
    const [service, setService] = useState(null);
    const [isLoadingService, setIsLoadingService] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        const fetchServiceDetails = async () => {
            if (!id) {
                toast.error("ID de servicio no válido.");
                navigate('/servicios');
                return;
            }
            setIsLoadingService(true);
            try {
                const data = await getServiceById(id);
                setService(data);
            } catch (err) {
                toast.error('No se pudo cargar el servicio para editar.');
                navigate('/servicios');
            } finally {
                setIsLoadingService(false);
            }
        };
        fetchServiceDetails();
    }, [id, navigate]);

    const handleUpdateService = async (formData) => { // formData viene de ServiceForm
        setIsSubmitting(true);
        try {
            await updateService(id, formData);
            toast.success('¡Servicio actualizado con éxito!');
            setTimeout(() => {
                navigate(`/servicio/${id}`); 
            }, 2000);
        } catch (err) {
            toast.error(err.message || 'Error al actualizar el servicio.');
             if (err && (err.status === 401 || err.status === 403)) {
                toast.info("Tu sesión puede haber expirado o no tienes permisos. Por favor, inicia sesión de nuevo.");
                logout(); 
                navigate('/login');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingService) {
        return <div>Cargando datos del servicio para editar...</div>;
    }
    
    if (!service) {
         return <div>Servicio no encontrado o error al cargar. Por favor, vuelve al catálogo de servicios.</div>;
    }

    return (
        <div className="create-product-page"> 
            <h1>Editar Servicio: {service.name}</h1>
            <ServiceForm 
                onSubmit={handleUpdateService} 
                initialData={service}
                isSubmitting={isSubmitting}
                submitButtonText="Actualizar Servicio"
            />
        </div>
    );
};

export default EditServicePage;