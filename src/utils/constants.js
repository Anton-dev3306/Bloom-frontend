/**
 * Constantes de la aplicación
 * Centraliza todos los valores constantes para fácil mantenimiento
 */

// ========================================
// API & ENDPOINTS
// ========================================

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8082/ws';

export const API_ENDPOINTS = {
    // Auth
    AUTH_LOGIN: '/api/auth/login',
    AUTH_LOGOUT: '/api/auth/logout',
    AUTH_SESSION: '/api/auth/session',

    // Users
    USERS: '/api/users',
    USER_REGISTER: '/api/users/register',
    USER_BY_ID: (id) => `/api/users/${id}`,
    USER_UPDATE: (id) => `/api/users/${id}`,
    USER_BY_USERNAME: (username) => `/api/users/username/${username}`,
    USER_CHECK_USERNAME: (username) => `/api/users/check/username/${username}`,
    USER_CHECK_PHONE: (phoneNumber) => `/api/users/check/phone/${phoneNumber}`,

    // Chats
    CHATS: '/api/chats',
    CHAT_BY_ID: (id) => `/api/chats/${id}`,
    USER_CHATS: (userId) => `/api/chats/user/${userId}`,
    PRIVATE_CHAT: (userId1, userId2) => `/api/chats/private/${userId1}/${userId2}`,
    CHAT_PARTICIPANTS: (chatId) => `/api/chats/${chatId}/participants`,

    // Messages
    MESSAGES: '/messages',
    MESSAGE_BY_ID: (id) => `/messages/${id}`,
    CHAT_MESSAGES: (chatId) => `/messages/chat/${chatId}`,
    CHAT_MESSAGES_SEARCH: (chatId) => `/messages/chat/${chatId}/search`,
    CHAT_MESSAGES_READ: (chatId) => `/messages/chat/${chatId}/read`,

    // Contacts
    CONTACTS: '/api/contacts',
    CONTACT_BY_ID: (id) => `/api/contacts/${id}`,
    USER_CONTACTS: (userId) => `/api/contacts/owner/${userId}`,

    // Upload
    UPLOAD_IMAGE: '/api/upload/image',
    UPLOAD_FILE: '/api/upload/file',
    UPLOAD_AUDIO: '/api/upload/audio',
};

// ========================================
// WEBSOCKET
// ========================================

export const WS_CONFIG = {
    ENDPOINT: '/ws',
    APP_PREFIX: '/app',
    TOPIC_PREFIX: '/topic',
    RECONNECT_DELAY: 2000,
    MAX_RECONNECT_ATTEMPTS: 10,
    HEARTBEAT_INTERVAL: 30000, // 30 segundos
};

export const WS_DESTINATIONS = {
    // Suscripciones
    CHAT_TOPIC: (chatId) => `/topic/chat.${chatId}`,
    USER_TOPIC: (userId) => `/topic/user.${userId}`,

    // Envío de mensajes
    SEND_MESSAGE: '/app/chat.sendMessage',
    TYPING: '/app/chat.typing',
    READ_RECEIPT: '/app/chat.read',
};

// ========================================
// TIPOS DE CHAT
// ========================================

export const CHAT_TYPES = {
    PRIVATE: 'private',
    GROUP: 'group',
};

export const CHAT_TYPE_LABELS = {
    [CHAT_TYPES.PRIVATE]: 'Chat Privado',
    [CHAT_TYPES.GROUP]: 'Chat Grupal',
};

// ========================================
// TIPOS DE MENSAJE
// ========================================

export const MESSAGE_TYPES = {
    TEXT: 'text',
    IMAGE: 'image',
    FILE: 'file',
    AUDIO: 'audio',
    VIDEO: 'video',
    LOCATION: 'location',
    SYSTEM: 'system',
};

