export const API_BASE_URL = 'http://localhost:8082';
export const WS_URL = 'ws://localhost:8082/ws';

export const API_ENDPOINTS = {
    // Autenticación
    AUTH_LOGIN: '/api/auth/login',
    AUTH_LOGOUT: '/api/auth/logout',
    AUTH_SESSION: '/api/auth/session',

    // Verificación
    VERIFICATION_SEND: '/api/verification/send',
    VERIFICATION_CHECK: '/api/verification/check',

    // Usuarios
    USERS: '/api/users',
    USERS_REGISTER: '/api/users/register',
    USERS_BY_ID: '/api/users',
    USERS_BY_USERNAME: '/api/users/username',
    USERS_CHECK_USERNAME: '/api/users/check/username',
    USERS_CHECK_PHONE: '/api/users/check/phone',

    // Contactos
    CONTACTS: '/api/contacts',
    CONTACTS_BY_OWNER: '/api/contacts/owner',

    // Chats
    CHATS: '/api/chats',
    CHATS_BY_USER: '/api/chats/user',
    CHATS_PRIVATE: '/api/chats/private',

    // Mensajes
    MESSAGES: '/messages',
    MESSAGES_BY_CHAT: '/messages/chat',
};