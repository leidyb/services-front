// Ruta: src/services/serviceService.js

// Asegúrate de que la URL base sea la correcta para tu backend
const RENDER_BACKEND_URL = process.env.VITE_API_BASE_URL; // ej: https://tu-backend.onrender.com
const API_BASE_URL = RENDER_BACKEND_URL || 'http://localhost:8080/api/v1'; 
 

// Helper para obtener el token JWT de localStorage
// Podrías mover esta función y buildAuthHeaders a un archivo utils/apiHelper.js si se repite mucho
const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

// Helper para construir los headers de autenticación
// El parámetro isFormData indica si debemos omitir el 'Content-Type' (el navegador lo pone para FormData)
const buildAuthHeaders = (isFormData = false) => {
    const headers = {};
    const token = getAuthToken();

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    // Para FormData, el navegador establece Content-Type automáticamente con el boundary correcto.
    return headers;
};

/**
 * Obtiene servicios de la API, con búsqueda y paginación.
 * @param {string} [searchTerm=''] - Término de búsqueda opcional.
 * @param {number} [page=0] - Número de página (0-indexed).
 * @param {number} [size=9] - Tamaño de la página (puedes ajustarlo).
 * @returns {Promise<object>} - Una promesa que resuelve al objeto Page del backend.
 */
export const getAllServices = async (searchTerm = '', page = 0, size = 9) => {
    try {
        const params = new URLSearchParams();
        if (searchTerm && searchTerm.trim() !== '') {
            params.append('search', searchTerm);
        }
        params.append('page', page);
        params.append('size', size);

        const url = `${API_BASE_URL}/services?${params.toString()}`;
        // Asumimos que GET /services es público según la configuración de SecurityConfig
        const response = await fetch(url); 
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => `Error HTTP ${response.status}`);
            throw new Error(errorText || `Error HTTP: ${response.status} al obtener servicios`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error en serviceService.getAllServices:", error);
        throw error;
    }
};

/**
 * Obtiene un solo servicio por su ID.
 * @param {number} id - El ID del servicio a obtener.
 * @returns {Promise<object>} El objeto ServiceDTO.
 */
export const getServiceById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/services/${id}`); // Asumimos GET público
        if (!response.ok) {
            const errorText = await response.text().catch(() => `Error HTTP ${response.status}`);
            throw new Error(errorText || `Error HTTP: ${response.status} al obtener el servicio`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error en serviceService.getServiceById (id: ${id}):`, error);
        throw error;
    }
};

/**
 * Crea un nuevo servicio (requiere autenticación).
 * IMPORTANTE: Este ejemplo asume que serviceData es un objeto JSON.
 * Si necesitas subir archivos para servicios, deberás pasar FormData y ajustar los headers.
 * @param {object} serviceData - Datos del servicio a crear.
 * @returns {Promise<object>} El servicio creado.
 */
export const createService = async (serviceData) => {
    // Si serviceData es un objeto FormData (porque incluye un archivo de imagen):
    // const isFormData = serviceData instanceof FormData;
    // const headers = buildAuthHeaders(isFormData);
    // const body = isFormData ? serviceData : JSON.stringify(serviceData);
    // const fetchOptions = { method: 'POST', headers, body };

    // Asumimos JSON por ahora
    const isFormData = false; 
    const headers = buildAuthHeaders(isFormData);
    const body = JSON.stringify(serviceData);
    const fetchOptions = { method: 'POST', headers, body };

    try {
        const response = await fetch(`${API_BASE_URL}/services`, fetchOptions);
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: `Error HTTP ${response.status} creando servicio` }));
            const error = new Error(errorBody.message || errorBody.error || JSON.stringify(errorBody.errors) || `Error HTTP: ${response.status}`);
            error.status = response.status;
            throw error;
        }
        return await response.json();
    } catch (error) {
        console.error("Error en serviceService.createService:", error);
        throw error;
    }
};

/**
 * Actualiza un servicio existente (requiere autenticación).
 * IMPORTANTE: Este ejemplo asume que serviceData es un objeto JSON.
 * Si necesitas subir archivos para servicios, deberás pasar FormData y ajustar los headers.
 * @param {number} id - ID del servicio a actualizar.
 * @param {object} serviceData - Nuevos datos del servicio.
 * @returns {Promise<object>} El servicio actualizado.
 */
export const updateService = async (id, serviceData) => {
    // Asumimos JSON por ahora
    const isFormData = false;
    const headers = buildAuthHeaders(isFormData);
    const body = JSON.stringify(serviceData);
    const fetchOptions = { method: 'PUT', headers, body };

    try {
        const response = await fetch(`${API_BASE_URL}/services/${id}`, fetchOptions);
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: `Error HTTP ${response.status} actualizando servicio` }));
            const error = new Error(errorBody.message || errorBody.error || JSON.stringify(errorBody.errors) || `Error HTTP: ${response.status}`);
            error.status = response.status;
            throw error;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error en serviceService.updateService (id: ${id}):`, error);
        throw error;
    }
};

/**
 * Elimina un servicio (requiere autenticación y rol apropiado).
 * @param {number} id - ID del servicio a eliminar.
 * @returns {Promise<void>}
 */
export const deleteService = async (id) => {
    try {
        // Para DELETE, no enviamos Content-Type si no hay body.
        const headers = buildAuthHeaders(true); // Pasamos true para que NO ponga Content-Type JSON
        delete headers['Content-Type']; // O nos aseguramos que se quite si buildAuthHeaders lo añade por defecto

        const response = await fetch(`${API_BASE_URL}/services/${id}`, {
            method: 'DELETE',
            headers: headers 
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
        console.error(`Error en serviceService.deleteService (id: ${id}):`, error);
        throw error;
    }
};