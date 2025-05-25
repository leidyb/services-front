// Ruta: src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => { 
    const { isAuthenticated, user, isLoadingAuth } = useAuth(); // Obtenemos isLoadingAuth

    if (isLoadingAuth) {
        // Muestra un loader o nada mientras se verifica la autenticación inicial
        return <div>Verificando autenticación...</div>; 
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const hasRequiredRole = user?.roles?.some(role => allowedRoles.includes(role));
        if (!hasRequiredRole) {
            console.warn("Acceso denegado por rol a ruta protegida.");
            return <Navigate to="/" replace />; 
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;