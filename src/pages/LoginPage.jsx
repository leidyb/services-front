import React, { useState } from 'react';
import { login as apiLogin } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../components/product/ProductForm.css'; 

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login: contextLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const responseData = await apiLogin({ username, password });
            contextLogin(responseData); 
            // El toast de bienvenida ahora se puede poner aquí, ya que el AuthContext ya actualizó el user
            // const decodedUser = jwtDecode(responseData.accessToken); // Si necesitas el nombre directamente
            toast.success(`¡Bienvenido de nuevo, ${username}!`); 
            navigate('/'); 
        } catch (err) {
            toast.error(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="product-form-container" style={{maxWidth: '500px', margin: '40px auto'}}>
            <h1>Iniciar Sesión</h1>
            <form onSubmit={handleSubmit} className="product-form">
                <div className="form-group">
                    <label htmlFor="username">Nombre de Usuario</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                </div>
                <button type="submit" className="submit-button" disabled={isSubmitting}>
                    {isSubmitting ? 'Ingresando...' : 'Ingresar'}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;