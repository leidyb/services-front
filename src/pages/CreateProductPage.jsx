
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/product/ProductForm';
import { createProduct } from '../services/productService';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import './CreateProductPage.css'; 

const CreateProductPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const [formKey, setFormKey] = useState(Date.now());
    const { logout } = useAuth(); 

    const handleCreateProduct = async (formData) => {
        setIsSubmitting(true);
        try {
            const newProduct = await createProduct(formData);
            toast.success(`¡Producto "${newProduct.name}" creado con éxito! ID: ${newProduct.id}`);
            setFormKey(Date.now()); 
            setTimeout(() => {
                navigate('/'); 
            }, 2000);
        } catch (err) {
            toast.error(`Error al crear el producto: ${err.message}`);

            if (err && (err.status === 401 || err.status === 403)) {
                toast.info("Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión de nuevo.");
                logout();
                navigate('/login');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="create-product-page">
            <h1>Crear Nuevo Producto</h1>
            <ProductForm 
                key={formKey}
                onSubmit={handleCreateProduct} 
                isSubmitting={isSubmitting} 
                submitButtonText="Crear Producto" 
            />
        </div>
    );
};

export default CreateProductPage;