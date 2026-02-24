'use client';

import { useState, useEffect, useRef } from 'react';
import { getInitials } from '@/utils/helpers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

export default function ProfilePanel({ user, onClose, onUserUpdate }) {
    const [activeSection, setActiveSection] = useState(null);
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const nameInputRef = useRef(null);

    useEffect(() => {
        setDisplayName(user?.displayName || '');
    }, [user?.displayName]);

    useEffect(() => {
        if (activeSection === 'name' && nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, [activeSection]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleUpdateName = async () => {
        if (!displayName.trim() || displayName.trim() === user?.displayName) {
            setActiveSection(null);
            return;
        }

        setSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${user.userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName: displayName.trim() }),
            });
            const data = await response.json();
            if (data.success) {
                onUserUpdate?.({ ...user, displayName: displayName.trim() });
                showMessage('success', 'Nombre actualizado');
                setActiveSection(null);
            } else {
                showMessage('error', data.error || 'Error al actualizar');
            }
        } catch (error) {
            console.error('Error actualizando nombre:', error);
            showMessage('error', 'Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showMessage('error', 'Completa todos los campos');
            return;
        }
        if (newPassword.length < 6) {
            showMessage('error', 'La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }
        if (newPassword !== confirmPassword) {
            showMessage('error', 'Las contraseñas no coinciden');
            return;
        }

        setSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${user.userId}/change-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await response.json();
            if (data.success) {
                showMessage('success', 'Contraseña actualizada');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setActiveSection(null);
            } else {
                showMessage('error', data.error || 'Error al cambiar contraseña');
            }
        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            showMessage('error', 'Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'ELIMINAR') {
            showMessage('error', 'Escribe ELIMINAR para confirmar');
            return;
        }

        setSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${user.userId}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                // Redirect to login
                window.location.href = '/login';
            } else {
                showMessage('error', data.error || 'Error al eliminar cuenta');
            }
        } catch (error) {
            console.error('Error eliminando cuenta:', error);
            showMessage('error', 'Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const profilePicUrl = user?.profilePictureUrl
        ? API_BASE_URL + user.profilePictureUrl
        : null;

    return (
        <div className="absolute inset-0 z-50 flex flex-col bg-white animate-slideIn">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 p-4 flex items-center gap-4 flex-shrink-0 shadow-sm">
                <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h2 className="text-gray-900 font-semibold text-lg">Perfil</h2>
            </header>

            {message && (
                <div className={`mx-4 mt-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                    message.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {message.text}
                </div>
            )}

            <div className="flex-1 overflow-y-auto">
                {/* Foto de perfil */}
                <div className="flex flex-col items-center py-8 bg-gray-50">
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl shadow-sm border-2 border-blue-200 overflow-hidden">
                        {profilePicUrl ? (
                            <img src={profilePicUrl} alt="Perfil" className="w-full h-full object-cover" />
                        ) : (
                            getInitials(user?.displayName || user?.username || 'U')
                        )}
                    </div>
                    <p className="mt-3 text-xs text-gray-500">@{user?.username}</p>
                </div>

                {/* Opciones */}
                <div className="divide-y divide-gray-100">
                    {/* Nombre visible */}
                    <div className="p-4">
                        <button
                            onClick={() => setActiveSection(activeSection === 'name' ? null : 'name')}
                            className="w-full flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-gray-900">Nombre</p>
                                    <p className="text-xs text-gray-500">{user?.displayName}</p>
                                </div>
                            </div>
                            <svg className={`w-5 h-5 text-gray-400 transition-transform ${activeSection === 'name' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {activeSection === 'name' && (
                            <div className="mt-3 pl-13 space-y-3">
                                <input
                                    ref={nameInputRef}
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    maxLength={100}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Tu nombre"
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                                />
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => {
                                            setDisplayName(user?.displayName || '');
                                            setActiveSection(null);
                                        }}
                                        className="px-4 py-2 text-sm text-white bg-red-400 hover:bg-red-800 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleUpdateName}
                                        disabled={saving || !displayName.trim()}
                                        className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {saving ? 'Guardando...' : 'Guardar'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Cambiar contrasena */}
                    <div className="p-4">
                        <button
                            onClick={() => setActiveSection(activeSection === 'password' ? null : 'password')}
                            className="w-full flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-gray-900">Cambiar contraseña</p>
                                    <p className="text-xs text-gray-500">Actualiza tu contraseña de acceso</p>
                                </div>
                            </div>
                            <svg className={`w-5 h-5 text-gray-400 transition-transform ${activeSection === 'password' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {activeSection === 'password' && (
                            <div className="mt-3 pl-13 space-y-3">
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Contraseña actual"
                                />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Nueva contraseña (mín. 6 caracteres)"
                                />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Confirmar nueva contraseña"
                                    onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
                                />
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => {
                                            setCurrentPassword('');
                                            setNewPassword('');
                                            setConfirmPassword('');
                                            setActiveSection(null);
                                        }}
                                        className="px-4 py-2 text-sm text-white bg-red-400 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={saving}
                                        className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {saving ? 'Guardando...' : 'Cambiar'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Eliminar cuenta */}
                    <div className="p-4">
                        <button
                            onClick={() => setActiveSection(activeSection === 'delete' ? null : 'delete')}
                            className="w-full flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-red-600">Eliminar cuenta</p>
                                    <p className="text-xs text-gray-500">Elimina permanentemente tu cuenta</p>
                                </div>
                            </div>
                            <svg className={`w-5 h-5 text-gray-400 transition-transform ${activeSection === 'delete' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {activeSection === 'delete' && (
                            <div className="mt-3 pl-13 space-y-3">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-xs text-red-700">
                                        Esta acción es <strong>irreversible</strong>. Se eliminarán todos tus datos, chats y contactos permanentemente.
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">
                                        Escribe <strong>ELIMINAR</strong> para confirmar
                                    </label>
                                    <input
                                        type="text"
                                        value={deleteConfirmText}
                                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="ELIMINAR"
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => {
                                            setDeleteConfirmText('');
                                            setActiveSection(null);
                                        }}
                                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={saving || deleteConfirmText !== 'ELIMINAR'}
                                        className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {saving ? 'Eliminando...' : 'Eliminar cuenta'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                .animate-slideIn {
                    animation: slideIn 0.25s ease-out;
                }
            `}</style>
        </div>
    );
}