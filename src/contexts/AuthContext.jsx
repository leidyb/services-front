
import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [user, setUser] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    useEffect(() => {
        setIsLoadingAuth(true);
        const storedToken = localStorage.getItem('authToken');

        if (storedToken) {
            try {
                const decodedToken = jwtDecode(storedToken);
                const currentTime = Date.now() / 1000;

                if (decodedToken.exp < currentTime) {

                    console.warn("Token JWT expirado al cargar.");
                    localStorage.removeItem('authToken');
                    setToken(null);
                    setUser(null);
                } else {

                    setToken(storedToken);
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

            setToken(null);
            setUser(null);
        }
        setIsLoadingAuth(false);
    }, []);

    const login = (authData) => {
        localStorage.setItem('authToken', authData.accessToken);
        setToken(authData.accessToken);


        try {
            const decodedToken = jwtDecode(authData.accessToken);
            const username = decodedToken.sub;
            const rolesString = decodedToken.roles || "";
            const rolesArray = rolesString.split(',').map(role => role.trim()).filter(role => role.length > 0);
            setUser({ username: username, roles: rolesArray });
        } catch (error) {
            console.error("Error decodificando token en login:", error);

            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);


    };

    const value = {
        token,
        user,
        isAuthenticated: !!user,
        isLoadingAuth,
        login,
        logout
    };









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