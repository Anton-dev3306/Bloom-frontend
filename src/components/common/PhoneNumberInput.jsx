'use client';

import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function PhoneNumberInput({ value, onChange, disabled, error, showHint = true }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
            </label>
            <PhoneInput
                international
                defaultCountry="US"
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder="Enter phone number"
                className="phone-input-custom"
            />
            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            {showHint && (
                <p className="mt-2 text-xs text-gray-400">
                    We'll send you a verification code via SMS
                </p>
            )}
        </div>
    );
}