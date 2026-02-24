'use client';

import { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import GroupMembersPanel from './GroupMembersPanel';
import { getInitials } from '@/utils/helpers';
import StatusIndicator from '@/components/common/StatusIndicator';
import { useUserPresence } from '@/providers/UserPresenceProvider';
import fileUploadService from '@/services/fileUploadService';
import Image from 'next/image';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

export default function ChatInterface({
                                          currentChat,
                                          messages,
                                          onSendMessage,
                                          onCloseChat,
                                          currentUserId,
                                          onChatUpdate
                                      }) {
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [isScrolledUp, setIsScrolledUp] = useState(false);
    const [pendingMessages, setPendingMessages] = useState([]);
    const [showMembersPanel, setShowMembersPanel] = useState(false);

    const { isUserOnline, getUserProfilePicture } = useUserPresence();

    const isGroup = currentChat?.chatType === 'group';
    //Busqueda de palabras en el chat
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(0);
    const searchInputRef = useRef(null);
    const scrollToBottom = (behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        if (messages.length > 0 && !isScrolledUp) {
            scrollToBottom();
        }
    }, [messages, isScrolledUp]);

    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
            setIsScrolledUp(!isAtBottom);
        }
    };

    const [localMessages, setLocalMessages] = useState(messages);

// Sincronizar cuando lleguen mensajes nuevos por props (WebSocket)
    useEffect(() => {
        setLocalMessages(messages);
    }, [messages]);

    const handleSendFile = async (file, caption) => {
        if (!currentChat || !currentUserId) return;

        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isAudio = file.type.startsWith('audio/');
        const tempId = `pending-${Date.now()}`;

        let localPreview = null;
        if (isImage) {
            localPreview = URL.createObjectURL(file);
        }

        const pendingType = isImage ? 'IMAGE_PENDING' : isVideo ? 'VIDEO_PENDING' :  isAudio ? 'AUDIO_PENDING' : 'FILE';

        const pendingMsg = {
            messageId: tempId,
            tempId,
            senderId: currentUserId,
            content: caption || null,
            messageType: pendingType,
            sentAt: new Date().toISOString(),
            metadata: {
                localPreview,
                fileName: file.name,
                fileSize: file.size,
            },
        };

        setPendingMessages(prev => [...prev, pendingMsg]);

        try {
            let uploadResponse;
            if (isImage) {
                uploadResponse = await fileUploadService.uploadImage(file, currentChat.chatId);
            } else if (isVideo) {
                uploadResponse = await fileUploadService.uploadVideo(file, currentChat.chatId);
            }
            else if (isAudio) {
                uploadResponse = await fileUploadService.uploadAudio(file, currentChat.chatId);
            }
            else {
                uploadResponse = await fileUploadService.uploadFile(file, currentChat.chatId);
            }

            if (!uploadResponse.success) {
                throw new Error(uploadResponse.error || 'Error subiendo archivo');
            }

            const messageType = isImage ? 'IMAGE' : isVideo ? 'VIDEO' : isAudio ? 'AUDIO' : 'FILE';
            onSendMessage(caption || null, messageType, uploadResponse.metadata);

            setPendingMessages(prev => prev.filter(m => m.tempId !== tempId));

            if (localPreview) {
                setTimeout(() => URL.revokeObjectURL(localPreview), 3000);
            }
        } catch (error) {
            setPendingMessages(prev => prev.filter(m => m.tempId !== tempId));
            if (localPreview) URL.revokeObjectURL(localPreview);
            alert('Error al enviar el archivo. Por favor, intenta nuevamente.');
        }
    };

    useEffect(() => {
        if (currentChat) {
            setTimeout(() => scrollToBottom('auto'), 100);
            setIsScrolledUp(false);
            setPendingMessages([]);
            setShowMembersPanel(false);
            closeSearch();
        }
    }, [currentChat?.chatId]);

    //Logica de busqueda de mensajes en el chat
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setCurrentResultIndex(0);
            return;
        }
        const query = searchQuery.toLowerCase();
        const results = messages
            .map((msg, index) => ({ index, messageId: msg.messageId }))
            .filter((_, i) => messages[i].content?.toLowerCase().includes(query));
        setSearchResults(results);
        setCurrentResultIndex(results.length > 0 ? 0 : -1);
    }, [searchQuery, messages]);

    useEffect(() => {
        if (searchResults.length > 0 && currentResultIndex >= 0) {
            const targetMsg = searchResults[currentResultIndex];
            const el = document.getElementById(`msg-${targetMsg.messageId}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [currentResultIndex, searchResults]);

    const navigateSearch = (direction) => {
        if (searchResults.length === 0) return;
        if (direction === 'next') {
            setCurrentResultIndex((prev) => (prev + 1) % searchResults.length);
        } else {
            setCurrentResultIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
        }
    };

    const closeSearch = () => {
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
    };
    if (!currentChat) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                <div className="text-center max-w-md">
                    <div className="mb-6 relative inline-block">
                        <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-4xl mb-6 shadow-sm">
                            <Image
                                src="/bloom-logo.jpg"
                                alt="Bloom"
                                width={108}
                                height={108}
                                className="object-contain"
                            />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Bienvenido a Bloom</h3>
                    <p className="text-gray-500 mb-6">Selecciona un chat para comenzar a conversar</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 text-sm text-gray-400">
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>Mensajería en tiempo real</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Privado y seguro</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    //Chat privado: información de otros usuarios
    const otherUserId = currentChat?.otherUserId;
    const isContactOnline = otherUserId ? isUserOnline(otherUserId) : false;
    const otherUserPic = otherUserId ? getUserProfilePicture(otherUserId) : null;
    const fullPicUrl = otherUserPic ? API_BASE_URL + otherUserPic : null;

    //Chat grupal: foto del chat
    const groupPicUrl = currentChat?.chatProfilePictureUrl
        ? API_BASE_URL + currentChat.chatProfilePictureUrl
        : null;

    //URL de avatar a utilizar (privado: otro usuario, grupo: foto de grupo)
    const headerAvatarUrl = isGroup ? groupPicUrl : fullPicUrl;

    return (
        <div className="w-full h-full flex flex-col bg-white relative">
            {/* Header */}
            <header className="flex-shrink-0 bg-white border-b border-gray-200 shadow-md p-4 min-h-[80px] flex items-center justify-between">
                <div
                    className={`flex items-center gap-3 flex-1 min-w-0 ${isGroup ? 'cursor-pointer' : ''}`}
                    onClick={() => isGroup && setShowMembersPanel(true)}
                >
                    <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold truncate  border-blue-200 overflow-hidden">
                            {headerAvatarUrl ? (
                                <img src={headerAvatarUrl} alt={currentChat.chatName} className="w-full h-full object-cover" />
                            ) : isGroup ? (
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            ) : (
                                getInitials(currentChat.chatName)
                            )}
                        </div>
                        {/* Indicador de estado solo para chats privados */}
                        {!isGroup && (
                            <div className="absolute -bottom-0.5 -right-0.5">
                                <StatusIndicator isOnline={isContactOnline} size="md" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h6 className="text-gray-900 font-semibold truncate">{currentChat.chatName}</h6>
                        <div className="flex items-center gap-1.5">
                            <small className="text-gray-500 text-xs">
                                {isGroup
                                    ? 'Toca para ver miembros'
                                    : (isContactOnline ? 'En línea' : 'Desconectado')
                                }
                            </small>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {isGroup && (
                        <button
                            onClick={() => setShowMembersPanel(true)}
                            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                            title="Miembros"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setShowSearch(!showSearch);
                            if (!showSearch) setTimeout(() => searchInputRef.current?.focus(), 100);
                            else closeSearch();
                        }}
                        className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors" title="Buscar">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                    <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors" title="Llamada">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </button>
                    <button onClick={onCloseChat} className="w-9 h-9 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors" title="Cerrar">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Barra de busqueda */}
            {showSearch && (
                <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 shadow-sm">
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar en la conversación..."
                        className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') navigateSearch('next');
                            if (e.key === 'Escape') closeSearch();
                        }}
                    />
                    {searchResults.length > 0 && (
                        <span className="text-xs text-gray-500 flex-shrink-0">
                {currentResultIndex + 1}/{searchResults.length}
            </span>
                    )}
                    {searchResults.length > 0 && (
                        <div className="flex gap-1 flex-shrink-0">
                            <button onClick={() => navigateSearch('prev')} className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </button>
                            <button onClick={() => navigateSearch('next')} className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    )}
                    <button onClick={closeSearch} className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}


            {/* Area de mensajes */}
            <main
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto bg-gray-50"
                style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')" }}
            >
                {messages.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                            <div className="bg-white rounded-full p-6 mb-4 shadow-md inline-block">
                                <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-base font-medium text-gray-600">No hay mensajes aún</p>
                            <p className="text-sm text-gray-400 mt-1">Envía un mensaje para comenzar</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-4">
                        {(() => {
                            const allMessages = (() => {
                                const combined = [...messages, ...pendingMessages];
                                const seen = new Set();
                                return combined.filter(m => {
                                    const id = m.messageId || m.tempId;
                                    if (seen.has(id)) return false;
                                    seen.add(id);
                                    return true;
                                });
                            })();
                            return allMessages.map((message, index) => {
                                const prevMessage = index > 0 ? allMessages[index - 1] : null;
                                const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;

                                // Crear la URL de la imagen del remitente para los chats grupales
                                let senderPicUrl = null;
                                if (isGroup && message.senderId !== currentUserId) {
                                    if (message.senderProfilePictureUrl) {
                                        senderPicUrl = API_BASE_URL + message.senderProfilePictureUrl;
                                    }
                                } else if (!isGroup && message.senderId !== currentUserId) {
                                    senderPicUrl = fullPicUrl;
                                }
                                const isHighlighted = searchQuery && message.content?.toLowerCase().includes(searchQuery.toLowerCase());
                                const isCurrentResult = searchResults[currentResultIndex]?.messageId === message.messageId;
                                return (
                                    <div key={message.messageId || message.tempId || `msg-${index}`}
                                        id={`msg-${message.messageId}`}
                                        className={`transition-colors duration-300 rounded-lg ${isCurrentResult ? 'bg-yellow-100' : isHighlighted ? 'bg-yellow-50' : ''}`}>
                                    <MessageBubble
                                        message={message}
                                        isOwn={message.senderId === currentUserId}
                                        showAvatar={showAvatar}
                                        chatName={currentChat.chatName}
                                        contactProfilePicUrl={senderPicUrl}
                                        isGroup={isGroup}
                                        currentUserId={currentUserId}
                                        onMessageDelete={(id) => {
                                            setLocalMessages(prev => prev.filter(m => m.messageId !== id));
                                        }}
                                        onReactionUpdate={(id, updatedReactions) => {
                                            setLocalMessages(prev => prev.map(m =>
                                                m.messageId === id ? { ...m, reactions: updatedReactions } : m
                                            ));
                                        }}
                                    /> </div>
                                );
                            });
                        })()}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {isScrolledUp && messages.length > 0 && (
                    <button
                        onClick={() => {
                            scrollToBottom();
                            setIsScrolledUp(false);
                        }}
                        className="fixed bottom-24 right-8 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all z-10"
                        title="Ir al final"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </button>
                )}
            </main>

            <MessageInput onSendMessage={onSendMessage} onSendFile={handleSendFile} />

            {/* Group Members Panel */}
            {showMembersPanel && isGroup && (
                <GroupMembersPanel
                    chat={currentChat}
                    currentUserId={currentUserId}
                    onClose={() => setShowMembersPanel(false)}
                    onChatUpdate={onChatUpdate}
                />
            )}
        </div>
    );
}