export const MESSAGE_TYPE_LABELS = {
    [MESSAGE_TYPES.TEXT]: 'Texto',
    [MESSAGE_TYPES.IMAGE]: 'Imagen',
    [MESSAGE_TYPES.FILE]: 'Archivo',
    [MESSAGE_TYPES.AUDIO]: 'Audio',
    [MESSAGE_TYPES.VIDEO]: 'Video',
    [MESSAGE_TYPES.LOCATION]: 'Ubicación',
    [MESSAGE_TYPES.SYSTEM]: 'Sistema',
};

// ========================================
// ESTADOS DE MENSAJE
// ========================================

export const MESSAGE_STATUS = {
    SENDING: 'sending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read',
    FAILED: 'failed',
};

export const MESSAGE_STATUS_LABELS = {
    [MESSAGE_STATUS.SENDING]: 'Enviando',
    [MESSAGE_STATUS.SENT]: 'Enviado',
    [MESSAGE_STATUS.DELIVERED]: 'Entregado',
    [MESSAGE_STATUS.READ]: 'Leído',
    [MESSAGE_STATUS.FAILED]: 'Fallido',
};

// ========================================
// ROLES DE USUARIO
// ========================================

export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
};

export const USER_ROLE_LABELS = {
    [USER_ROLES.USER]: 'Usuario',
    [USER_ROLES.ADMIN]: 'Administrador',
    [USER_ROLES.MODERATOR]: 'Moderador',
};

// ========================================
// ESTADOS DE USUARIO
// ========================================

export const USER_STATUS = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    AWAY: 'away',
    BUSY: 'busy',
};

export const USER_STATUS_LABELS = {
    [USER_STATUS.ONLINE]: 'En línea',
    [USER_STATUS.OFFLINE]: 'Desconectado',
    [USER_STATUS.AWAY]: 'Ausente',
    [USER_STATUS.BUSY]: 'Ocupado',
};

export const USER_STATUS_COLORS = {
    [USER_STATUS.ONLINE]: '#10b981',  // green-500
    [USER_STATUS.OFFLINE]: '#6b7280', // gray-500
    [USER_STATUS.AWAY]: '#f59e0b',    // amber-500
    [USER_STATUS.BUSY]: '#ef4444',    // red-500
};

// ========================================
// LÍMITES Y CONFIGURACIONES
// ========================================

export const LIMITS = {
    // Mensajes
    MESSAGE_MAX_LENGTH: 5000,
    MESSAGE_MIN_LENGTH: 1,
    MESSAGES_PER_PAGE: 50,
    MESSAGES_INITIAL_LOAD: 50,

    // Archivos
    FILE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
    IMAGE_MAX_SIZE: 5 * 1024 * 1024,  // 5MB
    VIDEO_MAX_SIZE: 50 * 1024 * 1024, // 50MB

    // Chat
    CHAT_NAME_MAX_LENGTH: 100,
    CHAT_NAME_MIN_LENGTH: 1,
    GROUP_MAX_PARTICIPANTS: 100,

    // Usuario
    USERNAME_MAX_LENGTH: 50,
    USERNAME_MIN_LENGTH: 3,
    DISPLAY_NAME_MAX_LENGTH: 100,
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 128,

    // Contactos
    ALIAS_MAX_LENGTH: 50,

    // Búsqueda
    SEARCH_MIN_LENGTH: 2,
    SEARCH_MAX_RESULTS: 50,
};

// ========================================
// FORMATOS DE ARCHIVO ACEPTADOS
// ========================================

export const ACCEPTED_FILE_TYPES = {
    IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    VIDEO: ['video/mp4', 'video/webm', 'video/ogg'],
    AUDIO: ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg'],
    DOCUMENT: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
};

export const ACCEPTED_FILE_EXTENSIONS = {
    IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    VIDEO: ['.mp4', '.webm', '.ogg'],
    AUDIO: ['.mp3', '.wav', '.ogg'],
    DOCUMENT: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
};

// ========================================
// EXPRESIONES REGULARES
// ========================================

export const REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[\d\s-]{10,}$/,
    USERNAME: /^[a-zA-Z0-9_]{3,50}$/,
    URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    HASHTAG: /#[a-zA-Z0-9_]+/g,
    MENTION: /@[a-zA-Z0-9_]+/g,
    EMOJI: /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
};

