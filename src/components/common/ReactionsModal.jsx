'use client';

import { useState, useEffect, useRef } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

export default function ReactionsModal({ grouped, allReactions, position, onClose }) {
    const [activeTab, setActiveTab] = useState('all');
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const adjustedTop = Math.min(position.top, window.innerHeight - 280);
    const adjustedLeft = Math.min(position.left, window.innerWidth - 290);

    const tabs = [
        { key: 'all', label: 'Todas', users: allReactions },
        ...Object.entries(grouped).map(([emoji, users]) => ({ key: emoji, label: emoji, users })),
    ];
    const activeUsers = tabs.find(t => t.key === activeTab)?.users || [];

    return (
        <div className="fixed z-[100]" style={{ top: adjustedTop, left: adjustedLeft, animation: 'slideUp 0.15s ease-out' }}>
            <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100" style={{ width: '272px' }}>
                <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800">Reacciones</h3>
                    <button onClick={onClose} className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex gap-1 px-3 pt-2 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                                activeTab === tab.key
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            {tab.key === 'all' ? 'Todas' : <span className="text-base leading-none">{tab.label}</span>}
                            <span className={activeTab === tab.key ? 'text-blue-600' : 'text-gray-400'}>
                                {tab.users.length}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="overflow-y-auto max-h-52 p-2 space-y-0.5">
                    {activeUsers.map((r, i) => {
                        const picUrl = r.profilePictureUrl ? API_BASE_URL + r.profilePictureUrl : null;
                        const initials = (r.displayName || r.username || '?')
                            .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                        return (
                            <div key={`${r.userId}-${i}`} className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {picUrl ? <img src={picUrl} alt={r.displayName} className="w-full h-full object-cover" /> : initials}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 leading-tight">{r.displayName || r.username}</p>
                                        <p className="text-xs text-gray-400">@{r.username}</p>
                                    </div>
                                </div>
                                <span className="text-lg leading-none">{r.emoji}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
                @keyframes slideUp {
                    from { transform: translateY(8px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}