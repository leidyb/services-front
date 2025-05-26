import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import { toast } from 'react-toastify';
import '../components/product/ProductForm.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        correo: '',
        username: '',
        password: '',
        telefono: '',
        ubicacion: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {

            const responseData = await register(formData); 
            toast.success(responseData.message || "¡Usuario registrado exitosamente! Ahora puedes iniciar sesión.");


            setFormData({
                nombre: '', apellido: '', correo: '',
                username: '', password: '', telefono: '', ubicacion: ''
            });

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            toast.error(err.message || 'Error al registrar. Intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="product-form-container" style={{maxWidth: '500px', margin: '40px auto'}}>
            <h1>Registrar Nuevo Usuario</h1>
            <form onSubmit={handleSubmit} className="product-form">
                <div className="form-group">
                    <label htmlFor="nombre">Nombre</label>
                    <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required disabled={isSubmitting} />
                </div>
                <div className="form-group">
                    <label htmlFor="apellido">Apellido</label>
                    <input type="text" id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} required disabled={isSubmitting} />
                </div>
                <div className="form-group">
                    <label htmlFor="correo">Correo Electrónico</label>
                    <input type="email" id="correo" name="correo" value={formData.correo} onChange={handleChange} required disabled={isSubmitting} />
                </div>
                {/* NUEVOS CAMPOS EN EL FORMULARIO */}
                <div className="form-group">
                    <label htmlFor="telefono">Teléfono (Opcional)</label>
                    <input type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} disabled={isSubmitting} />
                </div>
                <div className="form-group">
                    <label htmlFor="ubicacion">Ubicación (Opcional)</label>
                    <input type="text" id="ubicacion" name="ubicacion" value={formData.ubicacion} onChange={handleChange} disabled={isSubmitting} />
                </div>
                {/* FIN NUEVOS CAMPOS */}
                <div className="form-group">
                    <label htmlFor="username">Nombre de Usuario</label>
                    <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required disabled={isSubmitting} />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Contraseña</label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" disabled={isSubmitting} />
                </div>
                <button type="submit" className="submit-button" disabled={isSubmitting}>
                    {isSubmitting ? 'Registrando...' : 'Registrar'}
                </button>
            </form>
        </div>
    );
};

export default RegisterPage;