'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import websocketService from '@/services/websocketService';

const UserPresenceContext = createContext({
    onlineUsers: new Set(),
    isUserOnline: () => false,
    presenceLoaded: false,
    userProfilePictures: {},
    getUserProfilePicture: () => null,
    updateLocalProfilePicture: () => {},
});

export function UserPresenceProvider({ children }) {
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [presenceLoaded, setPresenceLoaded] = useState(false);
    const [userProfilePictures, setUserProfilePictures] = useState({});
    const subscribedRef = useRef(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;

        const loadInitialOnlineUsers = async () => {
            try {
                const response = await fetch('http://localhost:8082/api/presence/online/ids');
                const data = await response.json();

                if (data.success && data.onlineUserIds) {
                    const initialOnlineUsers = new Set(data.onlineUserIds.map(id => Number(id)));
                    if (mountedRef.current) {
                        setOnlineUsers(initialOnlineUsers);
                    }
                }
            } catch (error) {
                console.error('Error cargando usuarios online:', error);
            }
        };

        const subscribeWhenReady = () => {
            if (subscribedRef.current) return;

            if (!websocketService.isConnected()) {
                setTimeout(subscribeWhenReady, 500);
                return;
            }

            // Suscripción a presencia (online/offline)
            websocketService.subscribeToPresence((statusUpdate) => {
                const { userId, isOnline } = statusUpdate;
                if (!mountedRef.current) return;

                setOnlineUsers((prev) => {
                    const next = new Set(prev);
                    if (isOnline) {
                        next.add(Number(userId));
                    } else {
                        next.delete(Number(userId));
                    }
                    return next;
                });
            });

            websocketService.subscribeToProfileUpdates((update) => {
                const { userId, profilePictureUrl } = update;
                if (!mountedRef.current) return;

                console.log(`📷 Foto actualizada para usuario ${userId}:`, profilePictureUrl);
                setUserProfilePictures((prev) => ({
                    ...prev,
                    [Number(userId)]: profilePictureUrl || null,
                }));
            });

            subscribedRef.current = true;
            if (mountedRef.current) setPresenceLoaded(true);
        };

        loadInitialOnlineUsers().then(() => {
            subscribeWhenReady();
        });

        return () => {
            mountedRef.current = false;
            if (subscribedRef.current) {
                websocketService.unsubscribeFromPresence();
                websocketService.unsubscribeFromProfileUpdates();
                subscribedRef.current = false;
            }
        };
    }, []);

    const isUserOnline = useCallback((userId) => {
        if (!userId) return false;
        return onlineUsers.has(Number(userId));
    }, [onlineUsers]);

    const getUserProfilePicture = useCallback((userId) => {
        if (!userId) return null;
        const pic = userProfilePictures[Number(userId)];
        return pic !== undefined ? pic : null;
    }, [userProfilePictures]);

    const initProfilePictures = useCallback((picturesMap) => {
        setUserProfilePictures((prev) => ({ ...prev, ...picturesMap }));
    }, []);

    const updateLocalProfilePicture = useCallback((userId, url) => {
        setUserProfilePictures((prev) => ({
            ...prev,
            [Number(userId)]: url || null,
        }));
    }, []);

    const value = {
        onlineUsers,
        isUserOnline,
        presenceLoaded,
        userProfilePictures,
        getUserProfilePicture,
        initProfilePictures,
        updateLocalProfilePicture,
    };

    return (
        <UserPresenceContext.Provider value={value}>
            {children}
        </UserPresenceContext.Provider>
    );
}

export function useUserPresence() {
    const context = useContext(UserPresenceContext);
    if (!context) {
        throw new Error('useUserPresence debe usarse dentro de UserPresenceProvider');
    }
    return context;
}