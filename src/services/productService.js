// Ruta: src/services/productService.js

const RENDER_BACKEND_URL = process.env.VITE_API_BASE_URL; // ej: https://tu-backend.onrender.com
const API_BASE_URL = RENDER_BACKEND_URL || 'http://localhost:8080/api/v1'; 


const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

// Helper para construir headers para peticiones JSON
const buildAuthHeadersForJson = () => {
    const headers = {
        'Content-Type': 'application/json',
    };
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// Helper para construir headers para peticiones FormData (sin Content-Type explícito)
// El navegador setea el Content-Type automáticamente para FormData, incluyendo el boundary.
const buildAuthHeadersForFormData = () => {
    const headers = {};
    const token = localStorage.getItem('authToken');
    console.log("Token recuperado de localStorage para FormData:", token); // LOG 1
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    console.log("Headers construidos para FormData:", headers); // LOG 2
    return headers;
};

export const getAllProducts = async (searchTerm = '', page = 0, size = 9) => {
    try {
        const params = new URLSearchParams();
        if (searchTerm && searchTerm.trim() !== '') {
            params.append('search', searchTerm);
        }
        params.append('page', page);
        params.append('size', size);

        const url = `${API_BASE_URL}/products?${params.toString()}`;
        const response = await fetch(url); // GET público

        if (!response.ok) {
            const errorText = await response.text().catch(() => `Error HTTP ${response.status}`);
            throw new Error(errorText || `Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error al obtener los productos paginados:", error);
        throw error;
    }
};

export const getProductById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`); // GET público
        if (!response.ok) {
            const errorText = await response.text().catch(() => `Error HTTP ${response.status}`);
            throw new Error(errorText || `Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error al obtener el producto con id ${id}:`, error);
        throw error;
    }
};

/**
 * Crea un nuevo producto. Ahora espera FormData.
 * @param {FormData} formData - Objeto FormData que contiene 'product' (JSON string como Blob) y 'imageFile' (File).
 * @returns {Promise<object>} El producto creado.
 */
export const createProduct = async (formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: buildAuthHeadersForFormData(),
            body: formData
        });

        if (!response.ok) { // Si el status no es 2xx (ej. 400, 404, 500)
            const errorBody = await response.json().catch(() => {
                // Si el cuerpo del error no es JSON (ej. HTML de error 500 genérico),
                // o si response.text() sería mejor aquí para capturar HTML
                return { message: `Error HTTP ${response.status}: ${response.statusText || 'Error del servidor al procesar la petición.'}` };
            });

            const error = new Error(errorBody.message || errorBody.error || JSON.stringify(errorBody.errors) || `Error HTTP: ${response.status}`);
            error.status = response.status; // ¡MUY IMPORTANTE AÑADIR EL STATUS AL ERROR!
            throw error;
        }
        return await response.json(); // Para respuestas 2xx
    } catch (error) {
        // Si es un error de red (Failed to fetch), error.status no existirá.
        console.error("Error al crear el producto (servicio):", error);
        // Aseguramos que el error relanzado tenga un mensaje.
        // Si ya tiene status, lo mantenemos.
        if (!error.status && !(error instanceof TypeError)) { // TypeError es por red usualmente
            // Podría ser un error de parseo de JSON de una respuesta OK, aunque es raro.
        }
        throw error; // Relanzar para que la página lo maneje
    }
};
/**
 * Actualiza un producto existente. Ahora espera FormData.
 * @param {number} id - ID del producto a actualizar.
 * @param {FormData} formData - Objeto FormData que contiene 'product' (JSON string como Blob) y opcionalmente 'imageFile' (File).
 * @returns {Promise<object>} El producto actualizado.
 */
export const updateProduct = async (id, formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: buildAuthHeadersForFormData(), // Headers para FormData
            body: formData // Enviamos el objeto FormData directamente
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: `Error HTTP ${response.status} actualizando producto` }));
            throw new Error(errorBody.message || errorBody.error || JSON.stringify(errorBody.errors) || `Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error al actualizar el producto con id ${id}:`, error);
        throw error;
    }
};

export const deleteProduct = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE',
            headers: buildAuthHeadersForFormData() // Solo necesita Authorization
        });
        if (!response.ok) {
            const errorText = await response.text().catch(() => `Error HTTP ${response.status} eliminando producto`);
            let parsedError = { message: errorText };
            try { parsedError = JSON.parse(errorText); } catch (e) { /* No era JSON */ }
            throw new Error(parsedError.message || parsedError.error || errorText || `Error HTTP: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error al eliminar el producto con id ${id}:`, error);
        throw error;
    }
};