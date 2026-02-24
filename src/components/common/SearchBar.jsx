'use client';

import { useState } from 'react';

export default function SearchBar({ items, onFiltered, filterKey = 'chatName', placeholder = 'Buscar...' }) {
    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (!value.trim()) {
            onFiltered(items);
            return;
        }

        const filtered = items.filter(item => {
            const target = typeof filterKey === 'function'
                ? filterKey(item)
                : item[filterKey];
            return target?.toLowerCase().includes(value.toLowerCase());
        });
        onFiltered(filtered);
    };

    const handleClear = () => {
        setQuery('');
        onFiltered(items);
    };

    return (
        <div className="px-3 py-2 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    value={query}
                    onChange={handleSearch}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
                {query && (
                    <button onClick={handleClear} className="flex-shrink-0">
                        <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}