// ========================================
// RUTAS DE NAVEGACIÓN
// ========================================

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    CHAT: '/chat',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    NOTIFICATIONS: '/notifications',
    CONTACTS: '/contacts',
    HELP: '/help',
    ABOUT: '/about',
};

// ========================================
// STORAGE KEYS
// ========================================

export const STORAGE_KEYS = {
    TOKEN: 'token',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
    THEME: 'theme',
    LANGUAGE: 'language',
    SETTINGS: 'settings',
    DRAFT_MESSAGE: (chatId) => `draft_${chatId}`,
    LAST_CHAT: 'lastChat',
};

// ========================================
// TEMAS
// ========================================

export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto',
};

export const THEME_LABELS = {
    [THEMES.LIGHT]: 'Claro',
    [THEMES.DARK]: 'Oscuro',
    [THEMES.AUTO]: 'Automático',
};

// ========================================
// IDIOMAS
// ========================================

export const LANGUAGES = {
    ES: 'es',
    EN: 'en',
    FR: 'fr',
    DE: 'de',
};

export const LANGUAGE_LABELS = {
    [LANGUAGES.ES]: 'Español',
    [LANGUAGES.EN]: 'English',
    [LANGUAGES.FR]: 'Français',
    [LANGUAGES.DE]: 'Deutsch',
};

// ========================================
// TIEMPOS Y DELAYS
// ========================================

export const TIMING = {
    TYPING_INDICATOR_DELAY: 1000,      // 1 segundo
    TYPING_INDICATOR_TIMEOUT: 5000,    // 5 segundos
    MESSAGE_RETRY_DELAY: 2000,         // 2 segundos
    NOTIFICATION_DURATION: 5000,       // 5 segundos
    DEBOUNCE_DELAY: 300,               // 300ms
    THROTTLE_DELAY: 1000,              // 1 segundo
    AUTO_LOGOUT_WARNING: 300000,       // 5 minutos
    AUTO_LOGOUT_TIMEOUT: 600000,       // 10 minutos
    TOKEN_REFRESH_INTERVAL: 840000,    // 14 minutos (si token expira en 15)
};

// ========================================
// CÓDIGOS DE ERROR
// ========================================

export const ERROR_CODES = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    SERVER_ERROR: 'SERVER_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    TIMEOUT: 'TIMEOUT',
    UNKNOWN: 'UNKNOWN',
};

export const ERROR_MESSAGES = {
    [ERROR_CODES.NETWORK_ERROR]: 'Error de conexión. Verifica tu internet.',
    [ERROR_CODES.UNAUTHORIZED]: 'No estás autorizado. Por favor inicia sesión.',
    [ERROR_CODES.FORBIDDEN]: 'No tienes permisos para realizar esta acción.',
    [ERROR_CODES.NOT_FOUND]: 'Recurso no encontrado.',
    [ERROR_CODES.SERVER_ERROR]: 'Error del servidor. Intenta más tarde.',
    [ERROR_CODES.VALIDATION_ERROR]: 'Datos inválidos. Verifica la información.',
    [ERROR_CODES.TIMEOUT]: 'Tiempo de espera agotado.',
    [ERROR_CODES.UNKNOWN]: 'Error desconocido. Intenta nuevamente.',
};

// ========================================
// CONFIGURACIÓN DE NOTIFICACIONES
// ========================================

export const NOTIFICATION_TYPES = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
};

export const NOTIFICATION_POSITIONS = {
    TOP_LEFT: 'top-left',
    TOP_CENTER: 'top-center',
    TOP_RIGHT: 'top-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_CENTER: 'bottom-center',
    BOTTOM_RIGHT: 'bottom-right',
};

// ========================================
// CONFIGURACIÓN DE PAGINACIÓN
// ========================================

export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
    MAX_PAGE_SIZE: 100,
};

// ========================================
// COLORES DE LA APLICACIÓN
// ========================================

