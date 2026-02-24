import { Inter } from 'next/font/google';
import './globals.css';
import AuthWrapper from './AuthWrapper';
// Configuración de la fuente Inter
const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

// Metadata de la aplicación
export const metadata = {
    title: 'Bloom',
    description: 'Aplicación de mensajería instantánea con chat en tiempo real, envío de archivos y más.',
    keywords: ['messenger', 'chat', 'mensajería', 'tiempo real', 'websocket'],
    authors: [{ name: 'Anton-dev3306' }],
    creator: 'Anton-dev3306',
    publisher: 'Antonio LC',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        title: 'Bloom',
        description: 'Aplicación de mensajería instantánea',
        type: 'website',
        locale: 'es_ES',
    },
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
    },
    icons: {
        icon: '/bloom-logo.ico',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
    return (
        <html lang="es" className="h-full bg-gray-900" suppressHydrationWarning>
        <head>
            <meta charSet="utf-8" />
        </head>
        <body
            className={`${inter.className} h-full antialiased`}
            suppressHydrationWarning
        >
        <AuthWrapper>
            {children}
        </AuthWrapper>
        </body>
        </html>
    );
}