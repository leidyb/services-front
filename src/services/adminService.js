// Ruta: src/services/adminService.js

// Lee la variable de entorno VITE_API_BASE_URL que configurarás en Render.
// Si no está definida (ej. en desarrollo local), usa http://localhost:8080/api/v1 como fallback.
// Nota: El endpoint de admin es /api/admin, no /api/v1/admin, así que construimos desde la base.
const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL_ROOT || 'http://localhost:8080'; // URL base sin /api/v1

const API_ADMIN_URL = `${BACKEND_BASE_URL}/api/admin`; // Construye la URL completa para admin

// Helper para obtener el token JWT de localStorage
const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

// Helper para construir los headers de autenticación
// isFormData = false para JSON, true para FormData (no usado aquí por ahora)
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
        const response = await fetch(`${API_ADMIN_URL}/users`, { // Llama a /api/admin/users
            method: 'GET',
            headers: buildAuthHeaders(), // Necesita token de ADMIN
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
        // ##### LÍNEA CORREGIDA #####
        const url = `${API_ADMIN_URL}/users/${username}/roles`; // Llama a /api/admin/users/{username}/roles
        // console.log("URL para updateUserRolesAdmin:", url); // Descomentar para depurar

        const response = await fetch(url, {
            method: 'POST', // O 'PUT' si así lo definiste en el backend, pero POST es común para esta acción
            headers: buildAuthHeaders(), // Necesita token de ADMIN
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