import React from 'react';
import { Search, AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    variant?: 'default' | 'search';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            helperText,
            icon,
            iconPosition = 'left',
            variant = 'default',
            className = '',
            id,
            ...props
        },
        ref
    ) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
        const hasLeftIcon = (variant === 'search' || (icon && iconPosition === 'left'));
        const hasRightIcon = (icon && iconPosition === 'right');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-text-main mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {variant === 'search' && (
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors"
                            size={18}
                        />
                    )}
                    {icon && iconPosition === 'left' && variant !== 'search' && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={`
              w-full px-3 py-2.5 
              bg-surface border border-border rounded-xl
              text-text-main placeholder:text-text-desc
              transition-all duration-200
              focus:outline-none focus:border-border-focus focus:ring-4 focus:ring-primary/5
              hover:border-border-hover
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-hover
              ${hasLeftIcon ? 'pl-10' : ''}
              ${hasRightIcon ? 'pr-10' : ''}
              ${error ? 'border-error focus:border-error focus:ring-error/5' : ''}
              ${className}
            `}
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                        {...props}
                    />
                    {icon && iconPosition === 'right' && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                            {icon}
                        </div>
                    )}
                    {error && (
                        <AlertCircle
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-error"
                            size={18}
                        />
                    )}
                </div>
                {error && (
                    <p id={`${inputId}-error`} className="mt-1.5 text-xs text-error font-medium">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-text-muted">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
