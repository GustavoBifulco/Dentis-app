import React from 'react';
import { ChevronRight, Home, User } from 'lucide-react';
import { useAurora } from '../../lib/AuroraOps';
import { ViewType } from '../../types';

interface TrailStep {
    id: string;
    label: string;
    icon?: any;
    onClick?: () => void;
}

interface ContextTrailProps {
    steps: TrailStep[];
}

export const ContextTrail: React.FC<ContextTrailProps> = ({ steps }) => {
    const { setCurrentView } = useAurora();

    const handleHomeClick = () => {
        setCurrentView(ViewType.DASHBOARD);
    };

    return (
        <nav className="flex items-center text-sm font-medium text-slate-500 mb-6 animate-fade-in">
            {/* Root: Home */}
            <button
                onClick={handleHomeClick}
                className="hover:text-cyan-600 hover:bg-cyan-50 p-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
                <Home size={14} />
            </button>

            {/* Steps */}
            {steps.map((step, index) => {
                const isLast = index === steps.length - 1;
                const Icon = step.icon;

                return (
                    <React.Fragment key={step.id}>
                        <ChevronRight size={14} className="mx-1 text-slate-300" />

                        <button
                            onClick={step.onClick}
                            disabled={isLast}
                            className={`
                                flex items-center gap-2 px-2 py-1 rounded-lg transition-all
                                ${isLast
                                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200 cursor-default pointer-events-none font-bold'
                                    : 'hover:bg-slate-100 hover:text-slate-900'
                                }
                            `}
                        >
                            {Icon && <Icon size={14} className={isLast ? 'text-cyan-600' : ''} />}
                            {step.label}
                        </button>
                    </React.Fragment>
                );
            })}
        </nav>
    );
};
