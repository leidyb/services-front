import React, { useState, useEffect } from 'react';
import { getAllCategories } from '../../services/categoryService';
import '../product/ProductForm.css';

const ESTADOS_SERVICIO = ['ACTIVO', 'INACTIVO', 'PENDIENTE', 'CONTRATADO'];

const getInitialFormState = (initialData = null) => {
    if (initialData && Object.keys(initialData).length > 0) {
        return {
            name: initialData.name || '',
            description: initialData.description || '',
            estimatedPrice: initialData.estimatedPrice || '',
            imagenes: initialData.imagenes || '',
            estado: initialData.estado || ESTADOS_SERVICIO[0],
            categoryName: initialData.categoryName || ''
        };
    }
    return {
        name: '', description: '', estimatedPrice: '', imagenes: '',
        estado: ESTADOS_SERVICIO[0], categoryName: ''
    };
};

const ServiceForm = ({
    onSubmit,
    initialData,
    isSubmitting = false,
    submitButtonText = "Guardar Servicio"
}) => {
    const [serviceData, setServiceData] = useState(() => getInitialFormState(initialData));
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        const fetchServiceCategories = async () => {
            try {
                setLoadingCategories(true);
                const fetchedCategories = await getAllCategories("SERVICIO");
                setCategories(fetchedCategories);
            } catch (error) {
                console.error("Error al cargar categorías de servicio:", error);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchServiceCategories();
    }, []);

    useEffect(() => {
        const newFormState = getInitialFormState(initialData);
        setServiceData(newFormState);
        setImagePreview(initialData && initialData.imagenes ? `http://localhost:8080${initialData.imagenes}` : '');
        setImageFile(null);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setServiceData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => { setImagePreview(reader.result); };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreview(initialData && initialData.imagenes ? `http://localhost:8080${initialData.imagenes}` : '');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        const serviceJsonData = {
            name: serviceData.name,
            description: serviceData.description,
            estimatedPrice: parseFloat(serviceData.estimatedPrice) || null,
            estado: serviceData.estado,
            categoryName: serviceData.categoryName,



            imagenes: imageFile ? null : (serviceData.imagenes ? serviceData.imagenes.substring(serviceData.imagenes.lastIndexOf('/') + 1) : null)
        };
        formData.append('service', new Blob([JSON.stringify(serviceJsonData)], { type: "application/json" }));
        if (imageFile) {
            formData.append('imageFile', imageFile);
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
                <label htmlFor="name">Nombre del Servicio</label>
                <input type="text" id="name" name="name" value={serviceData.name} onChange={handleChange} required disabled={isSubmitting} />
            </div>
            <div className="form-group">
                <label htmlFor="description">Descripción</label>
                <textarea id="description" name="description" value={serviceData.description} onChange={handleChange} required disabled={isSubmitting} rows={5}></textarea>
            </div>
            <div className="form-group">
                <label htmlFor="estimatedPrice">Precio Estimado/Tarifa</label>
                <input type="number" id="estimatedPrice" name="estimatedPrice" value={serviceData.estimatedPrice} onChange={handleChange} step="0.01" placeholder="Dejar vacío si es a convenir" disabled={isSubmitting} />
            </div>
            <div className="form-group">
                <label htmlFor="categoryName">Categoría del Servicio</label>
                <select id="categoryName" name="categoryName" value={serviceData.categoryName} onChange={handleChange} required disabled={isSubmitting || loadingCategories}>
                    <option value="">{loadingCategories ? "Cargando..." : "Seleccione"}</option>
                    {categories.map(cat => (<option key={cat.id} value={cat.nombre}>{cat.nombre}</option>))}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="estado">Estado del Servicio</label>
                <select id="estado" name="estado" value={serviceData.estado} onChange={handleChange} required disabled={isSubmitting}>
                    {ESTADOS_SERVICIO.map(val => (<option key={val} value={val}>{val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()}</option>))}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="imageFileToUpload">Imagen del Servicio {initialData && initialData.imagenes ? "(Reemplazar existente)" : "(Opcional)"}</label>
                <input type="file" id="imageFileToUpload" name="imageFileToUpload" onChange={handleImageChange} accept="image/png, image/jpeg, image/gif" disabled={isSubmitting} />
                {imagePreview && (
                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                        <p>Previsualización:</p>
                        <img src={imagePreview} alt="Previsualización" style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ddd' }} />
                    </div>
                )}
            </div>
            <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : submitButtonText}
            </button>
        </form>
    );
};

export default ServiceForm;