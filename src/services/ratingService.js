// Ruta: src/services/ratingService.js

// Lee la variable de entorno VITE_API_BASE_URL_ROOT que configurarás en Render
// o usa http://localhost:8080 como fallback para desarrollo local.
// Esta debe apuntar a la raíz de tu backend, ej: http://localhost:8080 o https://tu-api.onrender.com
const BACKEND_API_ROOT_URL = process.env.VITE_API_BASE_URL_ROOT || 'http://localhost:8080';

// Construye la URL completa para los endpoints de calificaciones
const API_RATINGS_URL = `${BACKEND_API_ROOT_URL}/api/v1/ratings`; 

// Helper para obtener el token JWT de localStorage
const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

// Helper para construir los headers de autenticación
// isFormData = false para JSON, true para FormData (no usado aquí por ahora para ratings)
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
 * Crea una nueva calificación.
 * @param {object} ratingData - { score, comment, productId?, serviceId? }
 * @returns {Promise<object>} La calificación creada.
 */
export const createRating = async (ratingData) => {
    try {
        const response = await fetch(API_RATINGS_URL, { // Usa la URL base de ratings
            method: 'POST',
            headers: buildAuthHeaders(), // Necesita token y Content-Type: application/json
            body: JSON.stringify(ratingData)
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: `Error HTTP ${response.status} creando calificación` }));
            const error = new Error(errorBody.message || errorBody.error || JSON.stringify(errorBody.errors) || `Error HTTP: ${response.status}`);
            error.status = response.status;
            throw error;
        }
        return await response.json();
    } catch (error) {
        console.error("Error en ratingService.createRating:", error);
        throw error;
    }
};

/**
 * Obtiene calificaciones paginadas para un producto específico.
 * @param {number} productId - ID del producto.
 * @param {number} [page=0] - Página.
 * @param {number} [size=5] - Tamaño de página.
 * @returns {Promise<object>} Objeto Page con las calificaciones.
 */
export const getRatingsForProduct = async (productId, page = 0, size = 5) => {
    try {
        const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
        const url = `${API_RATINGS_URL}/product/${productId}?${params.toString()}`;
        // console.log("URL para getRatingsForProduct:", url); // Descomentar para depurar

        const response = await fetch(url); // Este endpoint es público
        if (!response.ok) {
            const errorText = await response.text().catch(() => `Error HTTP ${response.status}`);
            throw new Error(errorText || `Error HTTP: ${response.status} al obtener calificaciones del producto`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error en ratingService.getRatingsForProduct (productId: ${productId}):`, error);
        throw error;
    }
};

/**
 * Obtiene calificaciones paginadas para un servicio específico.
 * @param {number} serviceId - ID del servicio.
 * @param {number} [page=0] - Página.
 * @param {number} [size=5] - Tamaño de página.
 * @returns {Promise<object>} Objeto Page con las calificaciones.
 */
export const getRatingsForService = async (serviceId, page = 0, size = 5) => {
    try {
        const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
        const url = `${API_RATINGS_URL}/service/${serviceId}?${params.toString()}`;
        // console.log("URL para getRatingsForService:", url); // Descomentar para depurar

        const response = await fetch(url); // Este endpoint es público
        if (!response.ok) {
            const errorText = await response.text().catch(() => `Error HTTP ${response.status}`);
            throw new Error(errorText || `Error HTTP: ${response.status} al obtener calificaciones del servicio`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error en ratingService.getRatingsForService (serviceId: ${serviceId}):`, error);
        throw error;
    }
};
    
/**
 * Elimina una calificación por su ID (requiere ser el rater o ADMIN).
 * @param {number} ratingId - ID de la calificación a eliminar.
 * @returns {Promise<void>}
 */
export const deleteRating = async (ratingId) => {
    try {
        const headers = buildAuthHeaders(true); // Solo Auth header
        delete headers['Content-Type']; // DELETE no necesita Content-Type si no hay body

        const response = await fetch(`${API_RATINGS_URL}/${ratingId}`, {
            method: 'DELETE',
            headers: headers
        });
        if (!response.ok) {
            const errorText = await response.text().catch(() => `Error HTTP ${response.status} eliminando calificación`);
            let parsedError = { message: errorText };
            try { parsedError = JSON.parse(errorText); } catch(e) { /* No era JSON */ }
            const error = new Error(parsedError.message || parsedError.error || errorText || `Error HTTP: ${response.status}`);
            error.status = response.status;
            throw error;
        }
    } catch (error) {
        console.error(`Error en ratingService.deleteRating (ratingId: ${ratingId}):`, error);
        throw error;
    }
};