'use client';

export default function StatusIndicator({ isOnline, size = 'md', showPulse = false }) {
    const sizeClasses = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4',
    };

    const sizeClass = sizeClasses[size] || sizeClasses.md;

    return (
        <div className="relative inline-block">
            <div
                className={`${sizeClass} rounded-full border-2 border-white ${
                    isOnline ? 'bg-green-400' : 'bg-gray-400'
                }`}
            ></div>
            {isOnline && showPulse && (
                <div
                    className={`absolute inset-0 ${sizeClass} rounded-full bg-green-400 animate-ping opacity-75`}
                ></div>
            )}
        </div>
    );
}