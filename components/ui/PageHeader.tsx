import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './Button';

export interface PageHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumb?: React.ReactNode;
    actions?: React.ReactNode;
    onBack?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    breadcrumb,
    actions,
    onBack,
}) => {
    return (
        <div className="mb-6 md:mb-8">
            {breadcrumb && <div className="mb-3 text-sm text-text-muted">{breadcrumb}</div>}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            aria-label="Voltar"
                            className="shrink-0"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                    )}
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-text-main tracking-tight">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-sm md:text-base text-text-muted font-medium mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {actions && (
                    <div className="flex items-center gap-3 shrink-0">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

PageHeader.displayName = 'PageHeader';
