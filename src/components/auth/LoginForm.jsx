'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import useAuth from '@/hooks/useAuth';
import PhoneNumberInput from '@/components/common/PhoneNumberInput';

export default function LoginForm() {
    const router = useRouter();
    const { login, loading } = useAuth();
    const [step, setStep] = useState(1); // 1: phone, 2: password
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handlePhoneSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!phoneNumber || phoneNumber.length < 10) {
            setError('Ingresa un número de teléfono válido');
            return;
        }

        setStep(2);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!password || password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        const result = await login(phoneNumber, password);

        if (result.success) {
            router.push('/chat');
        } else {
            setError(result.error || 'Credenciales inválidas');
        }
    };

    return (
        <div className="min-h-screen bg-[#eef1f6] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-28 h-28 bg-white rounded-4xl mb-6 shadow-sm">
                        <Image
                            src="/bloom-logo.jpg"
                            alt="Bloom"
                            width={80}
                            height={80}
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {step === 1 ? 'Iniciar Sesión en Bloom' : 'Ingresa tu Contraseña'}
                    </h1>
                    <p className="text-gray-400">
                        {step === 1
                            ? 'Ingresa tu número de teléfono para continuar'
                            : `Contraseña para ${phoneNumber}`}
                    </p>
                </div>

                {/* Alerta de error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    </div>
                )}

                {/* Paso 1: Ingresar tu numero de telefono */}
                {step === 1 && (
                    <form onSubmit={handlePhoneSubmit} className="space-y-6">

                        <PhoneNumberInput
                            value={phoneNumber}
                            onChange={(phone) => setPhoneNumber(phone)}
                            disabled={false}
                            error={null}
                            showHint={false}
                        />

                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#eef1f6] shadow-sm shadow-blue-500/20"
                        >
                            Siguiente
                        </button>

                        <div className="text-center">
                            <p className="text-sm text-gray-400">
                                ¿No tienes cuenta?{' '}
                                <Link href="/register" className="text-blue-500 hover:text-blue-600 font-semibold">
                                    Regístrate
                                </Link>
                            </p>
                        </div>
                    </form>
                )}


                {/* Paso 2: Ingresar tu contrasena */}
                {step === 2 && (
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Contraseña
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm text-blue-500 hover:text-blue-600"
                                >
                                    Cambiar número
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Ingresa tu contraseña"
                                    className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <div className="mt-2 flex justify-between items-center">
                                <p className="text-xs text-gray-400">
                                    Contraseña para {phoneNumber}
                                </p>
                                <Link href="/forgot-password" className="text-xs text-blue-500 hover:text-blue-600">
                                    ¿Olvidaste?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#eef1f6] shadow-sm shadow-blue-500/20"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Iniciando sesión...
                                </span>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}