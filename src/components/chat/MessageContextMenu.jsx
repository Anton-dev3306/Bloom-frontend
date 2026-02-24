'use client';

import { useState, useRef, useEffect } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

export default function MessageContextMenu({
                                               message,
                                               isOwn,
                                               currentUserId,
                                               onDelete,
                                               onReact,
                                               onClose
                                           }) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleReact = async (emoji) => {
        try {
            const res = await fetch(`${API_BASE_URL}/messages/${message.messageId}/reactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId, emoji: emoji.native }),
            });
            const data = await res.json();
            if (data.success) onReact(message.messageId, data.reactions);
        } catch (e) {
            console.error('Error al reaccionar:', e);
        }
        onClose();
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(
                `${API_BASE_URL}/messages/${message.messageId}?userId=${currentUserId}`,
                { method: 'DELETE' }
            );
            const data = await res.json();
            if (data.success) onDelete(message.messageId);
        } catch (e) {
            console.error('Error al eliminar:', e);
        }
        onClose();
    };

    return (
        <div
            ref={menuRef}
            className={`absolute z-50 bottom-6 ${isOwn ? 'right-0' : 'left-0'}`}
        >
            {!showEmojiPicker ? (
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden min-w-[160px]">
                    <button
                        onClick={() => setShowEmojiPicker(true)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-700">Reaccionar</span>
                    </button>

                    {/* Solo se permite eliminar un mensaje si el mensaje es propio */}
                    {isOwn && (
                        <>
                            <div className="border-t border-gray-100" />
                            <button
                                onClick={handleDelete}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left"
                            >
                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="text-sm text-red-600">Eliminar</span>
                            </button>
                        </>
                    )}

                    <div className="border-t border-gray-100" />
                </div>
            ) : (
                <div className={`absolute bottom-0 ${isOwn ? 'right-0' : 'left-0'}`}
                     style={{ width: '352px' }}>
                    <Picker
                        data={data}
                        onEmojiSelect={handleReact}
                        set="native"
                        theme="light"
                        locale="es"
                        previewPosition="none"
                        skinTonePosition="search"
                        maxFrequentRows={2}
                        perLine={8}
                    />
                </div>
            )}
        </div>
    );
}