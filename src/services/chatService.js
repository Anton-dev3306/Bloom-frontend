import api from './api';

const chatService = {
    async getUserChats(userId) {
        try {
            const response = await api.get(`/api/chats/user/${userId}`);

            if (response.data && response.data.success && Array.isArray(response.data.chats)) {
                return {
                    success: true,
                    chats: response.data.chats,
                };
            }

            return {
                success: false,
                error: 'Error al obtener chats',
                chats: [],
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al obtener chats',
                chats: [],
            };
        }
    },

    async getChatById(chatId) {
        try {
            const response = await api.get(`/api/chats/${chatId}`);

            if (response.data && response.data.success && response.data.chat) {
                return {
                    success: true,
                    chat: response.data.chat,
                };
            }

            return {
                success: false,
                error: 'Chat no encontrado',
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al obtener chat',
            };
        }
    },

    async createChat(chatData) {
        try {
            const response = await api.post('/api/chats', chatData);

            if (response.data && response.data.success && response.data.chat) {
                return {
                    success: true,
                    chat: response.data.chat,
                    chatId: response.data.chat.chatId,
                };
            }

            return {
                success: false,
                error: response.data?.error || 'Error al crear chat',
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al crear chat',
            };
        }
    },

    async getOrCreatePrivateChat(userId1, userId2) {
        try {
            const response = await api.get(`/api/chats/private/${userId1}/${userId2}`);

            if (response.data && response.data.success && response.data.chat) {
                return {
                    success: true,
                    chat: response.data.chat,
                    chatId: response.data.chat.chatId,
                };
            }

            return {
                success: false,
                error: 'Error al obtener chat privado',
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al obtener chat privado',
            };
        }
    },

    async startPrivateChat(userId, contactUserId, contactName) {
        try {
            const checkResponse = await api.get(`/api/chats/private/${userId}/${contactUserId}`);

            if (checkResponse.data && checkResponse.data.success && checkResponse.data.chatId) {
                return {
                    success: true,
                    chatId: checkResponse.data.chatId,
                    existed: true,
                };
            }
        } catch (error) {}

        try {
            const chatRequestDTO = {
                chatType: 'private',
                createdById: userId,
                chatName: contactName,
                participantIds: [userId, contactUserId]
            };

            const response = await api.post('/api/chats', chatRequestDTO);

            if (response.data && response.data.success && response.data.chatId) {
                return {
                    success: true,
                    chatId: response.data.chatId,
                    existed: false,
                };
            }

            return {
                success: false,
                error: response.data?.error || 'Error al crear chat',
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al crear chat',
            };
        }
    },

    async createGroupChat(creatorId, participantIds, chatName) {
        try {
            const chatRequestDTO = {
                chatType: 'group',
                createdById: creatorId,
                chatName: chatName,
                participantIds: [creatorId, ...participantIds]
            };

            const response = await api.post('/api/chats', chatRequestDTO);

            if (response.data && response.data.success && response.data.chatId) {
                return {
                    success: true,
                    chatId: response.data.chatId,
                };
            }

            return {
                success: false,
                error: response.data?.error || 'Error al crear chat grupal',
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al crear chat grupal',
            };
        }
    },

    async getChatParticipants(chatId) {
        try {
            const response = await api.get(`/api/chats/${chatId}/participants`);

            if (response.data && response.data.success && Array.isArray(response.data.participants)) {
                return {
                    success: true,
                    participants: response.data.participants,
                };
            }

            return {
                success: false,
                error: 'Error al obtener participantes',
                participants: [],
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al obtener participantes',
                participants: [],
            };
        }
    },

    async updateChat(chatId, updates) {
        try {
            const response = await api.put(`/api/chats/${chatId}`, updates);

            if (response.data && response.data.success && response.data.chat) {
                return {
                    success: true,
                    chat: response.data.chat,
                };
            }

            return {
                success: false,
                error: 'Error al actualizar chat',
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al actualizar chat',
            };
        }
    },

    async deleteChat(chatId) {
        try {
            await api.delete(`/api/chats/${chatId}`);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al eliminar chat',
            };
        }
    },

    async addParticipant(chatId, userId) {
        try {
            await api.post(`/api/chats/${chatId}/participants`, { userId });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al agregar participante',
            };
        }
    },

    async removeParticipant(chatId, userId) {
        try {
            await api.delete(`/api/chats/${chatId}/participants/${userId}`);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al remover participante',
            };
        }
    },

    async getChatMessages(chatId, options = {}) {
        try {
            const { limit = 50, offset = 0 } = options;

            const response = await api.get(`/messages/chat/${chatId}`, {
                params: { limit, offset }
            });

            if (response.data && Array.isArray(response.data)) {
                return response.data;
            }

            return [];
        } catch (error) {
            return [];
        }
    },

    async sendMessage(messageData) {
        try {
            const response = await api.post('/messages', {
                ...messageData,
                messageType: messageData.messageType || 'TEXT'
            });

            if (response.data && response.data.success && response.data.data) {
                return {
                    success: true,
                    message: response.data.data,
                };
            }

            return {
                success: false,
                error: 'Error al enviar mensaje',
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al enviar mensaje',
            };
        }
    },

    async deleteMessage(messageId, userId) {
        try {
            const response = await api.delete(`/messages/${messageId}`, {
                params: { userId }
            });

            if (response.data && response.data.success) {
                return { success: true };
            }

            return {
                success: false,
                error: 'Error al eliminar mensaje',
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al eliminar mensaje',
            };
        }
    },

    async editMessage(messageId, userId, newContent) {
        try {
            const response = await api.put(`/messages/${messageId}`, {
                userId,
                content: newContent
            });

            if (response.data && response.data.success && response.data.data) {
                return {
                    success: true,
                    message: response.data.data,
                };
            }

            return {
                success: false,
                error: 'Error al editar mensaje',
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al editar mensaje',
            };
        }
    },

    async searchMessages(chatId, query) {
        try {
            const response = await api.get(`/messages/chat/${chatId}/search`, {
                params: { query }
            });

            if (response.data && response.data.success && Array.isArray(response.data.messages)) {
                return {
                    success: true,
                    messages: response.data.messages,
                };
            }

            return {
                success: false,
                error: 'Error al buscar mensajes',
                messages: [],
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al buscar mensajes',
                messages: [],
            };
        }
    },

    async markMessagesAsRead(chatId, userId) {
        try {
            await api.post(`/messages/chat/${chatId}/read`, { userId });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al marcar mensajes',
            };
        }
    },
};

export default chatService;