/**
 * Funciones auxiliares y utilidades
 * Colección de funciones helper reutilizables
 */

// ========================================
// SEGURIDAD Y SANITIZACIÓN
// ========================================

/**
 * Escapa HTML para prevenir XSS
 */
export function escapeHtml(str) {
    if (str == null) return '';
    const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };
    return String(str).replace(/[&<>"'`=\/]/g, (s) => htmlEscapes[s]);
}

/**
 * Sanitiza texto eliminando caracteres peligrosos
 */
export function sanitizeText(text) {
    if (!text) return '';
    return text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .trim();
}

// ========================================
// FORMATEO DE FECHAS Y TIEMPO
// ========================================

/**
 * Formatea una fecha a formato de hora (HH:mm)
 */
export function formatTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formatea una fecha completa
 */
export function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Formatea fecha y hora completa
 */
export function formatDateTime(dateString) {
    if (!dateString) return '';
    return `${formatDate(dateString)} ${formatTime(dateString)}`;
}

/**
 * Formatea fecha de manera relativa (hace 5 minutos, hace 2 horas, etc.)
 */
export function formatRelativeTime(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInSec = Math.floor(diffInMs / 1000);
    const diffInMin = Math.floor(diffInSec / 60);
    const diffInHour = Math.floor(diffInMin / 60);
    const diffInDay = Math.floor(diffInHour / 24);
    const diffInWeek = Math.floor(diffInDay / 7);
    const diffInMonth = Math.floor(diffInDay / 30);
    const diffInYear = Math.floor(diffInDay / 365);

    if (diffInSec < 60) return 'Ahora';
    if (diffInMin < 60) return `Hace ${diffInMin} ${diffInMin === 1 ? 'minuto' : 'minutos'}`;
    if (diffInHour < 24) return `Hace ${diffInHour} ${diffInHour === 1 ? 'hora' : 'horas'}`;
    if (diffInDay < 7) return `Hace ${diffInDay} ${diffInDay === 1 ? 'día' : 'días'}`;
    if (diffInWeek < 4) return `Hace ${diffInWeek} ${diffInWeek === 1 ? 'semana' : 'semanas'}`;
    if (diffInMonth < 12) return `Hace ${diffInMonth} ${diffInMonth === 1 ? 'mes' : 'meses'}`;
    return `Hace ${diffInYear} ${diffInYear === 1 ? 'año' : 'años'}`;
}

/**
 * Verifica si una fecha es hoy
 */
export function isToday(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

/**
 * Verifica si una fecha fue ayer
 */
export function isYesterday(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
}

/**
 * Formatea fecha inteligente (Hoy, Ayer, o fecha)
 */
export function formatSmartDate(dateString) {
    if (!dateString) return '';
    if (isToday(dateString)) return 'Hoy';
    if (isYesterday(dateString)) return 'Ayer';
    return formatDate(dateString);
}

// ========================================
// VALIDACIONES
// ========================================

/**
 * Valida email
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida teléfono (formato simple)
 */
export function isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
}

/**
 * Valida username (alfanumérico y guión bajo)
 */
export function isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
    return usernameRegex.test(username);
}

/**
 * Valida URL
 */
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Valida si es un ID válido
 */
export function isValidId(id) {
    const parsedId = parseInt(id, 10);
    return !isNaN(parsedId) && parsedId > 0;
}

/**
 * Valida contraseña (mínimo 6 caracteres)
 */
export function isValidPassword(password) {
    return password && password.length >= 6;
}

/**
 * Valida contraseña fuerte
 */
export function isStrongPassword(password) {
    if (!password || password.length < 8) return false;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}

/**
 * Valida sesión de usuario
 */
export function validateUserSession(user) {
    if (!user) return false;
    if (!user.userId || isNaN(user.userId) || user.userId <= 0) return false;
    if (!user.username || user.username.trim() === '') return false;
    return true;
}

// ========================================
// FORMATEO DE TEXTO
// ========================================

/**
 * Obtiene iniciales de un nombre
 */
export function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Trunca texto con ellipsis
 */
export function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Capitaliza la primera letra
 */
export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convierte a Title Case
 */
export function toTitleCase(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Convierte a slug (URL-friendly)
 */
export function slugify(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Cuenta palabras en un texto
 */
export function countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).length;
}

/**
 * Extrae hashtags de un texto
 */
export function extractHashtags(text) {
    if (!text) return [];
    const regex = /#[a-zA-Z0-9_]+/g;
    return text.match(regex) || [];
}

/**
 * Extrae menciones (@usuario) de un texto
 */
export function extractMentions(text) {
    if (!text) return [];
    const regex = /@[a-zA-Z0-9_]+/g;
    return text.match(regex) || [];
}

/**
 * Resalta texto de búsqueda
 */
