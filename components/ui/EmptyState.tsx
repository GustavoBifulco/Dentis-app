import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    action,
    secondaryAction,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 p-6 mb-6">
                <Icon className="h-12 w-12 text-indigo-600" strokeWidth={1.5} />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {title}
            </h3>

            <p className="text-sm text-gray-500 max-w-md mb-8">
                {description}
            </p>

            <div className="flex gap-3">
                {action && (
                    <button
                        onClick={action.onClick}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                        {action.label}
                    </button>
                )}

                {secondaryAction && (
                    <button
                        onClick={secondaryAction.onClick}
                        className="px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-200"
                    >
                        {secondaryAction.label}
                    </button>
                )}
            </div>
        </div>
    );
};
