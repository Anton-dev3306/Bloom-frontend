import { useState, useEffect, useCallback, useRef } from 'react';
import websocketService from '@/services/websocketService';

export default function useWebSocket(userId) {
    const [connected, setConnected] = useState(false);
    const [currentChatId, setCurrentChatId] = useState(null);
    const messageHandlerRef = useRef(null);

    // ✅ Configurar userId en el servicio
    useEffect(() => {
        if (userId) {
            websocketService.setUserId(userId);
        }
    }, [userId]);

    // Conectar al WebSocket cuando el componente se monta
    useEffect(() => {
        if (!userId) return;

        const handleConnect = () => {
            console.log('✅ WebSocket conectado');
            setConnected(true);
        };

        const handleDisconnect = () => {
            console.log('🔌 WebSocket desconectado');
            setConnected(false);
        };

        const handleError = (error) => {
            console.error('❌ Error WebSocket:', error);
            setConnected(false);
        };

        // Registrar callbacks
        websocketService.onConnect(handleConnect);
        websocketService.onDisconnect(handleDisconnect);

        // Conectar
        websocketService.connect(handleConnect, handleError);

        // Cleanup al desmontar
        return () => {
            websocketService.disconnect();
        };
    }, [userId]);

    // Resto del código permanece igual...
    const subscribeToChat = useCallback((chatId, onMessageReceived) => {
        if (!chatId || !onMessageReceived) return;

        messageHandlerRef.current = onMessageReceived;
        setCurrentChatId(chatId);

        websocketService.subscribeToChat(chatId, (message) => {
            if (messageHandlerRef.current) {
                messageHandlerRef.current(message);
            }
        });
    }, []);

    const unsubscribeFromChat = useCallback(() => {
        if (currentChatId) {
            websocketService.unsubscribeFromChat(currentChatId);
            setCurrentChatId(null);
            messageHandlerRef.current = null;
        }
    }, [currentChatId]);

    const sendMessage = useCallback((chatId, content, messageType = 'TEXT', metadata = null) => {
        if (!userId) {
            console.error('❌ No hay userId para enviar mensaje');
            return;
        }

        websocketService.sendMessage(chatId, userId, content, messageType, metadata);
    }, [userId]);

    return {
        connected,
        subscribeToChat,
        unsubscribeFromChat,
        sendMessage,
    };
}