'use client';

import { useState, useRef } from 'react';
import ReactionsModal from '@/components/common/ReactionsModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

export default function MessageReactions({ reactions, messageId, currentUserId, onReactionUpdate }) {
    const [showModal, setShowModal] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const containerRef = useRef(null);

    if (!reactions || reactions.length === 0) return null;

    const grouped = reactions.reduce((acc, r) => {
        if (!acc[r.emoji]) acc[r.emoji] = [];
        acc[r.emoji].push(r);
        return acc;
    }, {});

    const myCurrentReaction = reactions.find(r => r.userId === currentUserId);

    const handleClick = async (emoji) => {
        try {
            if (myCurrentReaction && myCurrentReaction.emoji === emoji) {
                const res = await fetch(
                    `${API_BASE_URL}/messages/${messageId}/reactions?userId=${currentUserId}`,
                    { method: 'DELETE' }
                );
                const data = await res.json();
                if (data.success) onReactionUpdate(messageId, data.reactions);
            } else {
                const res = await fetch(`${API_BASE_URL}/messages/${messageId}/reactions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUserId, emoji }),
                });
                const data = await res.json();
                if (data.success) onReactionUpdate(messageId, data.reactions);
            }
        } catch (e) {
            console.error('Error actualizando reacción:', e);
        }
    };

    const handleOpenModal = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setModalPosition({ top: rect.bottom + 6, left: rect.left });
        }
        setShowModal(true);
    };

    return (
        <>
            <div ref={containerRef} className="flex flex-wrap gap-1 mt-1 max-w-[200px]">
                {Object.entries(grouped).map(([emoji, users]) => {
                    const isMine = users.some(u => u.userId === currentUserId);
                    return (
                        <button
                            key={emoji}
                            onClick={handleOpenModal}
                            title={users.map(u => u.username).join(', ')}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all ${
                                isMine
                                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <span className="text-sm leading-none">{emoji}</span>
                            <span className="font-medium">{users.length}</span>
                        </button>
                    );
                })}

            </div>

            {showModal && (
                <ReactionsModal
                    grouped={grouped}
                    allReactions={reactions}
                    position={modalPosition}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}