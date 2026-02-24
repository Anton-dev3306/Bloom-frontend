'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isValidPhoneNumber } from 'libphonenumber-js';
import PhoneNumberInput from '@/components/common/PhoneNumberInput';
import SMSVerification from '@/components/auth/SMSVerification';
import useAuth from '@/hooks/useAuth';
import Image from 'next/image';
export default function RegisterForm() {
    const router = useRouter();
    const { register, loading } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        phoneNumber: '',
        username: '',
        displayName: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handlePhoneChange = (value) => {
        setFormData({ ...formData, phoneNumber: value || '' });
        setError('');
    };

    // Paso 1: Validar número de teléfono
    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.phoneNumber) {
            setError('Please enter your phone number');
            return;
        }

        if (!isValidPhoneNumber(formData.phoneNumber)) {
            setError('Please enter a valid phone number');
            return;
        }

        setStep(2);
    };

    // Paso 2: Teléfono verificado exitosamente
    const handlePhoneVerified = (verifiedPhone) => {
        // Actualizar formData con el teléfono verificado
        setFormData({ ...formData, phoneNumber: verifiedPhone });
        setStep(3);
    };

    // Paso 3: Completar perfil
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');
        // Validar que se ingrese un numero de telefono
        if (!formData.phoneNumber) {
            setError('Phone number is missing. Please go back and verify again.');
            return;
        }
        //validar que se ingrese un nombre de usuario y que este sea mayor de 3 caracteres
        if (!formData.username || formData.username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }
        //validar que se ingrese un display name
        if (!formData.displayName) {
            setError('Please enter your name');
            return;
        }
        //validar que se ingrese una contrasena y que esta sea mayor a 6 caracteres
        if (!formData.password || formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        const userData = {
            phoneNumber: formData.phoneNumber,
            username: formData.username,
            displayName: formData.displayName,
            email: `${formData.username}@messenger.local`,
            password: formData.password,
        };
        const result = await register(userData);
        if (result.success) {
            router.push('/chat');
        } else {
            setError(result.error || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-[#eef1f6] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-28 h-28 bg-white rounded-4xl mb-6 shadow-sm">
                        <Image
                            src="/bloom-logo.webp"
                            alt="Bloom"
                            width={80}
                            height={80}
                            className="object-contain"
                        />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {step === 1 && 'Your Phone Number'}
                        {step === 2 && 'Verify Your Number'}
                        {step === 3 && 'Your Info'}
                    </h1>

                    <p className="text-gray-400">
                        {step === 1 && 'Please confirm your country code and enter your phone number'}
                        {step === 2 && `We've sent a code to ${formData.phoneNumber}`}
                        {step === 3 && 'Enter your name and create a password'}
                    </p>
                </div>

                {/* Indicador de progreso */}
                <div className="flex items-center justify-center mb-8 space-x-2">
                    {[1, 2, 3].map((num) => (
                        <div
                            key={num}
                            className={`h-2 rounded-full transition-all ${
                                num === step
                                    ? 'w-8 bg-blue-500'
                                    : num < step
                                        ? 'w-2 bg-blue-500'
                                        : 'w-2 bg-blue-700'
                            }`}
                        />
                    ))}
                </div>

                {error && (step === 1 || step === 3) && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    </div>
                )}

                {/* Debug Info (solo en desarrollo) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                        <p className="text-xs text-blue-600 font-mono">
                            Step: {step} | Phone: {formData.phoneNumber || 'empty'}
                        </p>
                    </div>
                )}

                {/* Paso 1: Ingresar nuemro de telefono */}
                {step === 1 && (
                    <form onSubmit={handlePhoneSubmit} className="space-y-6">
                        <PhoneNumberInput
                            value={formData.phoneNumber}
                            onChange={handlePhoneChange}
                            disabled={false}
                            error={null}
                            showHint={true}
                        />

                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform active:scale-95"
                        >
                            Continue
                        </button>

                        <div className="text-center">
                            <p className="text-sm text-gray-400">
                                Already have an account?{' '}
                                <Link href="/login" className="text-blue-500 hover:text-blue-600 font-semibold">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                )}

                {/* Paso 2: Verificacion SMS */}
                {step === 2 && (
                    <div className="space-y-6">
                        <SMSVerification
                            phoneNumber={formData.phoneNumber}
                            onVerified={handlePhoneVerified}
                            onCancel={() => setStep(1)}
                        />
                    </div>
                )}

                {/* Paso 3: Llenar campos de registro */}
                {step === 3 && (
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Display Name
                            </label>
                            <input
                                type="text"
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="johndoe"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Minimum 3 characters, lowercase only
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
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
                            <p className="mt-1 text-xs text-gray-500">
                                Minimum 6 characters
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="flex-1 py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform active:scale-95"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </span>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}