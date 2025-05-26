// Ruta: src/services/categoryService.js

// Lee la variable de entorno VITE_API_BASE_URL que configurarás en Render.
// Si no está definida (ej. en desarrollo local), usa http://localhost:8080/api/v1 como fallback.
const BACKEND_API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const API_CATEGORIES_URL = `${BACKEND_API_BASE_URL}/categories`; // Construye la URL completa para categorías

// Helper para obtener el token JWT de localStorage
const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

// Helper para construir los headers de autenticación
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
 * Obtiene todas las categorías o filtra por tipo.
 * @param {string} [tipo] - Opcional. "PRODUCTO" o "SERVICIO".
 * @returns {Promise<Array>} Lista de CategoryDTO.
 */
export const getAllCategories = async (tipo) => {
    try {
        let url = API_CATEGORIES_URL;
        if (tipo) {
            url += `?tipo=${tipo}`;
        }
        const response = await fetch(url); // Endpoint público
        if (!response.ok) {
            const errorText = await response.text().catch(() => `Error HTTP ${response.status} al obtener categorías`);
            throw new Error(errorText || `Error HTTP: ${response.status} al obtener categorías`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error en categoryService.getAllCategories:", error);
        throw error;
    }
};

/**
 * Obtiene una categoría por su ID.
 * @param {number} id - El ID de la categoría.
 * @returns {Promise<object>} El objeto CategoryDTO.
 */
export const getCategoryById = async (id) => {
    try {
        const response = await fetch(`${API_CATEGORIES_URL}/${id}`); // Endpoint público
        if (!response.ok) {
            const errorText = await response.text().catch(() => `Error HTTP ${response.status} al obtener la categoría`);
            throw new Error(errorText || `Error HTTP: ${response.status} al obtener la categoría`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error en categoryService.getCategoryById (id: ${id}):`, error);
        throw error;
    }
};

/**
 * Crea una nueva categoría (requiere rol ADMIN).
 * @param {object} categoryData - { nombre, tipo }
 * @returns {Promise<object>} La categoría creada.
 */
export const createCategory = async (categoryData) => {
    try {
        const response = await fetch(API_CATEGORIES_URL, {
            method: 'POST',
            headers: buildAuthHeaders(), // Necesita token
            body: JSON.stringify(categoryData)
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: `Error HTTP ${response.status} creando categoría` }));
            const error = new Error(errorBody.message || errorBody.error || JSON.stringify(errorBody.errors) || `Error HTTP: ${response.status}`);
            error.status = response.status;
            throw error;
        }
        return await response.json();
    } catch (error) {
        console.error("Error en categoryService.createCategory:", error);
        throw error;
    }
};

/**
 * Actualiza una categoría existente (requiere rol ADMIN).
 * @param {number} id - El ID de la categoría a actualizar.
 * @param {object} categoryData - { nombre, tipo }
 * @returns {Promise<object>} La categoría actualizada.
 */
export const updateCategory = async (id, categoryData) => {
    try {
        const response = await fetch(`${API_CATEGORIES_URL}/${id}`, {
            method: 'PUT',
            headers: buildAuthHeaders(), // Necesita token
            body: JSON.stringify(categoryData)
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: `Error HTTP ${response.status} actualizando categoría` }));
            const error = new Error(errorBody.message || errorBody.error || JSON.stringify(errorBody.errors) || `Error HTTP: ${response.status}`);
            error.status = response.status;
            throw error;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error en categoryService.updateCategory (id: ${id}):`, error);
        throw error;
    }
};

/**
 * Elimina una categoría (requiere rol ADMIN).
 * @param {number} id - El ID de la categoría a eliminar.
 * @returns {Promise<void>}
 */
export const deleteCategory = async (id) => {
    try {
        const headers = buildAuthHeaders(true); 
        delete headers['Content-Type']; // Para DELETE sin cuerpo

        const response = await fetch(`${API_CATEGORIES_URL}/${id}`, {
            method: 'DELETE',
            headers: headers
        });
        if (!response.ok) { 
            const errorText = await response.text().catch(() => `Error HTTP ${response.status} eliminando categoría`);
            let parsedError = { message: errorText };
            try { parsedError = JSON.parse(errorText); } catch(e) { /* No era JSON */ }
            const error = new Error(parsedError.message || parsedError.error || errorText || `Error HTTP: ${response.status}`);
            error.status = response.status;
            throw error;
        }
    } catch (error) {
        console.error(`Error en categoryService.deleteCategory (id: ${id}):`, error);
        throw error;
    }
};