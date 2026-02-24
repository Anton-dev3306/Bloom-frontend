import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8082/ws';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.socket = null;
        this.connected = false;
        this.currentChatSubscription = null;
        this.presenceSubscription = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 2000;
        this.onConnectCallback = null;
        this.onDisconnectCallback = null;
        this.onErrorCallback = null;
        this.userId = null;
        this.profileUpdateSubscription = null;
    }

    onConnect(callback) {
        this.onConnectCallback = callback;
    }

    onDisconnect(callback) {
        this.onDisconnectCallback = callback;
    }

    onError(callback) {
        this.onErrorCallback = callback;
    }

    //Settear userId antes de conectar
    setUserId(userId) {
        this.userId = userId;
    }

    connect(onSuccess, onError) {
        return new Promise((resolve, reject) => {
            if (this.connected && this.stompClient) {
                if (onSuccess) onSuccess();
                if (this.onConnectCallback) this.onConnectCallback();
                resolve();
                return;
            }

            try {
                this.socket = new SockJS(WS_URL);
                this.stompClient = Stomp.over(this.socket);
                this.stompClient.debug = () => {};

                this.stompClient.connect(
                    {},
                    (frame) => {
                        this.connected = true;
                        this.reconnectAttempts = 0;
                        console.log('✅ WebSocket conectado con userId:', this.userId);

                        // Se notifica al servidor que el usuario se conectó
                        if (this.userId) {
                            setTimeout(() => {
                                this.notifyUserConnect();
                            }, 500); // Pequeño delay para asegurar que la conexión está lista
                        }

                        if (onSuccess) onSuccess();
                        if (this.onConnectCallback) this.onConnectCallback();
                        resolve();
                    },
                    (error) => {
                        this.connected = false;
                        console.error('Error de conexión WebSocket:', error);
                        if (onError) onError(error);
                        if (this.onErrorCallback) this.onErrorCallback(error);
                        this.attemptReconnect();
                        reject(error);
                    }
                );
            } catch (error) {
                console.error('Error iniciando WebSocket:', error);
                if (onError) onError(error);
                if (this.onErrorCallback) this.onErrorCallback(error);
                this.attemptReconnect();
                reject(error);
            }
        });
    }

    notifyUserConnect() {
        if (!this.stompClient || !this.connected || !this.userId) {
            console.warn('⚠No se puede notificar conexión: WebSocket no listo');
            return;
        }

        try {
            // Generar un sessionId único (usamos timestamp + userId)
            const sessionId = `session-${this.userId}-${Date.now()}`;

            const connectData = {
                userId: this.userId,
                sessionId: sessionId
            };

            this.stompClient.send(
                '/app/user.connect',
                {},
                JSON.stringify(connectData)
            );

        } catch (error) {
            console.error('Error notificando conexión:', error);
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Máximo de intentos de reconexión alcanzado');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectDelay * this.reconnectAttempts, 10000);

        setTimeout(() => {
            this.connect().catch(() => {});
        }, delay);
    }

    disconnect() {

        if (this.profileUpdateSubscription) {
            try { this.profileUpdateSubscription.unsubscribe(); this.profileUpdateSubscription = null; } catch (e) {}
        }

        // Desuscribir de presencia
        if (this.presenceSubscription) {
            try {
                this.presenceSubscription.unsubscribe();
                this.presenceSubscription = null;
            } catch (error) {
                console.error('Error al desuscribirse de presencia:', error);
            }
        }

        // Desuscribir de chat
        if (this.currentChatSubscription) {
            try {
                this.currentChatSubscription.unsubscribe();
                this.currentChatSubscription = null;
            } catch (error) {
                console.error('Error al desuscribirse de chat:', error);
            }
        }

        if (this.stompClient && this.connected) {
            this.stompClient.disconnect(() => {
                this.connected = false;
                console.log(' WebSocket desconectado');
                if (this.onDisconnectCallback) {
                    this.onDisconnectCallback();
                }
            });
        }
    }

    subscribeToChat(chatId, onMessageReceived) {
        if (!this.stompClient || !this.connected) {
            this.connect().then(() => {
                this.subscribeToChat(chatId, onMessageReceived);
            }).catch((error) => {
                console.error('Error al conectar para suscripción:', error);
            });
            return;
        }

        if (this.currentChatSubscription) {
            try {
                this.currentChatSubscription.unsubscribe();
            } catch (error) {
                console.error('Error al desuscribirse del chat anterior:', error);
            }
        }

        const topic = `/topic/chat.${chatId}`;

        try {
            this.currentChatSubscription = this.stompClient.subscribe(topic, (message) => {
                try {
                    const payload = JSON.parse(message.body);
                    onMessageReceived(payload);
                } catch (error) {
                    console.error('Error procesando mensaje del chat:', error);
                }
            });
        } catch (error) {
            console.error('Error suscribiéndose al chat:', error);
        }
    }

    unsubscribeFromChat(chatId) {
        if (this.currentChatSubscription) {
            try {
                this.currentChatSubscription.unsubscribe();
                this.currentChatSubscription = null;
            } catch (error) {
                console.error('Error al desuscribirse del chat:', error);
            }
        }
    }

    subscribeToPresence(onPresenceUpdate) {
        if (!this.stompClient || !this.connected) {
            this.connect().then(() => {
                this.subscribeToPresence(onPresenceUpdate);
            }).catch((error) => {
                console.error('Error al conectar para presencia:', error);
            });
            return;
        }

        // Desuscribir si ya existe
        if (this.presenceSubscription) {
            try {
                this.presenceSubscription.unsubscribe();
            } catch (error) {
                console.error('Error al desuscribirse de presencia anterior:', error);
            }
        }

        const topic = '/topic/user.presence';

        try {
            this.presenceSubscription = this.stompClient.subscribe(topic, (message) => {
                try {
                    const payload = JSON.parse(message.body);
                    onPresenceUpdate(payload);
                } catch (error) {
                    console.error('Error procesando actualización de presencia:', error);
                }
            });
            console.log(`Suscrito a presencia: ${topic}`);
        } catch (error) {
            console.error('Error suscribiéndose a presencia:', error);
        }
    }

    unsubscribeFromPresence() {
        if (this.presenceSubscription) {
            try {
                this.presenceSubscription.unsubscribe();
                this.presenceSubscription = null;
            } catch (error) {
                console.error('Error al desuscribirse de presencia:', error);
            }
        }
    }

    subscribeToProfileUpdates(onProfileUpdate) {
        if (!this.stompClient || !this.connected) {
            this.connect().then(() => {
                this.subscribeToProfileUpdates(onProfileUpdate);
            }).catch((error) => {
                console.error('Error al conectar para profile updates:', error);
            });
            return;
        }

        if (this.profileUpdateSubscription) {
            try {
                this.profileUpdateSubscription.unsubscribe();
            } catch (error) {}
        }

        const topic = '/topic/user.profileUpdate';

        try {
            this.profileUpdateSubscription = this.stompClient.subscribe(topic, (message) => {
                try {
                    const payload = JSON.parse(message.body);
                    onProfileUpdate(payload);
                } catch (error) {
                    console.error('Error procesando actualización de perfil:', error);
                }
            });
        } catch (error) {
            console.error('Error suscribiéndose a profile updates:', error);
        }
    }

    unsubscribeFromProfileUpdates() {
        if (this.profileUpdateSubscription) {
            try {
                this.profileUpdateSubscription.unsubscribe();
                this.profileUpdateSubscription = null;
            } catch (error) {}
        }
    }

    sendMessage(chatId, senderId, content, messageType = 'TEXT', metadata = null) {
        if (!this.stompClient || !this.connected) {
            console.error('No se puede enviar mensaje: WebSocket no conectado');
            return false;
        }

        const messageData = {
            chatId,
            senderId,
            content,
            messageType,
            metadata
        };

        try {
            this.stompClient.send(
                '/app/chat.sendMessage',
                {},
                JSON.stringify(messageData)
            );
            return true;
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            return false;
        }
    }

    sendChatMessage(chatId, senderId, content, messageType = 'TEXT') {
        return this.sendMessage(chatId, senderId, content, messageType);
    }

    sendTypingNotification(chatId, userId, username) {
        if (!this.stompClient || !this.connected) {
            return;
        }

        try {
            this.stompClient.send(
                '/app/chat.typing',
                {},
                JSON.stringify({ chatId, userId, username })
            );
        } catch (error) {
            console.error('Error enviando notificación de escritura:', error);
        }
    }

    sendJoinNotification(chatId, userId, username) {
        if (!this.stompClient || !this.connected) {
            return;
        }

        try {
            this.stompClient.send(
                '/app/chat.join',
                {},
                JSON.stringify({ chatId, userId, username })
            );
        } catch (error) {
            console.error('Error enviando notificación de unión:', error);
        }
    }

    sendLeaveNotification(chatId, userId, username) {
        if (!this.stompClient || !this.connected) {
            return;
        }

        try {
            this.stompClient.send(
                '/app/chat.leave',
                {},
                JSON.stringify({ chatId, userId, username })
            );
        } catch (error) {
            console.error('Error enviando notificación de salida:', error);
        }
    }

    isConnected() {
        return this.connected && this.stompClient !== null;
    }
}

const websocketService = new WebSocketService();
export default websocketService;