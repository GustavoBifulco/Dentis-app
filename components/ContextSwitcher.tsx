import React, { useState } from 'react';
import { AppContext, ContextType } from '../types';
import { Building2, FlaskConical, User, Truck, ChevronDown, Check } from 'lucide-react';

interface ContextSwitcherProps {
    availableContexts: AppContext[];
    activeContext: AppContext | null;
    onSwitch: (context: AppContext) => void;
}

const ContextSwitcher: React.FC<ContextSwitcherProps> = ({ availableContexts, activeContext, onSwitch }) => {
    const [isOpen, setIsOpen] = useState(false);

    const getContextIcon = (type: ContextType) => {
        switch (type) {
            case 'CLINIC': return <Building2 size={18} />;
            case 'LAB': return <FlaskConical size={18} />;
            case 'PATIENT': return <User size={18} />;
            case 'COURIER': return <Truck size={18} />;
        }
    };

    const getContextLabel = (type: ContextType) => {
        switch (type) {
            case 'CLINIC': return 'Clínica';
            case 'LAB': return 'Laboratório';
            case 'PATIENT': return 'Pessoal';
            case 'COURIER': return 'Entregas';
        }
    };

    if (!activeContext || availableContexts.length === 0) return null;

    return (
        <div className="relative px-4 py-3 border-b border-lux-border">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-lux-subtle transition-all group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-lux-accent/10 text-lux-accent flex items-center justify-center">
                        {getContextIcon(activeContext.type)}
                    </div>
                    <div className="text-left">
                        <p className="text-xs text-lux-text-secondary font-semibold uppercase tracking-wider">
                            {getContextLabel(activeContext.type)}
                        </p>
                        <p className="text-sm font-bold text-lux-text truncate max-w-[140px]">
                            {activeContext.name}
                        </p>
                    </div>
                </div>
                <ChevronDown
                    size={16}
                    className={`text-lux-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute left-4 right-4 top-full mt-2 bg-lux-surface border border-lux-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-2">
                            <p className="px-3 py-2 text-[10px] font-bold text-lux-text-secondary uppercase tracking-wider">
                                Trocar Contexto
                            </p>
                            {availableContexts.map((context) => {
                                const isActive = context.id === activeContext.id && context.type === activeContext.type;
                                return (
                                    <button
                                        key={`${context.type}-${context.id}`}
                                        onClick={() => {
                                            onSwitch(context);
                                            setIsOpen(false);
                                        }}
                                        className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                      ${isActive
                                                ? 'bg-lux-accent text-lux-contrast font-medium'
                                                : 'hover:bg-lux-subtle text-lux-text'
                                            }
                    `}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-lux-subtle'
                                            }`}>
                                            {getContextIcon(context.type)}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="text-xs font-semibold opacity-70">
                                                {getContextLabel(context.type)}
                                            </p>
                                            <p className="text-sm font-bold">
                                                {context.name}
                                            </p>
                                        </div>
                                        {isActive && <Check size={16} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ContextSwitcher;
