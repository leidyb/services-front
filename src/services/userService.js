




const BACKEND_API_ROOT_URL = process.env.VITE_API_BASE_URL_ROOT || 'http://localhost:8080';


const API_USERS_URL = `${BACKEND_API_ROOT_URL}/api/v1/users`; 

/**
 * Obtiene el perfil público de un vendedor, incluyendo su calificación promedio.
 * @param {string} username - El nombre de usuario del vendedor.
 * @returns {Promise<object>} - El SellerProfileDTO con los datos.
 */
export const getSellerProfile = async (username) => {
    try {
        const url = `${API_USERS_URL}/${username}/profile`;


        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text().catch(() => `Error HTTP ${response.status}`);
            const error = new Error(errorText || `Error HTTP: ${response.status} al obtener el perfil del vendedor`);
            error.status = response.status;
            throw error;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error en userService.getSellerProfile (username: ${username}):`, error);
        throw error;
    }
};

