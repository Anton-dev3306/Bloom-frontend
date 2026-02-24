'use client';

import { useState, useRef, useEffect } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

export default function MessageInput({ onSendMessage, onSendFile }) {
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEmojiSelect = (emoji) => {
        const input = inputRef.current;
        if (input) {
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const newMsg = message.slice(0, start) + emoji.native + message.slice(end);
            setMessage(newMsg);
            setTimeout(() => {
                input.selectionStart = input.selectionEnd = start + emoji.native.length;
                input.focus();
            }, 0);
        } else {
            setMessage(prev => prev + emoji.native);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (uploading) return;

        if (selectedFile) {
            setUploading(true);
            try {
                await onSendFile(selectedFile, message.trim());
                clearFileSelection();
                setMessage('');
            } catch (error) {
                console.error('Error enviando archivo:', error);
            } finally {
                setUploading(false);
            }
        } else if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
        }

        setShowEmojiPicker(false);
        inputRef.current?.focus();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const maxSize = isImage ? 5 * 1024 * 1024 : isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;

        if (file.size > maxSize) {
            alert(`El archivo no puede superar ${maxSize / (1024 * 1024)}MB`);
            return;
        }

        setSelectedFile(file);

        if (isImage) {
            const reader = new FileReader();
            reader.onload = (e) => setFilePreview(e.target.result);
            reader.readAsDataURL(file);
        } else if (isVideo) {
            setFilePreview('video');
        } else {
            setFilePreview(null);
        }
    };

    const clearFileSelection = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <footer className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
            {selectedFile && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center gap-3 border border-gray-200">
                    {filePreview === 'video' ? (
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded flex items-center justify-center">
                            <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    ) : filePreview ? (
                        <img src={filePreview} alt="Preview" className="w-16 h-16 rounded object-cover" />
                    ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={clearFileSelection} className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors cursor-pointer" type="button" title="Eliminar archivo">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <div className="relative" ref={emojiPickerRef}>
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(prev => !prev)}
                        className={`flex-shrink-0 w-10 h-10 flex items-center justify-center transition-colors rounded-full hover:bg-gray-100 cursor-pointer ${
                            showEmojiPicker ? 'text-[#667eea] bg-purple-50' : 'text-gray-400 hover:text-gray-600'
                        }`}
                        title="Emojis"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>

                    {showEmojiPicker && (
                        <div className="fixed bottom-24 left-4 z-50 shadow-2xl rounded-xl overflow-hidden" style={{ height: '350px', width: '352px' }}>
                            <Picker
                                data={data}
                                onEmojiSelect={handleEmojiSelect}
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

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 cursor-pointer"
                    title="Adjuntar archivo o imagen"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/mp4,video/webm,video/quicktime,audio/*,audio/mp3,audio/wav,audio/ogg,audio/aac,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center">
                    <input
                        ref={inputRef}
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={selectedFile ? "Escribe un caption (opcional)..." : "Escribe tu mensaje..."}
                        className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-sm"
                        disabled={uploading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={(!message.trim() && !selectedFile) || uploading}
                    className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                        (message.trim() || selectedFile) && !uploading
                            ? 'bg-blue-100 text-blue-500 hover:bg-blue-200 hover:scale-105 cursor-pointer'
                            : 'bg-blue-100 text-gray-400 cursor-not-allowed'
                    }`}
                    title="Enviar mensaje"
                >
                    {uploading ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    )}
                </button>
            </form>
        </footer>
    );
}