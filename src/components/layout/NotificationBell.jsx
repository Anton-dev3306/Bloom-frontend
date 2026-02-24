'use client';

import { useState } from 'react';

const MOCK_NOTIFICATIONS = [
    { id: 1, type: 'message', text: 'Nuevo mensaje de Juan', time: 'Hace 5 min', unread: true },
    { id: 2, type: 'contact', text: 'María te agregó como contacto', time: 'Hace 1 hora', unread: true },
    { id: 3, type: 'system', text: 'Actualización disponible', time: 'Hace 2 horas', unread: false },
];

const ICON_MAP = {
    message: { bg: 'bg-blue-100', color: 'text-blue-600', path: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    contact: { bg: 'bg-green-100', color: 'text-green-600', path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    system: { bg: 'bg-gray-100', color: 'text-gray-600', path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
};

export default function NotificationBell() {
    const [show, setShow] = useState(false);

    const notifications = MOCK_NOTIFICATIONS;
    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <div className="relative">
            <button
                onClick={() => setShow(!show)}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-500 relative"
                title="Notificaciones"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg">
                        {unreadCount}
                    </span>
                )}
            </button>

            {show && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setShow(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl z-20 overflow-hidden animate-fadeIn border border-gray-100">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 font-semibold">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-800">Notificaciones</span>
                                {unreadCount > 0 && (
                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                {unreadCount} nuevas
            </span>
                                )}
                            </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto scrollbar-thin">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium">No tienes notificaciones</p>
                                </div>
                            ) : (
                                notifications.map((notif) => {
                                    const icon = ICON_MAP[notif.type];
                                    return (
                                        <div
                                            key={notif.id}
                                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                                                notif.unread ? 'bg-blue-50/50' : ''
                                            }`}
                                            onClick={() => setShow(false)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${icon.bg}`}>
                                                    <svg className={`w-5 h-5 ${icon.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon.path} />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${notif.unread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                        {notif.text}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{notif.time}</p>
                                                </div>
                                                {notif.unread && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                                <button className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors">
                                    Ver todas las notificaciones
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}