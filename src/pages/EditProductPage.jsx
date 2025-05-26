import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from '../components/product/ProductForm';
import { getProductById, updateProduct } from '../services/productService';
import { toast } from 'react-toastify';


const EditProductPage = () => {
    const [product, setProduct] = useState(null);
    const [isLoadingProduct, setIsLoadingProduct] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProductDetails = async () => {
            setIsLoadingProduct(true);
            try {


                const data = await getProductById(id);
                setProduct(data);
            } catch (err) {
                toast.error('No se pudo cargar el producto para editar.');
                navigate('/');
            } finally {
                setIsLoadingProduct(false);
            }
        };
        if (id) {
            fetchProductDetails();
        }
    }, [id, navigate]);

    const handleUpdateProduct = async (productData) => {
        setIsSubmitting(true);
        try {

            await updateProduct(id, productData);
            toast.success('¡Producto actualizado con éxito!');

            setTimeout(() => {
                navigate(`/producto/${id}`);
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

         return <div>Producto no encontrado o error al cargar. Por favor, vuelve al catálogo.</div>;
    }

    return (

        <div className="create-product-page"> 
            <h1>Editar Producto: {product.name}</h1> {/* Muestra el nombre del producto que se está editando */}
            <ProductForm 
                onSubmit={handleUpdateProduct} 
                initialData={product}
                isSubmitting={isSubmitting}
                submitButtonText="Actualizar Producto"
            />
        </div>
    );
};

export default EditProductPage;