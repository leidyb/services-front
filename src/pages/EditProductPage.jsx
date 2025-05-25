import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from '../components/product/ProductForm';
import { getProductById, updateProduct } from '../services/productService';
import { toast } from 'react-toastify';
// import './EditProductPage.css'; // Si tienes estilos específicos para esta página

const EditProductPage = () => {
    const [product, setProduct] = useState(null); // Para los datos iniciales del producto
    const [isLoadingProduct, setIsLoadingProduct] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { id } = useParams(); // Obtener el ID del producto de la URL
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProductDetails = async () => {
            setIsLoadingProduct(true);
            try {
                // getProductById debería devolver un ProductDTO que incluya
                // name, description, price, stock, categoryName, imagenes, estado
                const data = await getProductById(id);
                setProduct(data);
            } catch (err) {
                toast.error('No se pudo cargar el producto para editar.');
                navigate('/'); // Redirigir si no se puede cargar el producto
            } finally {
                setIsLoadingProduct(false);
            }
        };
        if (id) { // Solo buscar si hay un ID
            fetchProductDetails();
        }
    }, [id, navigate]);

    const handleUpdateProduct = async (productData) => {
        setIsSubmitting(true);
        try {
            // productData ya incluye todos los campos del formulario, incluyendo imagenes y estado
            await updateProduct(id, productData);
            toast.success('¡Producto actualizado con éxito!');

            setTimeout(() => {
                navigate(`/producto/${id}`); // Redirigir a la página de detalle del producto
            }, 2000);

        } catch (err) {
            toast.error(`Error al actualizar el producto: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingProduct) {
        return <div>Cargando datos del producto para editar...</div>;
    }

    if (!product) {
         // Esto podría pasar si el ID no es válido o hubo un error y navigate('/') no se ejecutó a tiempo
         return <div>Producto no encontrado o error al cargar. Por favor, vuelve al catálogo.</div>;
    }

    return (
        // Puedes usar una clase contenedora similar a CreateProductPage o una específica
        <div className="create-product-page"> 
            <h1>Editar Producto: {product.name}</h1> {/* Muestra el nombre del producto que se está editando */}
            <ProductForm 
                onSubmit={handleUpdateProduct} 
                initialData={product} // Pasamos los datos actuales del producto al formulario
                isSubmitting={isSubmitting}
                submitButtonText="Actualizar Producto"
            />
        </div>
    );
};

export default EditProductPage;