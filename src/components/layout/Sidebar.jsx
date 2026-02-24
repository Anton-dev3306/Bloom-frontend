'use client';

import { useState } from 'react';
import ChatList from '@/components/chat/ChatList';
import ContactList from '@/components/contacts/ContactList';
import AddContactForm from '@/components/contacts/AddContactForm';
import AddGroupForm from '@/components/chat/AddGroupForm';
import UserAvatar from '@/components/layout/UserAvatar';
import UserMenu from '@/components/layout/UserMenu';
import SidebarTabs from '@/components/layout/SidebarTabs';
import ProfilePanel from '@/components/layout/ProfilePanel';

export default function Sidebar({
                                    user,
                                    chats,
                                    contacts,
                                    currentChatId,
                                    onChatClick,
                                    onStartChat,
                                    onAddContact,
                                    onDeleteContact,
                                    onCreateGroup,
                                    onLogout,
                                    onUserUpdate
                                }) {
    const [activeTab, setActiveTab] = useState('chats');
    const [triggerFileInput, setTriggerFileInput] = useState(null);
    const [showProfile, setShowProfile] = useState(false);

    return (
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen relative">
            <header className="p-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <UserAvatar
                            user={user}
                            onUserUpdate={onUserUpdate}
                            onRegisterTrigger={(fn) => setTriggerFileInput(() => fn)}
                        />
                        <div className="flex-1 min-w-0">
                            <h6 className="text-gray-900 font-semibold truncate">
                                {user?.displayName || user?.username}
                            </h6>
                            <small className="text-gray-400 text-xs truncate block">
                                @{user?.username}
                            </small>
                        </div>
                    </div>

                    <UserMenu
                        onLogout={onLogout}
                        onChangePhoto={() => triggerFileInput?.()}
                        onProfile={() => setShowProfile(true)}
                    />
                </div>
            </header>

            <SidebarTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                chatsCount={chats?.length || 0}
                contactsCount={contacts?.length || 0}
            />

            <section className="flex-1 overflow-hidden">
                {activeTab === 'chats' && (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto">
                            <ChatList
                                chats={chats}
                                onChatClick={onChatClick}
                                currentChatId={currentChatId} />
                        </div>
                        <AddGroupForm
                            contacts={contacts}
                            onCreateGroup={onCreateGroup} />
                    </div>
                )}
                {activeTab === 'contacts' && (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto">
                            <ContactList
                                contacts={contacts}
                                onStartChat={onStartChat}
                                onDeleteContact={onDeleteContact}
                            />
                        </div>
                        <div className="">
                            <AddContactForm onAddContact={onAddContact} />
                        </div>
                    </div>
                )}
            </section>

            {showProfile && (
                <ProfilePanel
                    user={user}
                    onClose={() => setShowProfile(false)}
                    onUserUpdate={onUserUpdate}
                />
            )}
        </aside>
    );
}