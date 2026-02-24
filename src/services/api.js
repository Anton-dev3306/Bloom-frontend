import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (!error.response) {
            return Promise.reject({
                message: 'Error de conexión. Verifica tu internet.',
                code: 'NETWORK_ERROR',
            });
        }

        if (error.response.status === 401) {
            localStorage.removeItem('user');

            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }

            return Promise.reject({
                message: 'Sesión expirada. Por favor inicia sesión nuevamente.',
                code: 'UNAUTHORIZED',
                status: 401,
            });
        }

        if (error.response.status === 403) {
            return Promise.reject({
                message: 'No tienes permisos para realizar esta acción.',
                code: 'FORBIDDEN',
                status: 403,
            });
        }

        if (error.response.status === 404) {
            return Promise.reject({
                message: error.response?.data?.error || 'Recurso no encontrado.',
                code: 'NOT_FOUND',
                status: 404,
            });
        }

        if (error.response.status === 500) {
            return Promise.reject({
                message: 'Error del servidor. Por favor intenta más tarde.',
                code: 'SERVER_ERROR',
                status: 500,
            });
        }

        return Promise.reject(error);
    }
);

export default api;