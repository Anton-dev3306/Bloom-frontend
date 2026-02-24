'use client';

import NotificationBell from '@/components/layout/NotificationBell';
import HeaderProfileMenu from '@/components/layout/HeaderProfileMenu';

export default function Header({ user, onLogout }) {
    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full shadow-sm">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Bloom</h1>
                            <p className="text-xs text-gray-400 hidden sm:block">Chat en tiempo real</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-500 hidden md:flex"
                            title="Buscar"
                            onClick={() => alert('Función de búsqueda no implementada')}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        <NotificationBell />
                        <HeaderProfileMenu user={user} onLogout={onLogout} />
                    </div>
                </div>
            </div>
        </header>
    );
}
