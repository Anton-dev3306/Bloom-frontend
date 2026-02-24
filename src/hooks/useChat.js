import { useState, useEffect, useCallback } from 'react';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

import chatService from '@/services/chatService';
import contactService from '@/services/contactService';

export default function useChat(userId) {
    const [chats, setChats] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar chats del usuario
    const loadChats = useCallback(async () => {
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await chatService.getUserChats(userId);

            if (response.success && response.chats) {
                setChats(response.chats);
            } else {
                setChats([]);
            }
        } catch (err) {
            console.error('Error cargando chats:', err);
            setError('Error al cargar los chats');
            setChats([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Cargar contactos del usuario
    const loadContacts = useCallback(async () => {
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await contactService.getUserContacts(userId);

            if (response.success && response.contacts) {
                setContacts(response.contacts);
            } else {
                setContacts([]);
            }
        } catch (err) {
            console.error('Error cargando contactos:', err);
            setError('Error al cargar los contactos');
            setContacts([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Cargar mensajes de un chat
    const loadMessages = useCallback(async (chatId) => {
        if (!chatId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await chatService.getChatMessages(chatId);
            setMessages(response || []);
        } catch (err) {
            console.error('Error cargando mensajes:', err);
            setError('Error al cargar los mensajes');
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Abrir un chat
    const openChat = useCallback(async (chatId, chatName) => {
        // Buscar datos completos del chat (incluye otherUserId, otherUserProfilePictureUrl, etc.)
        const fullChat = chats.find(c => c.chatId === chatId);
        setCurrentChat(fullChat ? { ...fullChat, chatName } : { chatId, chatName });
        await loadMessages(chatId);
    }, [loadMessages, chats]);

    // Cerrar el chat actual
    const closeChat = useCallback(() => {
        setCurrentChat(null);
        setMessages([]);
    }, []);

    // Agregar un nuevo contacto
    const addContact = useCallback(async (username, alias = null) => {
        if (!userId || !username) return { success: false, error: 'Datos inválidos' };

        try {
            setLoading(true);
            setError(null);

            const response = await contactService.addContact(userId, username, alias);

            if (response.success) {
                await loadContacts(); // Recargar contactos
                return { success: true };
            } else {
                setError(response.error || 'Error al agregar contacto');
                return { success: false, error: response.error };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Error al agregar contacto';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [userId, loadContacts]);

    const deleteContact = async (contactEntryId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/contacts/${contactEntryId}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                // Remover de la lista local
                setContacts(prev => prev.filter(c => c.contactEntryId !== contactEntryId));
                // Si el chat activo era con ese contacto, cerrarlo
                // (el chat ya fue eliminado en backend)
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    };

    const deleteChat = async (chatId) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/chats/${chatId}?userId=${userId}`,
                { method: 'DELETE' }
            );
            const data = await response.json();
            if (data.success) {
                setChats(prev => prev.filter(c => c.chatId !== chatId));
                if (currentChat?.chatId === chatId) {
                    setCurrentChat(null);
                    setMessages([]);
                }
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    };

    // Iniciar chat con un contacto
    const startChat = useCallback(async (contactUserId, contactName) => {
        if (!userId || !contactUserId) return { success: false, error: 'Datos inválidos' };

        try {
            setLoading(true);
            setError(null);

            const response = await chatService.startPrivateChat(userId, contactUserId, contactName);

            if (response.success && response.chatId) {
                await loadChats(); // Recargar lista de chats
                await openChat(response.chatId, contactName); // Abrir el chat
                return { success: true, chatId: response.chatId };
            } else {
                setError(response.error || 'Error al iniciar chat');
                return { success: false, error: response.error };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Error al iniciar chat';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [userId, loadChats, openChat]);

    // Crear chat grupal
    const createGroupChat = useCallback(async (participantIds, chatName) => {
        if (!userId || !participantIds || participantIds.length === 0) {
            return { success: false, error: 'Datos inválidos' };
        }

        try {
            setLoading(true);
            setError(null);

            const response = await chatService.createGroupChat(userId, participantIds, chatName);

            if (response.success && response.chatId) {
                await loadChats(); // Recargar lista de chats
                await openChat(response.chatId, chatName); // Abrir el chat
                return { success: true, chatId: response.chatId };
            } else {
                setError(response.error || 'Error al crear chat grupal');
                return { success: false, error: response.error };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Error al crear chat grupal';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [userId, loadChats, openChat]);

    // Agregar mensaje al estado (usado por WebSocket)
    const addMessage = useCallback((message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
    }, []);

    // Cargar datos iniciales
    useEffect(() => {
        if (userId) {
            loadChats();
            loadContacts();
        }
    }, [userId, loadChats, loadContacts]);

    return {
        chats,
        contacts,
        currentChat,
        setCurrentChat,
        messages,
        loading,
        error,
        loadChats,
        loadContacts,
        loadMessages,
        openChat,
        closeChat,
        addContact,
        deleteContact,
        startChat,
        createGroupChat,
        addMessage,
    };
}