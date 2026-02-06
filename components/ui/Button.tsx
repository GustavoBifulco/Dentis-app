import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            loading = false,
            disabled = false,
            icon,
            iconPosition = 'left',
            className = '',
            ...props
        },
        ref
    ) => {
        const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

        const variants = {
            primary: 'bg-primary text-primary-foreground hover:bg-primary-hover focus:ring-primary shadow-sm',
            secondary: 'bg-surface text-text-main border border-border hover:bg-surface-hover hover:border-border-hover focus:ring-border-focus',
            ghost: 'bg-transparent text-text-main hover:bg-surface-hover focus:ring-border-focus',
            destructive: 'bg-error text-white hover:bg-error-hover focus:ring-error shadow-sm',
            outline: 'bg-transparent border border-border text-text-main hover:bg-surface-hover hover:border-border-hover focus:ring-border-focus',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm rounded-lg',
            md: 'px-4 py-2 text-sm rounded-xl',
            lg: 'px-6 py-3 text-base rounded-xl',
            icon: 'p-2 rounded-xl',
        };

        return (
            <motion.button
                ref={ref}
                disabled={disabled || loading}
                whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
                whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {!loading && icon && iconPosition === 'left' && <span className="opacity-90">{icon}</span>}
                {children}
                {!loading && icon && iconPosition === 'right' && <span className="opacity-90">{icon}</span>}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';
