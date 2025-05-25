// Ruta: src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [user, setUser] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Nuevo estado para carga inicial

    useEffect(() => {
        setIsLoadingAuth(true);
        const storedToken = localStorage.getItem('authToken'); // Leer de nuevo por si acaso

        if (storedToken) {
            try {
                const decodedToken = jwtDecode(storedToken);
                const currentTime = Date.now() / 1000; // jwtDecode.exp está en segundos

                if (decodedToken.exp < currentTime) {
                    // Token expirado
                    console.warn("Token JWT expirado al cargar.");
                    localStorage.removeItem('authToken');
                    setToken(null);
                    setUser(null);
                } else {
                    // Token válido y no expirado
                    setToken(storedToken); // Asegurar que el estado token esté sincronizado
                    const username = decodedToken.sub;
                    const rolesString = decodedToken.roles || "";
                    const rolesArray = rolesString.split(',').map(role => role.trim()).filter(role => role.length > 0);
                    setUser({ username: username, roles: rolesArray });
                }
            } catch (error) {
                console.error("Token JWT inválido al cargar:", error);
                localStorage.removeItem('authToken');
                setToken(null);
                setUser(null);
            }
        } else {
            // No hay token almacenado
            setToken(null);
            setUser(null);
        }
        setIsLoadingAuth(false); // Terminar carga inicial
    }, []); // SOLO SE EJECUTA UNA VEZ AL MONTAR EL AuthProvider

    const login = (authData) => { // authData es el objeto { accessToken: "...", ... }
        localStorage.setItem('authToken', authData.accessToken);
        setToken(authData.accessToken); // Esto NO disparará el useEffect de arriba
                                      // porque el useEffect solo corre al montar.
                                      // Necesitamos decodificar y setear el usuario aquí también.
        try {
            const decodedToken = jwtDecode(authData.accessToken);
            const username = decodedToken.sub;
            const rolesString = decodedToken.roles || "";
            const rolesArray = rolesString.split(',').map(role => role.trim()).filter(role => role.length > 0);
            setUser({ username: username, roles: rolesArray });
        } catch (error) {
            console.error("Error decodificando token en login:", error);
            // El token podría ser inválido incluso si el backend lo envió. Limpiar.
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        // Considera redirigir a /login aquí si es necesario.
        // Si la Navbar usa useNavigate, puede hacerlo desde allí.
    };

    const value = {
        token,
        user,
        isAuthenticated: !!user,
        isLoadingAuth, // Exponer el estado de carga
        login,
        logout
    };

    // No renderizar children hasta que la autenticación inicial haya sido verificada
    // if (isLoadingAuth) {
    //     return <div>Verificando sesión...</div>; // O un spinner global
    // }
    // Sin embargo, lo anterior podría causar problemas si App.jsx depende de rutas
    // que necesitan el contexto inmediatamente. Es mejor que los componentes que dependen
    // del usuario usen 'isLoadingAuth' para mostrar un estado de carga si es necesario.

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};