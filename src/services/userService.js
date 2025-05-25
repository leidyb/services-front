// Ruta: src/services/userService.js

const API_BASE_URL = 'http://localhost:8080/api/v1/users'; // Base para los endpoints de usuario

/**
 * Obtiene el perfil público de un vendedor, incluyendo su calificación promedio.
 * @param {string} username - El nombre de usuario del vendedor.
 * @returns {Promise<object>} - El SellerProfileDTO con los datos.
 */
export const getSellerProfile = async (username) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${username}/profile`); // Endpoint público
        if (!response.ok) {
            const errorText = await response.text().catch(() => `Error HTTP ${response.status}`);
            throw new Error(errorText || `Error HTTP: ${response.status} al obtener el perfil del vendedor`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error en userService.getSellerProfile (username: ${username}):`, error);
        throw error;
    }
};