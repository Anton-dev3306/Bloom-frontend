const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

const fileUploadService = {
    /**
     * Subir imagen al backend
     */
    async uploadImage(file, chatId) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('chatId', chatId);

        try {
            const response = await fetch(`${API_URL}/api/files/upload/image`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error subiendo imagen');
            }

            return data;
        } catch (error) {
            console.error('Error subiendo imagen:', error);
            throw error;
        }
    },

    /**
     * Subir archivo genérico
     */
    async uploadFile(file, chatId) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('chatId', chatId);

        try {
            const response = await fetch(`${API_URL}/api/files/upload/file`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error subiendo archivo');
            }

            return data;
        } catch (error) {
            console.error('Error subiendo archivo:', error);
            throw error;
        }
    },

    async uploadVideo(file, chatId) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('chatId', chatId);

        try {
            const response = await fetch(`${API_URL}/api/files/upload/video`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error subiendo video');
            }

            return data;
        } catch (error) {
            console.error('Error subiendo video:', error);
            throw error;
        }
    },

    async uploadAudio(file, chatId) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('chatId', chatId);
        try {
            const response = await fetch(`${API_URL}/api/files/upload/audio`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error subiendo audio');
            return data;
        } catch (error) {
            console.error('Error subiendo audio:', error);
            throw error;
        }
    },

};




export default fileUploadService;