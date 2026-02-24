'use client';

import { useEffect, useState } from 'react';
import { getInitials } from '@/utils/helpers';
import StatusIndicator from '@/components/common/StatusIndicator';
import { useUserPresence } from '@/providers/UserPresenceProvider';
import SearchBar from '@/components/common/SearchBar';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

export default function ChatList({ chats, onChatClick, currentChatId }) {
    const { isUserOnline, getUserProfilePicture, initProfilePictures } = useUserPresence();
    const [filteredChats, setFilteredChats] = useState(chats || []);

    useEffect(() => {
        if (!chats || chats.length === 0) return;
        const picturesMap = {};
        chats.forEach((chat) => {
            if (chat.otherUserId && chat.otherUserProfilePictureUrl !== undefined) {
                picturesMap[Number(chat.otherUserId)] = chat.otherUserProfilePictureUrl || null;
            }
        });
        if (Object.keys(picturesMap).length > 0) {
            initProfilePictures(picturesMap);
        }
    }, [chats, initProfilePictures]);

    useEffect(() => {
        setFilteredChats(chats || []);
    }, [chats]);

    if (!chats || chats.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">No hay chats aún</p>
                <p className="text-xs text-gray-400">Agrega contactos para iniciar conversaciones</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Barra de búsqueda */}
            <SearchBar
                items={chats}
                onFiltered={setFilteredChats}
                filterKey="chatName"
                placeholder="Buscar chat..."
            />

            {/*  Lista filtrada */}
            <div className="overflow-y-auto flex-1">
                {filteredChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                        <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-sm text-gray-400">No se encontraron chats</p>
                    </div>
                ) : (
                    filteredChats.map((chat) => {
                        const isActive = currentChatId === chat.chatId;
                        const chatInitials = getInitials(chat.chatName || 'Chat');
                        const isGroup = chat.chatType === 'group';

                        const otherUserId = chat.otherUserId;
                        const isContactOnline = !isGroup && otherUserId ? isUserOnline(otherUserId) : false;

                        const profilePicUrl = !isGroup && otherUserId
                            ? getUserProfilePicture(otherUserId)
                            : null;
                        const groupPicUrl = isGroup ? chat.chatProfilePictureUrl : null;
                        const fullProfilePicUrl = profilePicUrl
                            ? API_BASE_URL + profilePicUrl
                            : groupPicUrl
                                ? API_BASE_URL + groupPicUrl
                                : null;

                        return (
                            <div
                                key={chat.chatId}
                                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-gray-100 ${
                                    isActive
                                        ? 'bg-blue-50 border-l-4 border-l-blue-500'
                                        : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                                }`}
                                onClick={() => onChatClick(chat.chatId, chat.chatName || 'Chat')}
                            >
                                <div className="relative flex-shrink-0">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold overflow-hidden ${
                                        isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {fullProfilePicUrl ? (
                                            <img src={fullProfilePicUrl} alt={chat.chatName || 'Chat'} className="w-full h-full object-cover" />
                                        ) : (
                                            chatInitials
                                        )}
                                    </div>

                                    {isGroup && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center border border-white">
                                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </div>
                                    )}

                                    {!isGroup && (
                                        <div className="absolute -bottom-0.5 -right-0.5">
                                            <StatusIndicator isOnline={isContactOnline} size="md" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline justify-between mb-0.5">
                                        <h6 className={`text-sm font-semibold truncate ${
                                            isActive ? 'text-blue-600' : 'text-gray-900'
                                        }`}>
                                            {chat.chatName || 'Chat'}
                                        </h6>
                                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                            {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">
                                        {isGroup ? 'Chat grupal' : 'Chat privado'}
                                    </p>
                                </div>
                            </div>

                        );
                    })
                )}
            </div>
        </div>
    );
}