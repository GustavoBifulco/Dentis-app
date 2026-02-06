import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'text' | 'circle' | 'rect' | 'card';
    width?: string | number;
    height?: string | number;
    lines?: number;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
    ({ variant = 'rect', width, height, lines = 1, className = '', ...props }, ref) => {
        const baseStyles = 'animate-pulse bg-surface-hover rounded-lg';

        if (variant === 'text') {
            return (
                <div ref={ref} className={`space-y-2 ${className}`} {...props}>
                    {Array.from({ length: lines }).map((_, i) => (
                        <div
                            key={i}
                            className={`${baseStyles} h-4`}
                            style={{
                                width: i === lines - 1 && lines > 1 ? '80%' : width || '100%',
                            }}
                        />
                    ))}
                </div>
            );
        }

        if (variant === 'circle') {
            const size = width || height || 40;
            return (
                <div
                    ref={ref}
                    className={`${baseStyles} rounded-full ${className}`}
                    style={{ width: size, height: size }}
                    {...props}
                />
            );
        }

        if (variant === 'card') {
            return (
                <div ref={ref} className={`${baseStyles} p-6 space-y-4 ${className}`} {...props}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-border rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-border rounded w-1/3" />
                            <div className="h-3 bg-border rounded w-1/2" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 bg-border rounded" />
                        <div className="h-3 bg-border rounded w-5/6" />
                    </div>
                </div>
            );
        }

        // rect variant
        return (
            <div
                ref={ref}
                className={`${baseStyles} ${className}`}
                style={{
                    width: width || '100%',
                    height: height || 100,
                }}
                {...props}
            />
        );
    }
);

Skeleton.displayName = 'Skeleton';
