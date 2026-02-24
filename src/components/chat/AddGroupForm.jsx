'use client';

import { useState } from 'react';
import { getInitials } from '@/utils/helpers';

export default function AddGroupForm({ contacts, onCreateGroup }) {
    const [isOpen, setIsOpen] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [loading, setLoading] = useState(false);

    const toggleContact = (userId) => {
        setSelectedContacts((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!groupName.trim()) return;
        if (selectedContacts.length < 2) {
            alert('Selecciona al menos 2 contactos para crear un grupo');
            return;
        }

        setLoading(true);
        try {
            await onCreateGroup(selectedContacts, groupName.trim());
            setGroupName('');
            setSelectedContacts([]);
            setIsOpen(false);
        } catch (error) {
            console.error('Error creando grupo:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <div className="p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full py-2 px-4 text-sm font-medium text-blue-500 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Nuevo Grupo</span>
                </button>
            </div>
        );
    }

    return (
        <div className="border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <form onSubmit={handleSubmit} className="p-3 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Nuevo Grupo</h3>
                    <button
                        type="button"
                        onClick={() => {
                            setIsOpen(false);
                            setGroupName('');
                            setSelectedContacts([]);
                        }}
                        className="w-6 h-6 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Group Name */}
                <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Nombre del grupo"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                    maxLength={100}
                />

                {/* Contact Selection */}
                <div>
                    <p className="text-xs text-gray-500 mb-2">
                        Selecciona participantes ({selectedContacts.length} seleccionados)
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-200 rounded-lg bg-white">
                        {(!contacts || contacts.length === 0) ? (
                            <p className="text-xs text-gray-400 text-center py-4">No hay contactos disponibles</p>
                        ) : (
                            contacts.map((contact, index) => {
                                const userId = contact.contact?.userId;
                                const displayName = contact.alias || contact.contact?.displayName || contact.contact?.username || 'Usuario';
                                const isSelected = userId && selectedContacts.includes(userId);

                                if (!userId) return null;

                                return (
                                    <button
                                        key={userId || `contact-${index}`}
                                        type="button"
                                        onClick={() => toggleContact(userId)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                                            isSelected
                                                ? 'bg-blue-50 border-l-2 border-blue-500'
                                                : 'hover:bg-gray-50 border-l-2 border-transparent'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                                            isSelected
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {isSelected ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                getInitials(displayName)
                                            )}
                                        </div>
                                        <span className={`text-sm truncate ${isSelected ? 'font-medium text-blue-500' : 'text-gray-700'}`}>
                                            {displayName}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading || !groupName.trim() || selectedContacts.length < 2}
                    className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Creando...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Crear Grupo</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}