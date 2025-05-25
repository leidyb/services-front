// Ruta: src/services/authService.js

// Lee la variable de entorno VITE_API_BASE_URL_ROOT que configurarás en Render
// o usa http://localhost:8080 como fallback para desarrollo local.
// Esta debe apuntar a la raíz de tu backend, ej: http://localhost:8080 o https://tu-api.onrender.com
const BACKEND_API_ROOT_URL = import.meta.env.VITE_API_BASE_URL_ROOT || 'http://localhost:8080';

// Construye la URL completa para los endpoints de autenticación
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

        const data = await response.json(); // El backend ahora devuelve JSON para éxito y error

        if (!response.ok) {
            // El backend devuelve un objeto con una propiedad 'error' en caso de error de negocio
            const errorMessage = data.error || `Error HTTP ${response.status}: ${response.statusText || 'Error al registrar'}`;
            const error = new Error(errorMessage);
            error.status = response.status; // Adjuntar status para manejo en el componente
            throw error;
        }
        return data; // Debería ser el objeto { message, userId }
    } catch (error) {
        console.error("Error en el servicio de registro:", error.message);
        // Si es un error de red (fetch falla), error.status no existirá.
        // Si es un error parseando JSON de una respuesta NO JSON (raro si el backend está bien),
        // el error original será un SyntaxError.
        // Nos aseguramos de relanzar un error con un mensaje útil.
        if (!error.status && !(error instanceof SyntaxError)) {
             throw new Error(error.message || "Error de red o respuesta inesperada al registrar.");
        }
        throw error; // Relanzar el error (con status si lo tiene)
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

        const data = await response.json(); // El backend devuelve JSON para éxito y error

        if (!response.ok) {
            const errorMessage = data.error || `Error HTTP ${response.status}: ${response.statusText || 'Error al iniciar sesión'}`;
            const error = new Error(errorMessage);
            error.status = response.status;
            throw error;
        }
        return data; // Debería ser el objeto AuthResponse { accessToken, tokenType }
    } catch (error) {
        console.error("Error en el servicio de login:", error.message);
        if (!error.status && !(error instanceof SyntaxError)) {
             throw new Error(error.message || "Error de red o respuesta inesperada al iniciar sesión.");
        }
        throw error;
    }
};