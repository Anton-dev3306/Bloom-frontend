'use client';

import { useState, useEffect, useRef } from 'react';
import { getInitials } from '@/utils/helpers';
import StatusIndicator from '@/components/common/StatusIndicator';
import { useUserPresence } from '@/providers/UserPresenceProvider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

export default function GroupMembersPanel({ chat, currentUserId, onClose, onChatUpdate }) {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingPic, setUploadingPic] = useState(false);

    const [showAddMember, setShowAddMember] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [contactsLoading, setContactsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [addingUserId, setAddingUserId] = useState(null);
    const [addMessage, setAddMessage] = useState(null);
    const [deletingGroup, setDeletingGroup] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const fileInputRef = useRef(null);
    const { isUserOnline } = useUserPresence();

    useEffect(() => {
        if (chat?.chatId) loadParticipants();
    }, [chat?.chatId]);

    const loadParticipants = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/chats/${chat.chatId}/participants`);
            const data = await response.json();
            if (data.success && data.participants) {
                setParticipants(data.participants.filter(p => p.active !== false));
            }
        } catch (error) {
            console.error('Error cargando participantes:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadContacts = async () => {
        if (!currentUserId) return;
        setContactsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/contacts/owner/${currentUserId}`);
            const data = await response.json();
            if (data.success && data.contacts) {
                setContacts(data.contacts);
            }
        } catch (error) {
            console.error('Error cargando contactos:', error);
        } finally {
            setContactsLoading(false);
        }
    };

    const handleOpenAddMember = () => {
        setShowAddMember(true);
        setSearchQuery('');
        setAddMessage(null);
        loadContacts();
    };

    const handleCloseAddMember = () => {
        setShowAddMember(false);
        setSearchQuery('');
        setAddMessage(null);
    };

    const handleAddMember = async (userId, displayName) => {
        setAddingUserId(userId);
        setAddMessage(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/chats/${chat.chatId}/participants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            const data = await response.json();
            if (data.success) {
                setAddMessage({ type: 'success', text: `${displayName} agregado al grupo` });
                await loadParticipants();
                setTimeout(() => setAddMessage(null), 3000);
            } else {
                setAddMessage({ type: 'error', text: data.error || 'Error al agregar miembro' });
            }
        } catch (error) {
            setAddMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setAddingUserId(null);
        }
    };

    const handleGroupPhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { alert('Solo se permiten imágenes'); return; }
        if (file.size > 5 * 1024 * 1024) { alert('La imagen no puede superar 5MB'); return; }

        setUploadingPic(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch(`${API_BASE_URL}/api/chats/${chat.chatId}/profile-picture`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.success && data.profilePictureUrl) {
                onChatUpdate?.({ ...chat, chatProfilePictureUrl: data.profilePictureUrl });
            } else {
                alert(data.error || 'Error subiendo foto');
            }
        } catch (error) {
            alert('Error al subir la foto');
        } finally {
            setUploadingPic(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteGroup = async () => {
        if (!confirm(`¿Eliminar el grupo "${chat.chatName}"? Se eliminarán todos los mensajes y participantes. Esta acción no se puede deshacer.`)) return;

        setDeletingGroup(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/chats/${chat.chatId}?userId=${currentUserId}`,
                { method: 'DELETE' }
            );
            const data = await response.json();
            if (data.success) {
                onChatDeleted?.();
            } else {
                alert(data.error || 'Error al eliminar el grupo');
            }
        } catch (error) {
            alert('Error de conexión');
        } finally {
            setDeletingGroup(false);
        }
    };

    // Contactos que ya están en el grupo (filtrar)
    const participantUserIds = new Set(participants.map(p => p.user?.userId));

    const filteredContacts = contacts.filter(c => {
        const uid = c.contact?.userId;
        if (!uid || participantUserIds.has(uid)) return false;
        const name = (c.alias || c.contact?.displayName || c.contact?.username || '').toLowerCase();
        return name.includes(searchQuery.toLowerCase());
    });

    const groupPicUrl = chat?.chatProfilePictureUrl
        ? API_BASE_URL + chat.chatProfilePictureUrl
        : null;

    return (
        <div className="absolute top-0 right-0 h-full w-[320px] z-50 flex flex-col bg-white shadow-xl"
             style={{ animation: 'slideInRight 0.25s ease-out' }}>

            {/* Header */}
            <header className="bg-white border-b border-gray-200 p-4 flex items-center gap-3 flex-shrink-0 shadow-sm">
                <button
                    onClick={showAddMember ? handleCloseAddMember : onClose}
                    className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showAddMember ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        )}
                    </svg>
                </button>
                <h2 className="text-gray-900 font-semibold text-lg">
                    {showAddMember ? 'Agregar miembro' : 'Info del grupo'}
                </h2>
            </header>

            {/* ✅ PANEL: Agregar miembro */}
            {showAddMember ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Mensaje de éxito/error */}
                    {addMessage && (
                        <div className={`mx-4 mt-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                            addMessage.type === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            {addMessage.text}
                        </div>
                    )}

                    {/* Búsqueda */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder=" Buscar contacto..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Lista de contactos */}
                    <div className="flex-1 overflow-y-auto p-2">
                        {contactsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <svg className="w-6 h-6 animate-spin text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                        ) : filteredContacts.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <svg className="w-10 h-10 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <p className="text-sm">
                                    {searchQuery ? 'Sin resultados' : 'Todos tus contactos ya están en el grupo'}
                                </p>
                            </div>
                        ) : (
                            filteredContacts.map((c) => {
                                const user = c.contact;
                                const displayName = c.alias || user?.displayName || user?.username || 'Usuario';
                                const picUrl = user?.profilePictureUrl ? API_BASE_URL + user.profilePictureUrl : null;
                                const isAdding = addingUserId === user?.userId;

                                return (
                                    <div
                                        key={c.contactEntryId || user?.userId}
                                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold overflow-hidden flex-shrink-0">
                                            {picUrl ? (
                                                <img src={picUrl} alt={displayName} className="w-full h-full object-cover" />
                                            ) : (
                                                getInitials(displayName)
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                                            <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAddMember(user?.userId, displayName)}
                                            disabled={isAdding}
                                            className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Agregar al grupo"
                                        >
                                            {isAdding ? (
                                                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            ) : (
                /* PANEL: Info del grupo (original) */
                <div className="flex-1 overflow-y-auto">
                    {/* Foto del grupo y nombre */}
                    <div className="flex flex-col items-center py-6 bg-gray-50 border-b border-gray-200">
                        <div
                            className="relative w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl shadow-sm border-2 border-blue-200 overflow-hidden cursor-pointer group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {uploadingPic ? (
                                <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            ) : groupPicUrl ? (
                                <img src={groupPicUrl} alt={chat.chatName} className="w-full h-full object-cover" />
                            ) : (
                                <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleGroupPhotoUpload} className="hidden" />
                        <h3 className="mt-3 text-lg font-semibold text-gray-900">{chat?.chatName}</h3>
                        <p className="text-sm text-gray-500">Grupo · {participants.length} miembros</p>
                    </div>

                    {/* Lista de miembros */}
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {participants.length} participantes
                            </h4>
                            {/* ✅ Botón agregar miembro */}
                            <button
                                onClick={handleOpenAddMember}
                                className="flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                Agregar
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <svg className="w-6 h-6 animate-spin text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {participants.map((participant) => {
                                    const user = participant.user;
                                    if (!user) return null;
                                    const isOnline = isUserOnline(user.userId);
                                    const picUrl = user.profilePictureUrl ? API_BASE_URL + user.profilePictureUrl : null;
                                    const isCreator = chat?.createdById === user.userId;

                                    return (
                                        <div
                                            key={participant.participantId || user.userId}
                                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="relative flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold overflow-hidden">
                                                    {picUrl ? (
                                                        <img src={picUrl} alt={user.displayName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        getInitials(user.displayName || user.username)
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-0.5 -right-0.5">
                                                    <StatusIndicator isOnline={isOnline} size="sm" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {user.displayName || user.username}
                                                    </p>
                                                    {isCreator && (
                                                        <span className="text-[10px] font-medium text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}


            {chat?.createdById === currentUserId && (
                <div className="p-4 border-t border-gray-100 mt-2">
                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm rounded-xl transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar grupo
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-xs text-red-700">
                                    Esta acción es <strong>irreversible</strong>. Se eliminarán todos los mensajes, participantes y reacciones del grupo permanentemente.
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 mb-1 block">
                                    Escribe <strong>ELIMINAR</strong> para confirmar
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                                    placeholder="ELIMINAR"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDeleteConfirmText('');
                                    }}
                                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteGroup}
                                    disabled={deletingGroup || deleteConfirmText !== 'ELIMINAR'}
                                    className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deletingGroup ? 'Eliminando...' : 'Eliminar grupo'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}