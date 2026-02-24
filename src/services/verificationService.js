import api from './api';

export const sendVerificationCode = async (phoneNumber, channel = 'sms') => {
    try {
        const response = await api.post('/api/verification/send', {
            phoneNumber,
            channel
        });

        if (response.data && response.data.success) {
            return {
                success: true,
                message: response.data.message || 'Código enviado exitosamente',
            };
        }

        return {
            success: false,
            error: response.data?.error || 'Error al enviar código',
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || 'Error al enviar código de verificación',
        };
    }
};

export const verifyCode = async (phoneNumber, code) => {
    try {
        const response = await api.post('/api/verification/check', {
            phoneNumber,
            code
        });

        if (response.data && response.data.success) {
            return {
                success: true,
                verified: response.data.verified === true,
            };
        }

        return {
            success: false,
            verified: false,
            error: response.data?.error || 'Código inválido',
        };
    } catch (error) {
        return {
            success: false,
            verified: false,
            error: error.response?.data?.error || 'Error al verificar código',
        };
    }
};

export const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
};

export const validateCode = (code) => {
    const codeRegex = /^[0-9]{4,6}$/;
    return codeRegex.test(code);
};

export const formatPhoneNumber = (phoneNumber, countryCode = '52') => {
    let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');

    if (cleaned.startsWith('+')) {
        return cleaned;
    }

    if (cleaned.startsWith(countryCode)) {
        return '+' + cleaned;
    }

    return '+' + countryCode + cleaned;
};

export const saveVerifiedPhone = (phoneNumber) => {
    localStorage.setItem('verifiedPhone', phoneNumber);
    localStorage.setItem('phoneVerifiedAt', new Date().toISOString());
};

export const getVerifiedPhone = () => {
    return localStorage.getItem('verifiedPhone');
};

export const clearVerification = () => {
    localStorage.removeItem('verifiedPhone');
    localStorage.removeItem('phoneVerifiedAt');
};

export const hasValidVerification = () => {
    const phone = getVerifiedPhone();
    const verifiedAt = localStorage.getItem('phoneVerifiedAt');

    if (!phone || !verifiedAt) {
        return false;
    }

    const verifiedTime = new Date(verifiedAt).getTime();
    const now = new Date().getTime();
    const hoursPassed = (now - verifiedTime) / (1000 * 60 * 60);

    return hoursPassed < 24;
};