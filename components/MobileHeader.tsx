import React from 'react';
import { Menu, ChevronLeft, Bell } from 'lucide-react';
import { ViewType } from '../types';
import { useUser } from '@clerk/clerk-react';

interface MobileHeaderProps {
    currentView: ViewType;
    onMenuClick: () => void;
    onBackClick: () => void;
    title: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
    currentView,
    onMenuClick,
    onBackClick,
    title
}) => {
    const { user } = useUser();
    const isHome = currentView === ViewType.DASHBOARD;

    return (
        <header className="lg:hidden flex items-center justify-between px-6 py-4 glass-panel border-b border-lux-border sticky top-0 z-40 bg-lux-background/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
                {isHome ? (
                    <button
                        onClick={onMenuClick}
                        className="p-2 -ml-2 text-lux-text hover:bg-lux-subtle rounded-xl transition-all active:scale-95"
                        aria-label="Abrir Menu"
                    >
                        <Menu size={24} strokeWidth={1.5} />
                    </button>
                ) : (
                    <button
                        onClick={onBackClick}
                        className="p-2 -ml-2 text-lux-accent hover:bg-lux-subtle rounded-xl transition-all active:scale-95 flex items-center gap-1"
                        aria-label="Voltar"
                    >
                        <ChevronLeft size={24} strokeWidth={2.5} />
                    </button>
                )}
                <div>
                    <span className="text-[10px] font-bold text-lux-text-secondary uppercase tracking-[0.2em] block leading-none mb-1 opacity-60">
                        {isHome ? 'Dentis OS' : 'Voltar'}
                    </span>
                    <h1 className="text-lg font-bold tracking-tight text-lux-text truncate max-w-[180px] leading-none">
                        {title}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button className="relative p-2 text-lux-text-secondary">
                    <Bell size={20} strokeWidth={1.5} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-lux-background"></span>
                </button>
                <div className="w-8 h-8 rounded-full border border-lux-border overflow-hidden bg-lux-subtle">
                    <img
                        src={user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                        alt="User"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </header>
    );
};

export default MobileHeader;
