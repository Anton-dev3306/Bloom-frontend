'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import useChat from '@/hooks/useChat';
import useWebSocket from '@/hooks/useWebSocket';
import Sidebar from '@/components/layout/Sidebar';
import ChatInterface from '@/components/chat/ChatInterface';
import { UserPresenceProvider } from '@/providers/UserPresenceProvider';

export default function ChatPage() {
    const router = useRouter();
    const [userData, setUserData] = useState(null);

    const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
    const {
        chats,
        contacts,
        currentChat,
        setCurrentChat,
        messages,
        openChat,
        closeChat,
        startChat,
        addContact,
        deleteContact,
        addMessage,
        createGroupChat,
    } = useChat(user?.userId);

    const { connected, subscribeToChat, unsubscribeFromChat, sendMessage } = useWebSocket(user?.userId);

    const activeUser = userData || user;

    useEffect(() => {
        if (user && !userData) {
            setUserData(user);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (currentChat && connected) {
            subscribeToChat(currentChat.chatId, (message) => {
                if (
                    message.senderId === user?.userId &&
                    (message.messageType === 'IMAGE' || message.messageType === 'FILE' || message.messageType === 'VIDEO')
                ) {
                    return;
                }
                addMessage(message);
            });

            return () => {
                unsubscribeFromChat();
            };
        }
    }, [currentChat, connected, subscribeToChat, unsubscribeFromChat, addMessage, user?.userId]);

    const handleSendMessage = (content, messageType = 'TEXT', metadata = null) => {
        if (!currentChat || !user) return;

        try {
            sendMessage(currentChat.chatId, content, messageType, metadata);

            if (messageType === 'IMAGE' || messageType === 'FILE' || messageType === 'VIDEO') {
                addMessage({
                    messageId: `local-${Date.now()}`,
                    chatId: currentChat.chatId,
                    senderId: user.userId,
                    content: content,
                    messageType: messageType,
                    sentAt: new Date().toISOString(),
                    metadata: metadata || {},
                });
            }
        } catch (error) {
            alert('Error al enviar el mensaje. Intenta nuevamente.');
        }
    };

    const handleStartChat = async (contactUserId, contactName) => {
        const result = await startChat(contactUserId, contactName);
        if (!result.success) {
            alert(result.error || 'Error al iniciar el chat');
        }
    };

    const handleAddContact = async (username, alias) => {
        const result = await addContact(username, alias);
        if (result.success) {
            alert('Contacto agregado exitosamente');
        } else {
            alert(result.error || 'Error al agregar contacto');
        }
    };

    const handleDeleteContact = async (contactEntryId) => {
        const result = await deleteContact(contactEntryId);
        if (!result.success) alert(result.error || 'Error al eliminar el contacto');
    };

    const handleUserUpdate = (updatedUser) => {
        setUserData(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const handleLogout = async () => {
        await logout();
    };

    if (authLoading) {
        return (
            <div className="loading-screen">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-white text-lg font-medium">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <UserPresenceProvider>
            <main className="app-container">
                <Sidebar
                    user={activeUser}
                    chats={chats}
                    contacts={contacts}
                    currentChatId={currentChat?.chatId}
                    onChatClick={openChat}
                    onStartChat={handleStartChat}
                    onAddContact={handleAddContact}
                    onDeleteContact={handleDeleteContact}
                    onCreateGroup={createGroupChat}
                    onLogout={handleLogout}
                    onUserUpdate={handleUserUpdate}
                />

                <section className="chat-section">
                    <ChatInterface
                        currentChat={currentChat}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        onCloseChat={closeChat}
                        currentUserId={user.userId}
                        onChatUpdate={(updatedChat) => setCurrentChat(updatedChat)}
                    />
                </section>

                <div id="alertContainer" className="fixed top-4 right-4 z-50 space-y-2"></div>
            </main>
        </UserPresenceProvider>
    );
}