export function highlightText(text, query) {
    if (!text || !query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// ========================================
// FORMATEO DE NÚMEROS
// ========================================

/**
 * Formatea número con separadores de miles
 */
export function formatNumber(num) {
    if (num == null) return '0';
    return num.toLocaleString();
}

/**
 * Formatea bytes a tamaño legible
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Formatea número a forma compacta (1.5K, 2.3M, etc.)
 */
export function formatCompactNumber(num) {
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    return (num / 1000000000).toFixed(1) + 'B';
}

/**
 * Formatea porcentaje
 */
export function formatPercentage(value, total) {
    if (total === 0) return '0%';
    return ((value / total) * 100).toFixed(1) + '%';
}

// ========================================
// ARRAYS Y OBJETOS
// ========================================

/**
 * Elimina duplicados de un array
 */
export function removeDuplicates(arr) {
    return [...new Set(arr)];
}

/**
 * Agrupa array por una propiedad
 */
export function groupBy(arr, key) {
    return arr.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
}

/**
 * Ordena array de objetos por una propiedad
 */
export function sortBy(arr, key, order = 'asc') {
    return [...arr].sort((a, b) => {
        if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Filtra objetos falsy de un objeto
 */
export function removeEmpty(obj) {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value != null && value !== '')
    );
}

/**
 * Deep clone de un objeto
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Verifica si dos objetos son iguales
 */
export function isEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

// ========================================
// UTILIDADES DE ARCHIVOS
// ========================================

/**
 * Obtiene extensión de archivo
 */
export function getFileExtension(filename) {
    if (!filename) return '';
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * Verifica si es imagen
 */
export function isImageFile(filename) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const ext = getFileExtension(filename).toLowerCase();
    return imageExtensions.includes(ext);
}

/**
 * Verifica si es video
 */
export function isVideoFile(filename) {
    const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov'];
    const ext = getFileExtension(filename).toLowerCase();
    return videoExtensions.includes(ext);
}

/**
 * Verifica si es audio
 */
export function isAudioFile(filename) {
    const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
    const ext = getFileExtension(filename).toLowerCase();
    return audioExtensions.includes(ext);
}

/**
 * Obtiene ícono de archivo según extensión
 */
export function getFileIcon(filename) {
    if (isImageFile(filename)) return '🖼️';
    if (isVideoFile(filename)) return '🎥';
    if (isAudioFile(filename)) return '🎵';
    const ext = getFileExtension(filename).toLowerCase();
    switch (ext) {
        case 'pdf': return '📄';
        case 'doc':
        case 'docx': return '📝';
        case 'xls':
        case 'xlsx': return '📊';
        case 'zip':
        case 'rar': return '📦';
        default: return '📎';
    }
}

// ========================================
// COLORES Y AVATARES
// ========================================

/**
 * Genera color aleatorio para avatar
 */
export function generateAvatarColor(name) {
    const colors = [
        '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
        '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ];
    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
}

/**
 * Convierte hex a RGB
 */
export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Genera gradiente para avatar
 */
export function generateAvatarGradient(name) {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];
    if (!name) return `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
    const index1 = name.charCodeAt(0) % colors.length;
    const index2 = (index1 + 1) % colors.length;
    return `linear-gradient(135deg, ${colors[index1]}, ${colors[index2]})`;
}

// ========================================
// UTILIDADES GENERALES
// ========================================

/**
 * Genera ID único
 */
export function generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Genera un delay para reconexión exponencial
 */
export function getReconnectDelay(attempt, baseDelay = 2000, maxDelay = 10000) {
    return Math.min(baseDelay * attempt, maxDelay);
}

/**
 * Sleep/delay asíncrono
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Copia texto al portapapeles
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Error copiando al portapapeles:', err);
        return false;
    }
}

/**
 * Descarga archivo desde URL
 */
export function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Parsea query string a objeto
 */
export function parseQueryString(queryString) {
    if (!queryString) return {};
    return Object.fromEntries(new URLSearchParams(queryString));
}

/**
 * Convierte objeto a query string
 */
export function objectToQueryString(obj) {
    return new URLSearchParams(removeEmpty(obj)).toString();
}

/**
 * Detecta si es dispositivo móvil
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
}

/**
 * Obtiene información del navegador
 */
export function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';

    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';
    else if (ua.includes('MSIE') || ua.includes('Trident')) browser = 'IE';

    return {
        browser,
        userAgent: ua,
        isMobile: isMobile(),
    };
}

/**
 * Scroll suave a elemento
 */
export function scrollToElement(elementId, offset = 0) {
    const element = document.getElementById(elementId);
    if (element) {
        const top = element.offsetTop - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    }
}

/**
 * Genera contraseña aleatoria
 */
export function generateRandomPassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}

/**
 * Calcula fuerza de contraseña (0-100)
 */
export function calculatePasswordStrength(password) {
    if (!password) return 0;

    let strength = 0;

    // Longitud
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 10;
    if (password.length >= 16) strength += 10;

    // Complejidad
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;

    return Math.min(strength, 100);
}