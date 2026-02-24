'use client';

export default function SidebarTabs({ activeTab, onTabChange, chatsCount, contactsCount }) {
    return (
        <nav className="flex border-b border-gray-200 bg-white flex-shrink-0">
            <button
                onClick={() => onTabChange('chats')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
                    activeTab === 'chats'
                        ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-50/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
                <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Chats</span>
                    {chatsCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                            {chatsCount}
                        </span>
                    )}
                </div>
            </button>

            <button
                onClick={() => onTabChange('contacts')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
                    activeTab === 'contacts'
                        ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-50/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
                <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Contactos</span>
                    {contactsCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                            {contactsCount}
                        </span>
                    )}
                </div>
            </button>
        </nav>
    );
}