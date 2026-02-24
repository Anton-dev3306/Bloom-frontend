import api from './api';

const authService = {
    /**
     * Login de usuario
     * Endpoint: POST /api/auth/login
     */
    async login(phoneOrEmail, password) {
        try {
            const response = await api.post('/api/auth/login', {
                phoneOrEmail,
                password,
            });

            if (response.data && response.data.success && response.data.user) {
                const user = response.data.user;
                this.saveUser(user);

                return {
                    success: true,
                    user,
                };
            }

            return {
                success: false,
                error: response.data?.error || 'Error al iniciar sesión',
            };
        } catch (error) {
            console.error('Error en login:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Credenciales incorrectas',
            };
        }
    },

    /**
     * Registro de usuario
     * Endpoint: POST /api/users/register
     */
    async register(userData) {
        try {
            const response = await api.post('/api/users/register', {
                username: userData.username,
                displayName: userData.displayName,
                phoneNumber: userData.phoneNumber,
                email: userData.email || '',
                password: userData.password,
            });

            if (response.data && response.data.success && response.data.user) {
                const user = response.data.user;
                this.saveUser(user);

                return {
                    success: true,
                    user,
                };
            }

            return {
                success: false,
                error: response.data?.error || 'Error al registrarse',
            };
        } catch (error) {
            console.error('Error en registro:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al registrarse',
            };
        }
    },

    /**
     * Logout de usuario
     * Endpoint: POST /api/auth/logout
     */
    async logout() {
        try {
            await api.post('/api/auth/logout');
            this.clearSession();
            return { success: true };
        } catch (error) {
            // Limpiar sesión local incluso si falla el backend
            this.clearSession();
            return { success: true };
        }
    },

    /**
     * Verificar sesión actual
     * Endpoint: GET /api/auth/session
     */
    async checkSession() {
        try {
            const response = await api.get('/api/auth/session');

            if (response.data && response.data.authenticated) {
                const user = response.data.user;
                this.saveUser(user);

                return {
                    authenticated: true,
                    user,
                };
            }

            return {
                authenticated: false,
            };
        } catch (error) {
            console.error('Error verificando sesión:', error);
            return {
                authenticated: false,
            };
        }
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (error) {
                return null;
            }
        }
        return null;
    },

    async updateUser(userId, updates) {
        try {
            const response = await api.put(`/api/users/${userId}`, updates);

            if (response.data && response.data.success && response.data.user) {
                const user = response.data.user;
                this.saveUser(user);

                return {
                    success: true,
                    user,
                };
            }

            return {
                success: false,
                error: response.data?.error || 'Error al actualizar usuario',
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al actualizar usuario',
            };
        }
    },

    isAuthenticated() {
        return !!this.getUserFromStorage();
    },

    saveUser(user) {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }
    },

    getUserFromStorage() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (error) {
                return null;
            }
        }
        return null;
    },

    clearSession() {
        localStorage.removeItem('user');
    },

    getCurrentUserId() {
        const user = this.getUserFromStorage();
        return user?.userId || null;
    },

    getCurrentUsername() {
        const user = this.getUserFromStorage();
        return user?.username || null;
    },

    getCurrentDisplayName() {
        const user = this.getUserFromStorage();
        return user?.displayName || null;
    },

    async checkUsernameAvailability(username) {
        try {
            const response = await api.get(`/api/users/check/username/${username}`);
            return {
                success: true,
                available: !response.data?.exists,
            };
        } catch (error) {
            return {
                success: false,
                error: 'Error al verificar disponibilidad',
                available: false,
            };
        }
    },

    async checkPhoneAvailability(phoneNumber) {
        try {
            const response = await api.get(`/api/users/check/phone/${phoneNumber}`);
            return {
                success: true,
                available: !response.data?.exists,
            };
        } catch (error) {
            return {
                success: false,
                error: 'Error al verificar disponibilidad',
                available: false,
            };
        }
    },

    async getUserById(userId) {
        try {
            const response = await api.get(`/api/users/${userId}`);

            if (response.data && response.data.success && response.data.user) {
                return {
                    success: true,
                    user: response.data.user,
                };
            }

            return {
                success: false,
                error: 'Usuario no encontrado',
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al obtener usuario',
            };
        }
    },

    async getUserByUsername(username) {
        try {
            const response = await api.get(`/api/users/username/${username}`);

            if (response.data && response.data.success && response.data.user) {
                return {
                    success: true,
                    user: response.data.user,
                };
            }

            return {
                success: false,
                error: 'Usuario no encontrado',
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Usuario no encontrado',
            };
        }
    },
};

export default authService;