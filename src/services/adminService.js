




const BACKEND_BASE_URL = process.env.VITE_API_BASE_URL_ROOT || 'http://localhost:8080';

const API_ADMIN_URL = `${BACKEND_BASE_URL}/api/admin`;


const getAuthToken = () => {
    return localStorage.getItem('authToken');
};



const buildAuthHeaders = (isFormData = false) => {
    const headers = {};
    const token = getAuthToken();

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
};

/**
 * Obtiene todos los usuarios (protegido por ADMIN).
 * @returns {Promise<Array>} Lista de UserResponseDTO.
 */
export const getAllUsersAdmin = async () => {
    try {
        const response = await fetch(`${API_ADMIN_URL}/users`, {
            method: 'GET',
            headers: buildAuthHeaders(),
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: `Error HTTP ${response.status}` }));
            const error = new Error(errorBody.message || errorBody.error || `Error HTTP: ${response.status}`);
            error.status = response.status;
            throw error;
        }
        return await response.json();
    } catch (error) {
        console.error("Error en adminService.getAllUsersAdmin:", error);
        throw error;
    }
};

/**
 * Actualiza los roles de un usuario específico (protegido por ADMIN).
 * @param {string} username - El username del usuario a modificar.
 * @param {object} rolesData - Objeto como { "roles": ["ROLE_USER", "ROLE_X"] }.
 * @returns {Promise<object>} La respuesta del backend.
 */
export const updateUserRolesAdmin = async (username, rolesData) => {
    try {

        const url = `${API_ADMIN_URL}/users/${username}/roles`;


        const response = await fetch(url, {
            method: 'POST',
            headers: buildAuthHeaders(),
            body: JSON.stringify(rolesData),
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: `Error HTTP ${response.status}` }));
            const error = new Error(errorBody.message || errorBody.error || JSON.stringify(errorBody.errors) || `Error HTTP: ${response.status}`);
            error.status = response.status;
            throw error;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error en adminService.updateUserRolesAdmin para ${username}:`, error);
        throw error;
    }
};