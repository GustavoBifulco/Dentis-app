import React from 'react';
import { motion } from 'framer-motion';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'interactive' | 'outlined' | 'elevated';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ children, variant = 'default', padding = 'md', className = '', onClick, ...props }, ref) => {
        const baseStyles = 'bg-surface rounded-2xl transition-all duration-200';

        const variants = {
            default: 'border border-border shadow-sm',
            interactive: 'border border-border shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer',
            outlined: 'border border-border',
            elevated: 'border border-border shadow-lg',
        };

        const paddings = {
            none: '',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
        };

        const Component = variant === 'interactive' ? motion.div : 'div';
        const motionProps = variant === 'interactive' ? {
            whileHover: { y: -4 },
            transition: { type: 'spring', stiffness: 400, damping: 17 }
        } : {};

        return (
            <Component
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
                onClick={onClick}
                {...motionProps}
                {...props}
            >
                {children}
            </Component>
        );
    }
);

Card.displayName = 'Card';

// Subcomponents
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
    <div className={`mb-4 ${className}`} {...props}>
        {children}
    </div>
);

CardHeader.displayName = 'CardHeader';

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
    <div className={`${className}`} {...props}>
        {children}
    </div>
);

CardBody.displayName = 'CardBody';

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
    <div className={`mt-4 pt-4 border-t border-border ${className}`} {...props}>
        {children}
    </div>
);

CardFooter.displayName = 'CardFooter';
