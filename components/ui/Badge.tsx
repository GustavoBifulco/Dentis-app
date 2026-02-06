import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md' | 'lg';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ children, variant = 'default', size = 'md', className = '', ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full border transition-colors';

        const variants = {
            default: 'bg-surface text-text-main border-border',
            success: 'bg-success-bg text-success border-success-border',
            warning: 'bg-warning-bg text-warning border-warning-border',
            error: 'bg-error-bg text-error border-error-border',
            info: 'bg-info-bg text-info border-info-border',
        };

        const sizes = {
            sm: 'px-2 py-0.5 text-xs',
            md: 'px-2.5 py-1 text-xs',
            lg: 'px-3 py-1.5 text-sm',
        };

        return (
            <span
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {children}
            </span>
        );
    }
);

Badge.displayName = 'Badge';
