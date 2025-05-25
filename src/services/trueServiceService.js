// Ruta: src/services/trueServiceService.js

const API_BASE_URL = 'http://localhost:8080/api/v1'; 

const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

// Helper para construir headers
// isFormData = true si el body es FormData (el navegador pone el Content-Type)
// isFormData = false si el body es JSON (necesitamos Content-Type: application/json)
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

export const getAllServices = async (searchTerm = '', page = 0, size = 9) => {
    try {
        const params = new URLSearchParams();
        if (searchTerm && searchTerm.trim() !== '') {
            params.append('search', searchTerm);
        }
        params.append('page', page);
        params.append('size', size);

        const url = `${API_BASE_URL}/services?${params.toString()}`;
        const response = await fetch(url); 
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => `Error HTTP ${response.status}`);
            throw new Error(errorText || `Error HTTP: ${response.status} al obtener servicios`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error en trueServiceService.getAllServices:", error);
        throw error;
    }
};

export const getServiceById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/services/${id}`);
        if (!response.ok) {
            const errorText = await response.text().catch(() => `Error HTTP ${response.status}`);
            throw new Error(errorText || `Error HTTP: ${response.status} al obtener el servicio`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error en trueServiceService.getServiceById (id: ${id}):`, error);
        throw error;
    }
};

/**
 * Crea un nuevo servicio. Ahora envía FormData.
 * @param {FormData} formData - Objeto FormData que contiene 'service' (JSON string como Blob) y 'imageFile' (File).
 */
export const createService = async (formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/services`, {
            method: 'POST',
            headers: buildAuthHeaders(true), // true para FormData
            body: formData 
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: `Error HTTP ${response.status} creando servicio` }));
            const error = new Error(errorBody.message || errorBody.error || JSON.stringify(errorBody.errors) || `Error HTTP: ${response.status}`);
            error.status = response.status;
            throw error;
        }
        return await response.json();
    } catch (error) {
        console.error("Error en trueServiceService.createService:", error);
        throw error;
    }
};

/**
 * Actualiza un servicio existente. Ahora envía FormData.
 * @param {number} id - ID del servicio a actualizar.
 * @param {FormData} formData - Objeto FormData.
 */
export const updateService = async (id, formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/services/${id}`, {
            method: 'PUT',
            headers: buildAuthHeaders(true), // true para FormData
            body: formData
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: `Error HTTP ${response.status} actualizando servicio` }));
            const error = new Error(errorBody.message || errorBody.error || JSON.stringify(errorBody.errors) || `Error HTTP: ${response.status}`);
            error.status = response.status;
            throw error;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error en trueServiceService.updateService (id: ${id}):`, error);
        throw error;
    }
};

export const deleteService = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/services/${id}`, {
            method: 'DELETE',
            headers: buildAuthHeaders(true) // Solo Auth header
        });
        if (!response.ok) { 
            const errorText = await response.text().catch(() => `Error HTTP ${response.status} eliminando servicio`);
            let parsedError = { message: errorText };
            try { parsedError = JSON.parse(errorText); } catch(e) { /* No era JSON */ }
            const error = new Error(parsedError.message || parsedError.error || errorText || `Error HTTP: ${response.status}`);
            error.status = response.status;
            throw error;
        }
    } catch (error) {
        console.error(`Error en trueServiceService.deleteService (id: ${id}):`, error);
        throw error;
    }
};