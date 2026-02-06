import React, { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';

interface PasswordInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    showStrength?: boolean;
}

interface PasswordStrength {
    score: number; // 0-4
    label: string;
    color: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
    value,
    onChange,
    placeholder = 'Enter password',
    showStrength = true,
}) => {
    const [showPassword, setShowPassword] = useState(false);

    // Calculate password strength
    const calculateStrength = (password: string): PasswordStrength => {
        let score = 0;

        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z\d]/.test(password)) score++;

        const labels = ['Muito Fraca', 'Fraca', 'Média', 'Forte', 'Muito Forte'];
        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'];

        return {
            score,
            label: labels[score] || labels[0],
            color: colors[score] || colors[0],
        };
    };

    const strength = calculateStrength(value);

    // Password requirements
    const requirements = [
        { label: 'Mínimo 8 caracteres', met: value.length >= 8 },
        { label: 'Letra maiúscula', met: /[A-Z]/.test(value) },
        { label: 'Letra minúscula', met: /[a-z]/.test(value) },
        { label: 'Número', met: /\d/.test(value) },
    ];

    return (
        <div className="space-y-2">
            {/* Input Field */}
            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-lux-border focus:border-lux-accent focus:outline-none transition"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-lux-subtle rounded-lg transition"
                >
                    {showPassword ? (
                        <EyeOff size={20} className="text-lux-text-secondary" />
                    ) : (
                        <Eye size={20} className="text-lux-text-secondary" />
                    )}
                </button>
            </div>

            {/* Strength Indicator */}
            {showStrength && value.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-lux-subtle rounded-full overflow-hidden">
                            <div
                                className={`h-full ${strength.color} transition-all duration-300`}
                                style={{ width: `${(strength.score / 4) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs font-bold text-lux-text-secondary">
                            {strength.label}
                        </span>
                    </div>

                    {/* Requirements Checklist */}
                    <div className="grid grid-cols-2 gap-2">
                        {requirements.map((req, index) => (
                            <div
                                key={index}
                                className={`flex items-center gap-2 text-xs ${req.met ? 'text-emerald-600' : 'text-lux-text-secondary'
                                    }`}
                            >
                                {req.met ? (
                                    <Check size={14} className="flex-shrink-0" />
                                ) : (
                                    <X size={14} className="flex-shrink-0" />
                                )}
                                <span>{req.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PasswordInput;
