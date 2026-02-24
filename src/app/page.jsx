import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
      <div className="min-h-screen bg-[#eef1f6] flex items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          {/* Logo y Hero Section */}
          <div className="text-center mb-16">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-28 h-28 bg-white rounded-4xl mb-6 shadow-sm">
              <Image
                  src="/bloom-logo.jpg"
                  alt="Bloom"
                  width={80}
                  height={80}
                  className="object-contain"
              />
            </div>

            {/* Título */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
              Bloom
            </h1>

            {/* Descripción */}
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Conecta con las personas que más importan. Simple, rápido y seguro.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-20">
            <Link
                href="/login"
                className="flex-1 py-4 px-8 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition-all transform hover:scale-105 active:scale-95 text-center shadow-lg shadow-blue-500/20"
            >
              Iniciar Sesión
            </Link>

            <Link
                href="/register"
                className="flex-1 py-4 px-8 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-full transition-all transform hover:scale-105 active:scale-95 text-center border border-gray-200 shadow-sm"
            >
              Crear Cuenta
            </Link>
          </div>

          {/* Footer */}
          <footer className="text-center mt-16">
            <p className="text-gray-400 text-sm">
              &copy;Bloom {new Date().getFullYear()}.    Todos los derechos reservados.
            </p>
          </footer>
        </div>
      </div>
  );
}