export const COLORS = {
    PRIMARY: '#667eea',
    SECONDARY: '#764ba2',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#3b82f6',

    // Gradientes
    GRADIENT_PRIMARY: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    GRADIENT_SUCCESS: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    GRADIENT_WARNING: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    GRADIENT_ERROR: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
};

// ========================================
// CONFIGURACIÓN DE FECHA Y HORA
// ========================================

export const DATE_FORMATS = {
    SHORT_DATE: 'DD/MM/YYYY',
    LONG_DATE: 'D [de] MMMM [de] YYYY',
    SHORT_TIME: 'HH:mm',
    LONG_TIME: 'HH:mm:ss',
    DATETIME: 'DD/MM/YYYY HH:mm',
    RELATIVE: 'relative', // hace 5 minutos
};

// ========================================
// CONFIGURACIÓN DE AVATARES
// ========================================

export const AVATAR_CONFIG = {
    DEFAULT_SIZE: 40,
    SIZES: {
        XS: 24,
        SM: 32,
        MD: 40,
        LG: 48,
        XL: 64,
        '2XL': 96,
    },
    COLORS: [
        '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
        '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ],
};

// ========================================
// CONFIGURACIÓN DE MENSAJES
// ========================================

export const MESSAGE_CONFIG = {
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000,
    SHOW_AVATAR_EVERY_N_MESSAGES: 1,
    GROUP_MESSAGES_WITHIN_MINUTES: 5,
    MARK_AS_READ_DELAY: 1000,
};

// ========================================
// ATAJOS DE TECLADO
// ========================================

export const KEYBOARD_SHORTCUTS = {
    SEND_MESSAGE: 'Enter',
    NEW_LINE: 'Shift+Enter',
    SEARCH: 'Ctrl+K',
    CLOSE_CHAT: 'Escape',
    NEXT_CHAT: 'Ctrl+ArrowDown',
    PREV_CHAT: 'Ctrl+ArrowUp',
    TOGGLE_SIDEBAR: 'Ctrl+B',
};

// ========================================
// CONFIGURACIÓN DE DESARROLLO
// ========================================

export const DEV_CONFIG = {
    ENABLE_LOGGING: process.env.NODE_ENV === 'development',
    ENABLE_MOCK_DATA: false,
    ENABLE_DEBUG_PANEL: process.env.NODE_ENV === 'development',
    LOG_LEVEL: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
};

// ========================================
// METADATA DE LA APP
// ========================================

export const APP_METADATA = {
    NAME: 'Bloom',
    VERSION: '1.0.0',
    DESCRIPTION: 'Aplicación de mensajería en tiempo real',
    AUTHOR: 'Anton-dev3306',
    SUPPORT_EMAIL: 'support@Bloom.com',
    WEBSITE: 'https://messenger.com',
};

// Exportar todo como default también
export default {
    API_BASE_URL,
    WS_BASE_URL,
    API_ENDPOINTS,
    WS_CONFIG,
    WS_DESTINATIONS,
    CHAT_TYPES,
    CHAT_TYPE_LABELS,
    MESSAGE_TYPES,
    MESSAGE_TYPE_LABELS,
    MESSAGE_STATUS,
    MESSAGE_STATUS_LABELS,
    USER_ROLES,
    USER_ROLE_LABELS,
    USER_STATUS,
    USER_STATUS_LABELS,
    USER_STATUS_COLORS,
    LIMITS,
    ACCEPTED_FILE_TYPES,
    ACCEPTED_FILE_EXTENSIONS,
    REGEX,
    ROUTES,
    STORAGE_KEYS,
    THEMES,
    THEME_LABELS,
    LANGUAGES,
    LANGUAGE_LABELS,
    TIMING,
    ERROR_CODES,
    ERROR_MESSAGES,
    NOTIFICATION_TYPES,
    NOTIFICATION_POSITIONS,
    PAGINATION,
    COLORS,
    DATE_FORMATS,
    AVATAR_CONFIG,
    MESSAGE_CONFIG,
    KEYBOARD_SHORTCUTS,
    DEV_CONFIG,
    APP_METADATA,
};