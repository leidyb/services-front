// Ruta: src/pages/CreateServicePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceForm from '../components/service/ServiceForm';
import { createService } from '../services/trueServiceService';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext'; // Para verificar si está logueado
import './CreateProductPage.css'; // Reutilizando estilos

const CreateServicePage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const [formKey, setFormKey] = useState(Date.now()); 
    const { logout } = useAuth();

    const handleCreateService = async (formData) => { // formData viene de ServiceForm
        setIsSubmitting(true);
        try {
            const newService = await createService(formData); 
            toast.success(`¡Servicio "${newService.name}" creado con éxito!`);
            setFormKey(Date.now()); 
            setTimeout(() => {
                navigate('/servicios'); 
            }, 2000);
        } catch (err) {
            toast.error(err.message || 'Error al crear el servicio.');
            if (err && (err.status === 401 || err.status === 403)) {
                toast.info("Tu sesión puede haber expirado o no tienes permisos. Por favor, inicia sesión de nuevo.");
                logout(); 
                navigate('/login');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="create-product-page"> 
            <h1>Ofrecer Nuevo Servicio</h1>
            <ServiceForm 
                key={formKey}
                onSubmit={handleCreateService} 
                isSubmitting={isSubmitting} 
                submitButtonText="Crear Servicio" 
            />
        </div>
    );
};

export default CreateServicePage;