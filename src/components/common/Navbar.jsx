import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { isAuthenticated, user, logout: contextLogout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        contextLogout();
        navigate('/login');
    };



    const isAdmin = isAuthenticated && user?.roles?.includes('ROLE_ADMIN');

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">Mi Tienda</Link>
            <ul className="navbar-links">
                <li><Link to="/">Catálogo Productos</Link></li>
                <li><Link to="/servicios">Catálogo Servicios</Link></li>
                {isAuthenticated && (
                    <>
                        <li><Link to="/crear-producto">Añadir Producto</Link></li>
                        <li><Link to="/crear-servicio">Añadir Servicio</Link></li>
                    </>
                )}

                {isAdmin && (
                    <>
                        <li><Link to="/admin/usuarios">Gestión Usuarios</Link></li>
                        <li><Link to="/admin/categorias">Gestión Categorías</Link></li> {/* <-- ENLACE AÑADIDO AQUÍ */}
                    </>
                )}
            </ul>
            <ul className="navbar-links navbar-auth-links"> {/* Esta segunda lista es para alinear a la derecha */}
                {isAuthenticated ? (
                    <>
                        {user && <li className="navbar-username">Hola, {user.username} ({user.roles?.join(', ')})</li>}
                        <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/registro">Registrarse</Link></li>
                        <li><Link to="/login">Login</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;