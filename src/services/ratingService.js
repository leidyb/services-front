// Ruta: src/services/ratingService.js

const API_BASE_URL = 'http://localhost:8080/api/v1/ratings'; // Base URL para ratings

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

export const createRating = async (ratingData) => {
    try {
        const response = await fetch(API_BASE_URL, {
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

export const getRatingsForProduct = async (productId, page = 0, size = 5) => {
    try {
        const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
        // ##### LÍNEA CORREGIDA #####
        const url = `${API_BASE_URL}/product/${productId}?${params.toString()}`;
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

export const getRatingsForService = async (serviceId, page = 0, size = 5) => {
    try {
        const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
        // ##### LÍNEA CORREGIDA #####
        const url = `${API_BASE_URL}/service/${serviceId}?${params.toString()}`;
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
    
export const deleteRating = async (ratingId) => {
    try {
        const headers = buildAuthHeaders(true); 
        delete headers['Content-Type'];

        const response = await fetch(`${API_BASE_URL}/${ratingId}`, {
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