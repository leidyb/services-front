


const RENDER_BACKEND_URL = process.env.VITE_API_BASE_URL;
const API_BASE_URL = RENDER_BACKEND_URL || 'http://localhost:8080/api/v1'; 
 



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
        const response = await fetch(`${API_BASE_URL}/services/${id}`);
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

        const headers = buildAuthHeaders(true);
        delete headers['Content-Type'];

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