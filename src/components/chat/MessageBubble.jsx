'use client';

import { useState, useEffect } from 'react';
import { formatTime, getInitials } from '@/utils/helpers';
import ImageViewer from '@/components/common/ImageViewer';
import MessageContextMenu from '@/components/chat/MessageContextMenu';
import MessageReactions from '@/components/common/MessageReactions';
import AudioBubble from '@/components/common/AudioBubble';

const EMOJI_REGEX =
    /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji}\u200D\p{Emoji})+$/u;
const EMOJI_COUNT_REGEX =
    /\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji}\u200D\p{Emoji}/gu;

function isEmojiOnly(text) {
    if (!text || text.trim().length === 0) return false;
    const cleaned = text.replace(/\s/g, '');
    if (!EMOJI_REGEX.test(cleaned)) return false;
    const matches = cleaned.match(EMOJI_COUNT_REGEX);
    return matches && matches.length <= 8;
}

const SENDER_COLORS = [
    'text-blue-600', 'text-green-600', 'text-orange-600',
    'text-pink-600', 'text-teal-600', 'text-indigo-600',
    'text-red-600', 'text-cyan-600',
];

function getSenderColor(senderId) {
    if (!senderId) return SENDER_COLORS[0];
    return SENDER_COLORS[senderId % SENDER_COLORS.length];
}

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MessageBubble({
                                          message,
                                          isOwn,
                                          showAvatar,
                                          chatName,
                                          contactProfilePicUrl,
                                          isGroup,
                                          currentUserId,
                                          onMessageDelete,
                                          onReactionUpdate,
                                      }) {
    const [showFullImage, setShowFullImage] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [reactions, setReactions] = useState(message.reactions || []);
    const [isDeleted, setIsDeleted] = useState(message.isDeleted || false);

    useEffect(() => {
        setReactions(message.reactions || []);
    }, [message.reactions]);

    const senderName = message.senderName || chatName || 'Usuario';
    const senderInitials = getInitials(isGroup ? senderName : (chatName || 'U'));
    const formattedTime = formatTime(message.sentAt || message.timestamp);

    const isImage = message.messageType === 'IMAGE';
    const isFile = message.messageType === 'FILE';
    const isVideo = message.messageType === 'VIDEO';
    const isAudio = message.messageType === 'AUDIO';
    const isImagePending = message.messageType === 'IMAGE_PENDING';
    const isVideoPending = message.messageType === 'VIDEO_PENDING';
    const isAudioPending = message.messageType === 'AUDIO_PENDING';
    const emojiOnly =
        !isImage && !isFile && !isVideo && !isAudio &&
        !isImagePending && !isVideoPending && isAudioPending &&
        isEmojiOnly(message.content);

    const metadata = message.metadata || {};
    const imageUrl = metadata.url;
    const thumbnailUrl = metadata.thumbnailUrl;
    const fileName = metadata.fileName || 'Archivo';
    const fileSize = metadata.fileSize || 0;
    const API_BASE_URL = 'http://localhost:8082';

    const handleReactionUpdate = (messageId, updatedReactions) => {
        setReactions(updatedReactions);
        onReactionUpdate?.(messageId, updatedReactions);
    };

    if (isDeleted) {
        return (
            <div className={`flex items-end gap-2 mb-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="w-8 h-8 flex-shrink-0" />
                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                    <div className={`
                        flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-200
                        ${isOwn ? 'rounded-br-none' : 'rounded-bl-none'}
                        bg-white
                    `}>
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        <span className="text-sm italic text-gray-400">Mensaje eliminado</span>
                    </div>
                    <div className="text-xs mt-1 px-1 text-gray-400">
                        <span>{formattedTime}</span>
                    </div>
                </div>
            </div>
        );
    }

    const renderBubbleContent = () => {
        if (emojiOnly) {
            return (
                <div className="leading-none">
                    <span className="text-5xl">{message.content}</span>
                </div>
            );
        }

        if (isImagePending) {
            return (
                <div className="relative">
                    <img
                        src={metadata.localPreview}
                        className="rounded-2xl max-w-full opacity-70"
                        style={{ maxHeight: '300px' }}
                        alt="Enviando..."
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs bg-black/60 text-white px-2 py-1 rounded">
                            Enviando…
                        </span>
                    </div>
                </div>
            );
        }

        if (isVideoPending) {
            return (
                <div className="relative">
                    <div className="w-64 h-36 bg-gray-200 rounded-2xl flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400 opacity-70" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs bg-black/60 text-white px-2 py-1 rounded">
                            Enviando…
                        </span>
                    </div>
                </div>
            );
        }

        if (isAudioPending) {
            return (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl min-w-[220px]
            ${isOwn ? 'bg-blue-500' : 'bg-white border border-gray-200'}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
                ${isOwn ? 'bg-blue-400' : 'bg-gray-100'}`}>
                        <svg className={`w-4 h-4 animate-pulse ${isOwn ? 'text-white' : 'text-gray-400'}`}
                             fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                            {fileName}
                        </p>
                        <p className={`text-xs mt-0.5 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>Enviando…</p>
                    </div>
                </div>
            );
        }


            if (isAudio && imageUrl) {
                return <AudioBubble
                    url={API_BASE_URL + imageUrl}
                    isOwn={isOwn}
                    senderName={senderName}
                    senderPicUrl={contactProfilePicUrl}
                />;
        }

        if (isImage && imageUrl) {
            return (
                <div>
                    {message.content && (
                        <div className={`mt-1 px-1 text-sm text-black ${isOwn ? 'text-right' : 'text-left'}`}>
                            {message.content}
                        </div>
                    )}
                    <img
                        src={API_BASE_URL + (thumbnailUrl || imageUrl)}
                        alt={fileName}
                        className="block rounded-2xl max-w-full cursor-pointer shadow-sm"
                        style={{ maxHeight: '300px' }}
                        onClick={() => setShowFullImage(true)}
                    />
                </div>
            );
        }

        if (isVideo && imageUrl) {
            return (
                <div>
                    {message.content && (
                        <div className={`mt-1 px-1 text-sm text-black ${isOwn ? 'text-right' : 'text-left'}`}>
                            {message.content}
                        </div>
                    )}
                    <video
                        src={API_BASE_URL + imageUrl}
                        controls
                        preload="metadata"
                        className="block rounded-2xl max-w-full shadow-sm"
                        style={{ maxHeight: '300px' }}
                    />
                </div>
            );
        }

        if (isFile && imageUrl) {
            return (
                <div className="flex flex-col">

                    {/* Tarjeta de archivo */}
                    <a
                        href={API_BASE_URL + imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
                    flex items-center gap-3
                    bg-white border border-gray-200
                    rounded-2xl px-4 py-3 shadow-sm
                    hover:bg-gray-50 transition-colors
                    min-w-[200px] max-w-[560px]
                    ${isOwn ? 'self-end' : 'self-start'}
                `}
                    >
                        {/* Icono archivo */}
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <svg
                                className="w-5 h-5 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>

                        {/* Información */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                                {fileName}
                            </p>
                            {fileSize > 0 && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {formatFileSize(fileSize)}
                                </p>
                            )}
                        </div>

                        {/* Icono descarga */}
                        <svg
                            className="w-4 h-4 text-gray-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                        </svg>
                    </a>

                    {/* Caption */}
                    {message.content && (
                        <div
                            className={`
                        mt-1 px-1 text-sm text-gray-600
                        ${isOwn ? 'text-right' : 'text-left'}
                    `}
                        >
                            {message.content}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className={`
                px-4 py-2 rounded-2xl shadow-sm
                ${isOwn
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-white text-gray-800 rounded-bl-none'
            }
            `}>
                {isGroup && !isOwn && showAvatar && (
                    <p className={`text-xs font-semibold mb-1 ${getSenderColor(message.senderId)}`}>
                        {senderName}
                    </p>
                )}
                {message.content && (
                    <div className="break-words whitespace-pre-wrap text-sm">
                        {message.content}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`flex items-end gap-2 mb-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            {showAvatar && !isOwn ? (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold flex-shrink-0 overflow-hidden">
                    {contactProfilePicUrl ? (
                        <img src={contactProfilePicUrl} alt={senderName} className="w-full h-full object-cover" />
                    ) : senderInitials}
                </div>
            ) : (
                <div className="w-8 h-8 flex-shrink-0" />
            )}

            <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                <div className="relative group">
                    {renderBubbleContent()}

                    <button
                        onClick={() => setShowMenu(prev => !prev)}
                        className={`absolute top-1 ${isOwn ? 'left-0 -translate-x-full pl-1' : 'right-0 translate-x-full pr-1'}
                            opacity-0 group-hover:opacity-100 transition-opacity
                            w-6 h-6 rounded-full bg-white shadow-sm border border-gray-100
                            flex items-center justify-center text-gray-400 hover:text-gray-600`}
                    >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
                        </svg>
                    </button>

                    {showMenu && (
                        <MessageContextMenu
                            message={message}
                            isOwn={isOwn}
                            currentUserId={currentUserId}
                            onDelete={(id) => {
                                setIsDeleted(true);
                                onMessageDelete?.(id);
                                setShowMenu(false);
                            }}
                            onReact={handleReactionUpdate}
                            onClose={() => setShowMenu(false)}
                        />
                    )}
                </div>

                <MessageReactions
                    reactions={reactions}
                    messageId={message.messageId}
                    currentUserId={currentUserId}
                    onReactionUpdate={handleReactionUpdate}
                />

                <div className={`text-xs mt-1 px-1 ${isOwn ? 'text-gray-500' : 'text-gray-400'} flex items-center gap-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span>{formattedTime}</span>
                    {isOwn && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
            </div>

            {showFullImage && imageUrl && (
                <ImageViewer
                    src={API_BASE_URL + imageUrl}
                    fileName={fileName}
                    onClose={() => setShowFullImage(false)}
                />
            )}
        </div>
    );
}