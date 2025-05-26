




const BACKEND_API_ROOT_URL = process.env.VITE_API_BASE_URL_ROOT || 'http://localhost:8080';


const API_AUTH_URL = `${BACKEND_API_ROOT_URL}/api/auth`; 

/**
 * Registra un nuevo usuario.
 * @param {object} userData - Objeto con { username, password, nombre, apellido, correo, telefono?, ubicacion? }
 * @returns {Promise<object>} Respuesta del backend (objeto con 'message' y 'userId', o 'error')
 */
export const register = async (userData) => {
    try {
        const response = await fetch(`${API_AUTH_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {

            const errorMessage = data.error || `Error HTTP ${response.status}: ${response.statusText || 'Error al registrar'}`;
            const error = new Error(errorMessage);
            error.status = response.status;
            throw error;
        }
        return data;
    } catch (error) {
        console.error("Error en el servicio de registro:", error.message);




        if (!error.status && !(error instanceof SyntaxError)) {
             throw new Error(error.message || "Error de red o respuesta inesperada al registrar.");
        }
        throw error;
    }
};

/**
 * Inicia sesión de un usuario.
 * @param {object} credentials - Objeto con { username, password }
 * @returns {Promise<object>} Respuesta del backend (objeto AuthResponse con { accessToken, tokenType })
 */
export const login = async (credentials) => {
    try {
        const response = await fetch(`${API_AUTH_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.error || `Error HTTP ${response.status}: ${response.statusText || 'Error al iniciar sesión'}`;
            const error = new Error(errorMessage);
            error.status = response.status;
            throw error;
        }
        return data;
    } catch (error) {
        console.error("Error en el servicio de login:", error.message);
        if (!error.status && !(error instanceof SyntaxError)) {
             throw new Error(error.message || "Error de red o respuesta inesperada al iniciar sesión.");
        }
        throw error;
    }
};