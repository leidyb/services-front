// Ruta: src/services/categoryService.js

// Asumimos que tienes una forma de obtener el token.
// Podrías importar una función de authService.js o leer directamente de localStorage.
// Por simplicidad, leeremos directamente de localStorage aquí.
// import { getAuthToken } from './authService'; // Si tuvieras getAuthToken en authService.js

const API_CATEGORIES_URL = 'http://localhost:8080/api/v1/categories';

// Función para construir headers, incluyendo el de autorización si hay token
// Es buena idea centralizar esta lógica si la usas en múltiples servicios.
const buildCategoryAuthHeaders = (includeContentType = true) => {
    const headers = {};
    if (includeContentType) {
        headers['Content-Type'] = 'application/json';
    }
    const token = localStorage.getItem('authToken'); // Leer directamente el token
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
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
            // Asegúrate de que el backend espera el valor del enum tal cual (PRODUCTO, SERVICIO)
            url += `?tipo=${tipo}`;
        }
        // El GET para categorías lo definimos como público en el backend
        const response = await fetch(url);
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
        // Este endpoint también es público según la configuración del backend
        const response = await fetch(`${API_CATEGORIES_URL}/${id}`);
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
            headers: buildCategoryAuthHeaders(), // Necesita token
            body: JSON.stringify(categoryData)
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: `Error HTTP ${response.status} creando categoría` }));
            throw new Error(errorBody.message || errorBody.error || `Error HTTP: ${response.status}`);
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
 * @param {object} categoryData - { nombre, tipo } (y cualquier otro campo actualizable)
 * @returns {Promise<object>} La categoría actualizada.
 */
export const updateCategory = async (id, categoryData) => {
    try {
        const response = await fetch(`${API_CATEGORIES_URL}/${id}`, {
            method: 'PUT',
            headers: buildCategoryAuthHeaders(), // Necesita token
            body: JSON.stringify(categoryData)
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: `Error HTTP ${response.status} actualizando categoría` }));
            throw new Error(errorBody.message || errorBody.error || `Error HTTP: ${response.status}`);
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
        const response = await fetch(`${API_CATEGORIES_URL}/${id}`, {
            method: 'DELETE',
            headers: buildCategoryAuthHeaders(false) // No necesita Content-Type para DELETE sin body, pero sí Auth
        });
        if (!response.ok) { // Un DELETE exitoso podría devolver 204 No Content, que es 'ok'
            // Si hay un error, intentar leer el cuerpo, que podría ser texto o JSON
            const errorText = await response.text().catch(() => `Error HTTP ${response.status} eliminando categoría`);
            let parsedError = { message: errorText };
            try {
                parsedError = JSON.parse(errorText);
            } catch(e) {
                // No era JSON, nos quedamos con el texto
            }
            throw new Error(parsedError.message || parsedError.error || errorText || `Error HTTP: ${response.status}`);
        }
        // No se espera cuerpo JSON en un DELETE exitoso (204)
    } catch (error) {
        console.error(`Error en categoryService.deleteCategory (id: ${id}):`, error);
        throw error;
    }
};