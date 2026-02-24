'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

function ImageViewerContent({ src, fileName, onClose }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const handleDownload = async () => {
        try {
            const response = await fetch(src);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName || 'imagen';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error descargando imagen:', error);
        }
    };

    return (
        <div className="fixed inset-0 flex flex-col" style={{ zIndex: 9999, backgroundColor: 'rgba(11,20,26,0.95)' }}>
            <header className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ backgroundColor: 'rgba(11,20,26,0.8)' }}>
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{fileName || 'Imagen'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={handleDownload}
                        className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                        title="Descargar"
                    >
                        <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                        title="Cerrar"
                    >
                        <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </header>

            <div
                className="flex-1 flex items-center justify-center p-6 cursor-pointer"
                onClick={onClose}
            >
                <div
                    className="bg-white rounded-lg shadow-2xl p-2 max-w-[90vw] max-h-[85vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <img
                        src={src}
                        alt={fileName || 'Imagen'}
                        className="block max-w-full max-h-[80vh] object-contain rounded"
                    />
                </div>
            </div>
        </div>
    );
}

export default function ImageViewer({ src, fileName, onClose }) {
    return createPortal(
        <ImageViewerContent src={src} fileName={fileName} onClose={onClose} />,
        document.body
    );
}