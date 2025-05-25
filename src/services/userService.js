// Ruta: src/services/userService.js

// Lee la variable de entorno VITE_API_BASE_URL_ROOT que configurarás en Render
// o usa http://localhost:8080 como fallback para desarrollo local.
// Esta debe apuntar a la raíz de tu backend, ej: http://localhost:8080 o https://tu-api.onrender.com
const BACKEND_API_ROOT_URL = import.meta.env.VITE_API_BASE_URL_ROOT || 'http://localhost:8080';

// Construye la URL completa para los endpoints de usuarios públicos (perfiles)
const API_USERS_URL = `${BACKEND_API_ROOT_URL}/api/v1/users`; 

/**
 * Obtiene el perfil público de un vendedor, incluyendo su calificación promedio.
 * @param {string} username - El nombre de usuario del vendedor.
 * @returns {Promise<object>} - El SellerProfileDTO con los datos.
 */
export const getSellerProfile = async (username) => {
    try {
        const url = `${API_USERS_URL}/${username}/profile`; // Endpoint público
        // console.log("URL para getSellerProfile:", url); // Descomentar para depurar

        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text().catch(() => `Error HTTP ${response.status}`);
            const error = new Error(errorText || `Error HTTP: ${response.status} al obtener el perfil del vendedor`);
            error.status = response.status; // Adjuntar status para manejo en el componente si es necesario
            throw error;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error en userService.getSellerProfile (username: ${username}):`, error);
        throw error;
    }
};

