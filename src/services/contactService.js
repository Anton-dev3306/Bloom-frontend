import api from './api';

const contactService = {
    async getUserContacts(userId) {
        try {
            const response = await api.get(`/api/contacts/owner/${userId}`);

            if (response.data && response.data.success) {
                return {
                    success: true,
                    contacts: response.data.contacts || [],
                };
            }

            return {
                success: false,
                error: 'Error al obtener contactos',
                contacts: [],
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al obtener contactos',
                contacts: [],
            };
        }
    },

    async getContactsByOwnerId(ownerId) {
        return this.getUserContacts(ownerId);
    },

    // CAMBIAR: Ahora recibe phoneNumber en vez de contactUsername
    async addContact(ownerId, phoneNumber, alias = null) {
        try {
            const requestData = {
                owner: { userId: ownerId },
                contact: { phoneNumber: phoneNumber },  // ← CAMBIO AQUÍ
                alias: alias
            };

            const response = await api.post('/api/contacts', requestData);

            if (response.data && response.data.success) {
                return {
                    success: true,
                    contact: response.data.contact,
                };
            }

            return {
                success: false,
                error: response.data?.error || 'Error al agregar contacto',
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al agregar contacto',
            };
        }
    },

    async updateContactAlias(contactEntryId, newAlias) {
        try {
            const response = await api.put(`/api/contacts/${contactEntryId}/alias`, {
                alias: newAlias
            });

            if (response.data && response.data.success) {
                return {
                    success: true,
                    contact: response.data.contact,
                };
            }

            return {
                success: false,
                error: response.data?.error || 'Error al actualizar alias',
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al actualizar alias',
            };
        }
    },

    async deleteContact(contactEntryId) {
        try {
            const response = await api.delete(`/api/contacts/${contactEntryId}`);

            if (response.data && response.data.success) {
                return { success: true };
            }

            return {
                success: false,
                error: response.data?.error || 'Error al eliminar contacto',
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al eliminar contacto',
            };
        }
    },

    async checkIsContact(ownerId, contactId) {
        try {
            const response = await api.get(`/api/contacts/check/${ownerId}/${contactId}`);

            return {
                success: true,
                isContact: response.data?.isContact || false,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al verificar contacto',
                isContact: false,
            };
        }
    },

    // OPCIONAL: Buscar por teléfono en vez de username
    async searchUserByPhoneNumber(phoneNumber) {
        try {
            const response = await api.get(`/api/users/phone/${phoneNumber}`);

            if (response.data && response.data.success) {
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

    async searchUserByUsername(username) {
        try {
            const response = await api.get(`/api/users/username/${username}`);

            if (response.data && response.data.success) {
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

export default contactService;