import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export const createUser = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS_REGISTER}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        return await response.json();
    } catch (error) {
        console.error('Error creando usuario:', error);
        throw error;
    }
};

export const getUserByUsername = async (username) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}${API_ENDPOINTS.USERS_BY_USERNAME}/${username}`
        );

        return await response.json();
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        throw error;
    }
};

export const checkUsernameAvailable = async (username) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/users/check/username/${username}`
        );

        const data = await response.json();
        return !data.exists; // Devuelve true si está disponible
    } catch (error) {
        console.error('Error verificando username:', error);
        throw error;
    }
};