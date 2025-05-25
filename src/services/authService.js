// Ruta: src/services/authService.js

const API_AUTH_URL = 'http://localhost:8080/api/auth'; // URL base para autenticación

/**
 * Registra un nuevo usuario.
 * @param {object} userData - Objeto con { username, password }
 * @returns {Promise<object>} Respuesta del backend (mensaje de éxito o error)
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

        const data = await response.json(); // Intentamos leer el cuerpo como JSON

        if (!response.ok) {
            // Si el backend envió un mensaje de error en el cuerpo JSON (como "El username ya existe")
            // data podría ser el mensaje de error directamente si es un string, o data.message.
            // Asumimos que el backend puede enviar un string o un objeto con 'message'.
            const errorMessage = typeof data === 'string' ? data : (data.message || `Error HTTP: ${response.status}`);
            throw new Error(errorMessage);
        }
        return data; // Debería ser el mensaje de éxito
    } catch (error) {
        console.error("Error en el servicio de registro:", error);
        throw error;
    }
};

/**
 * Inicia sesión de un usuario.
 * @param {object} credentials - Objeto con { username, password }
 * @returns {Promise<object>} Respuesta del backend (que incluye el accessToken)
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
            const errorMessage = typeof data === 'string' ? data : (data.message || `Error HTTP: ${response.status}`);
            throw new Error(errorMessage);
        }
        return data; // Debería ser el objeto AuthResponse { accessToken, tokenType }
    } catch (error) {
        console.error("Error en el servicio de login:", error);
        throw error;
    }
};