// Ruta: src/components/product/ProductForm.jsx
import React, { useState, useEffect, useMemo } from 'react'; // Añadimos useMemo
import { getAllCategories } from '../../services/categoryService';
import './ProductForm.css';

const ESTADOS_PRODUCTO = ['ACTIVO', 'INACTIVO', 'PENDIENTE', 'VENDIDO', 'BORRADOR'];

const EMPTY_FORM_STATE = {
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryName: '',
    imagenes: '', // Esto será la URL de la imagen existente o una cadena vacía
    estado: ESTADOS_PRODUCTO[0]
};

const ProductForm = ({
    onSubmit,
    initialData, // Puede ser undefined (creación) o un objeto (edición)
    isSubmitting = false,
    submitButtonText = "Guardar Producto"
}) => {
    // Inicializamos productData una vez basado en initialData o el estado vacío
    const [productData, setProductData] = useState(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            return {
                name: initialData.name || '',
                description: initialData.description || '',
                price: initialData.price || '',
                stock: initialData.stock || '',
                categoryName: initialData.categoryName || '',
                imagenes: initialData.imagenes || '',
                estado: initialData.estado || ESTADOS_PRODUCTO[0]
            };
        }
        return EMPTY_FORM_STATE;
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                const fetchedCategories = await getAllCategories("PRODUCTO");
                setCategories(fetchedCategories);
            } catch (error) {
                console.error("Error al cargar categorías para el formulario:", error);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []); // Carga categorías solo una vez

    // Efecto para actualizar el formulario SOLO si la prop initialData cambia REALMENTE
    // y es diferente de lo que ya tenemos.
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            // Comparamos para evitar actualizaciones innecesarias si initialData es el mismo objeto
            // o si los valores relevantes no han cambiado. Para una comparación más robusta
            // se podría serializar o usar una librería de deep-compare.
            // Por ahora, una simple comparación de 'name' puede ayudar si es el campo clave.
            // O mejor, actualizamos siempre que initialData cambie su referencia y no sea null/undefined.
            setProductData({
                name: initialData.name || '',
                description: initialData.description || '',
                price: initialData.price || '',
                stock: initialData.stock || '',
                categoryName: initialData.categoryName || '',
                imagenes: initialData.imagenes || '',
                estado: initialData.estado || ESTADOS_PRODUCTO[0]
            });
            setImagePreview(initialData.imagenes ? `http://localhost:8080${initialData.imagenes}` : '');
            setImageFile(null); // Siempre resetea el archivo al cambiar initialData
        } else if (initialData === null || (initialData && Object.keys(initialData).length === 0) ) {
            // Si initialData se vuelve null o un objeto vacío (ej. después de un reset desde el padre)
            setProductData(EMPTY_FORM_STATE);
            setImagePreview('');
            setImageFile(null);
        }
        // Si initialData es undefined (modo creación desde el inicio), el useState inicial ya lo manejó.
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreview(productData.imagenes ? `http://localhost:8080${productData.imagenes}` : '');
        }
    };

    const handleSubmit = (e) => {
        // ... (la lógica de handleSubmit se mantiene igual que en la respuesta anterior)
        e.preventDefault();
        const formData = new FormData();
        const productJsonData = {
            name: productData.name,
            description: productData.description,
            price: parseFloat(productData.price) || 0,
            stock: parseInt(productData.stock, 10) || 0,
            categoryName: productData.categoryName,
            estado: productData.estado,
            imagenes: imageFile ? null : (productData.imagenes ? productData.imagenes.substring(productData.imagenes.lastIndexOf('/') + 1) : null)
        };
        formData.append('product', new Blob([JSON.stringify(productJsonData)], { type: "application/json" }));
        if (imageFile) {
            formData.append('imageFile', imageFile);
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="product-form">
            {/* Nombre */}
            <div className="form-group">
                <label htmlFor="name">Nombre del Producto</label>
                <input type="text" id="name" name="name" value={productData.name} onChange={handleChange} required disabled={isSubmitting} />
            </div>
            {/* Descripción */}
            <div className="form-group">
                <label htmlFor="description">Descripción</label>
                <textarea id="description" name="description" value={productData.description} onChange={handleChange} disabled={isSubmitting}></textarea>
            </div>
            {/* Precio */}
            <div className="form-group">
                <label htmlFor="price">Precio</label>
                <input type="number" id="price" name="price" value={productData.price} onChange={handleChange} required step="0.01" disabled={isSubmitting} />
            </div>
            {/* Stock */}
            <div className="form-group">
                <label htmlFor="stock">Stock</label>
                <input type="number" id="stock" name="stock" value={productData.stock} onChange={handleChange} required disabled={isSubmitting} />
            </div>
            {/* Categoría */}
            <div className="form-group">
                <label htmlFor="categoryName">Categoría</label>
                <select id="categoryName" name="categoryName" value={productData.categoryName} onChange={handleChange} required disabled={isSubmitting || loadingCategories}>
                    <option value="">{loadingCategories ? "Cargando categorías..." : "Seleccione una categoría"}</option>
                    {categories.map(cat => (<option key={cat.id} value={cat.nombre}>{cat.nombre}</option>))}
                </select>
            </div>
            {/* Estado */}
            <div className="form-group">
                <label htmlFor="estado">Estado del Producto</label>
                <select id="estado" name="estado" value={productData.estado} onChange={handleChange} required disabled={isSubmitting}>
                    {ESTADOS_PRODUCTO.map(estadoVal => (
                        <option key={estadoVal} value={estadoVal}>{estadoVal.charAt(0).toUpperCase() + estadoVal.slice(1).toLowerCase()}</option>
                    ))}
                </select>
            </div>
            {/* Imagen */}
            <div className="form-group">
                <label htmlFor="imageFileToUpload">Imagen del Producto {initialData && initialData.imagenes ? "(Reemplazar existente)" : "(Opcional)"}</label>
                <input type="file" id="imageFileToUpload" name="imageFileToUpload" onChange={handleImageChange} accept="image/png, image/jpeg, image/gif" disabled={isSubmitting} />
                {imagePreview && (
                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                        <p>Previsualización:</p>
                        <img src={imagePreview} alt="Previsualización" style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ddd' }} />
                    </div>
                )}
            </div>
            {/* Botón de Envío */}
            <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : submitButtonText}
            </button>
        </form>
    );
};

export default ProductForm;