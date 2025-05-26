




const BACKEND_API_ROOT_URL = process.env.VITE_API_BASE_URL_ROOT || 'http://localhost:8080';


const API_RATINGS_URL = `${BACKEND_API_ROOT_URL}/api/v1/ratings`; 


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
 * Crea una nueva calificación.
 * @param {object} ratingData - { score, comment, productId?, serviceId? }
 * @returns {Promise<object>} La calificación creada.
 */
export const createRating = async (ratingData) => {
    try {
        const response = await fetch(API_RATINGS_URL, {
            method: 'POST',
            headers: buildAuthHeaders(),
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


        const response = await fetch(url);
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


        const response = await fetch(url);
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
        const headers = buildAuthHeaders(true);
        delete headers['Content-Type'];

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