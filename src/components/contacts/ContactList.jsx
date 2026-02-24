'use client';

import { useState } from 'react';
import StatusIndicator from '@/components/common/StatusIndicator';
import { useUserPresence } from '@/providers/UserPresenceProvider';
import { getInitials } from '@/utils/helpers';
import SearchBar from '@/components/common/SearchBar';

export default function ContactList({ contacts, onStartChat, onDeleteContact  }) {
    const { isUserOnline, getUserProfilePicture } = useUserPresence();
    const [filteredContacts, setFilteredContacts] = useState(contacts || []);

    // Sincronizar si llegan contactos nuevos
    useState(() => {
        setFilteredContacts(contacts || []);
    }, [contacts]);

    // filterKey como función porque el nombre está anidado
    const filterByName = (contact) =>
        contact.alias || contact.contact?.displayName || contact.contact?.username || '';

    if (!contacts || contacts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">No hay contactos</p>
                <p className="text-xs text-gray-400">Agrega contactos usando su nombre de usuario</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <SearchBar
                items={contacts}
                onFiltered={setFilteredContacts}
                filterKey={filterByName}
                placeholder="Buscar contacto..."
            />

            <div className="overflow-y-auto flex-1">
                {filteredContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                        <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-sm text-gray-400">No se encontraron contactos</p>
                    </div>
                ) : (
                    filteredContacts.map((contact, index) => {
                        const contactId = contact.contactEntryId || contact.contact?.userId || `contact-${index}`;
                        const displayName = contact.alias || contact.contact?.displayName || contact.contact?.username || 'Usuario';
                        const username = contact.contact?.username || 'username';
                        const userId = contact.contact?.userId;
                        const contactInitials = getInitials(displayName);
                        const isOnline = userId ? isUserOnline(userId) : false;

                        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';
                        const reactivePic = userId ? getUserProfilePicture(userId) : null;
                        const staticPic = contact.contact?.profilePictureUrl || null;
                        const picUrl = reactivePic ?? staticPic;
                        const profilePicUrl = picUrl ? API_BASE_URL + picUrl : null;

                        return (
                            <div
                                key={contactId}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                            >
                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600 overflow-hidden">
                                        {profilePicUrl ? (
                                            <img src={profilePicUrl} alt={displayName} className="w-full h-full object-cover" />
                                        ) : (
                                            contactInitials
                                        )}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5">
                                        <StatusIndicator isOnline={isOnline} size="md" />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h6 className="text-sm font-semibold text-gray-900 truncate">{displayName}</h6>
                                    <p className="text-xs text-gray-500 truncate">@{username}</p>
                                </div>

                                <button
                                    onClick={() => onStartChat(userId, displayName)}
                                    disabled={!userId}
                                    className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center hover:bg-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Iniciar chat"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm(`¿Eliminar a ${displayName} de tus contactos? También se eliminará el chat privado con esta persona.`)) {
                                            onDeleteContact(contact.contactEntryId);
                                        }
                                    }}
                                    className="w-9 h-9 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-all"
                                    title="Eliminar contacto"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}