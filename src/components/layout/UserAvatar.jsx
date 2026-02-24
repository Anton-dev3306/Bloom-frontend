'use client';

import { useState, useRef, useEffect } from 'react';
import StatusIndicator from '@/components/common/StatusIndicator';
import { getInitials } from '@/utils/helpers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

export default function UserAvatar({ user, onUserUpdate, onRegisterTrigger }) {
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);
    const [uploadingPicture, setUploadingPicture] = useState(false);
    const profileInputRef = useRef(null);

    useEffect(() => {
        if (onRegisterTrigger) {
            onRegisterTrigger(() => profileInputRef.current?.click());
        }
    }, [onRegisterTrigger]);

    const profilePicUrl = user?.profilePictureUrl
        ? API_BASE_URL + user.profilePictureUrl
        : null;

    const handleProfilePictureSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !user?.userId) return;

        if (!file.type.startsWith('image/')) {
            alert('Solo se permiten imágenes');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen no puede superar 5MB');
            return;
        }

        setUploadingPicture(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/api/users/${user.userId}/profile-picture`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success && data.profilePictureUrl) {
                if (onUserUpdate) {
                    onUserUpdate({ ...user, profilePictureUrl: data.profilePictureUrl });
                }
            } else {
                alert(data.error || 'Error subiendo foto de perfil');
            }
        } catch (error) {
            alert('Error al subir la foto de perfil');
        } finally {
            setUploadingPicture(false);
            if (profileInputRef.current) profileInputRef.current.value = '';
        }
    };

    const handleRemoveProfilePicture = async () => {
        if (!user?.userId) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${user.userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profilePictureUrl: '' }),
            });
            const data = await response.json();
            if (data.success && onUserUpdate) {
                onUserUpdate({ ...user, profilePictureUrl: null });
            }
        } catch (error) {
            console.error('Error eliminando foto:', error);
        }
    };

    return (
        <div className="relative flex-shrink-0">
            <div
                className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg border-2 border-blue-200 shadow-sm cursor-pointer overflow-hidden"
                onClick={() => setShowAvatarMenu(prev => !prev)}
            >
                {uploadingPicture ? (
                    <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                ) : profilePicUrl ? (
                    <img src={profilePicUrl} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                    getInitials(user?.displayName || user?.username || 'U')
                )}
            </div>

            <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureSelect}
                className="hidden"
            />

            <div className="absolute -bottom-0.5 -right-0.5">
                <StatusIndicator isOnline={true} size="md" />
            </div>

            {showAvatarMenu && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowAvatarMenu(false)} />
                    <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-2xl overflow-hidden z-50 border border-gray-200">
                        <div className="py-1">
                            <button
                                onClick={() => {
                                    setShowAvatarMenu(false);
                                    profileInputRef.current?.click();
                                }}
                                className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                            >
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm font-medium">Subir foto</span>
                            </button>
                            {profilePicUrl && (
                                <button
                                    onClick={() => {
                                        setShowAvatarMenu(false);
                                        handleRemoveProfilePicture();
                                    }}
                                    className="w-full px-4 py-2.5 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span className="text-sm font-medium">Eliminar foto</span>
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}