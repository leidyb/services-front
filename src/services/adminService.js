// Ruta: src/services/adminService.js

const API_ADMIN_URL = 'http://localhost:8080/api/admin';

const getAuthToken = () => localStorage.getItem('authToken');

const buildAuthHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const getAllUsersAdmin = async () => {
    try {
        const response = await fetch(`${API_ADMIN_URL}/users`, {
            method: 'GET',
            headers: buildAuthHeaders(),
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('No autorizado para ver usuarios.');
            }
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error al obtener todos los usuarios (admin):", error);
        throw error;
    }
};

export const updateUserRolesAdmin = async (username, rolesData) => {
    try {
        const response = await fetch(`<span class="math-inline">\{API\_ADMIN\_URL\}/users/</span>{username}/roles`, {
            method: 'POST',
            headers: buildAuthHeaders(),
            body: JSON.stringify(rolesData), // { "roles": ["ROLE_USER", "ROLE_X"] }
        });
        if (!response.ok) {
             if (response.status === 400 || response.status === 401 || response.status === 403) {
                const errorData = await response.json().catch(() => ({message: `Error HTTP ${response.status}`}));
                throw new Error(errorData.message || JSON.stringify(errorData.errors || errorData) || `Error HTTP ${response.status}`);
            }
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error al actualizar roles para ${username}:`, error);
        throw error;
    }
};