'use client';

import { useState, useEffect, useRef } from 'react';
import { sendVerificationCode, verifyCode } from '@/services/verificationService';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

export default function SMSVerification({ phoneNumber, onVerified, onCancel }) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const hasInitialized = useRef(false);

    useEffect(() => {
        if (codeSent && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCanResend(true);
        }
    }, [codeSent, countdown]);

    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            handleSendCode();
        }
    }, []);

    const handleSendCode = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        const result = await sendVerificationCode(phoneNumber, 'sms');

        if (result.success) {
            setCodeSent(true);
            setSuccess('Code sent successfully');
            setCountdown(60);
            setCanResend(false);
        } else {
            setError(result.error || 'Failed to send code');
        }

        setLoading(false);
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();

        if (!code || code.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        try {
            setError('');
            setSuccess('');
            setLoading(true);

            const result = await verifyCode(phoneNumber, code);

            const isVerified = result.verified === true ||
                result.success === true ||
                result.status === 'approved';

            if (isVerified) {
                setSuccess('Phone verified successfully!');
                setTimeout(() => {
                    onVerified(phoneNumber);  // ← llama al callback del padre
                }, 1000);

            } else {
                const errorMessage = result.error ||
                    result.message ||
                    'Invalid code';
                setError(errorMessage);
            }
        } catch (err) {
            setError('Failed to verify code');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = () => {
        setCode('');
        setError('');
        setSuccess('');
        handleSendCode();
    };

    const formatPhoneNumber = (phone) => {
        try {
            if (isValidPhoneNumber(phone)) {
                const parsed = parsePhoneNumber(phone);
                return parsed.formatInternational();
            }
        } catch (e) {}
        return phone;
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-sm text-green-400 text-center">{success}</p>
                </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Code
                    </label>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setCode(value);
                            setError('');
                        }}
                        placeholder="000000"
                        maxLength={6}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all disabled:opacity-50"
                        autoFocus
                    />
                    <div className="mt-2 flex justify-between items-center">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="text-xs text-blue-500 hover:text-blue-600"
                        >
                            Change number
                        </button>
                        {canResend ? (
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={loading}
                                className="text-xs text-blue-500 hover:text-blue-600 font-semibold disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Resend Code'}
                            </button>
                        ) : (
                            <span className="text-xs text-gray-400">
                                Resend in {countdown}s
                            </span>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || code.length < 6}
                    className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform active:scale-95"
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying...
                        </span>
                    ) : (
                        'Verify'
                    )}
                </button>
            </form>
        </div>
    );
}