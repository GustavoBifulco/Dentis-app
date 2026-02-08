import React from 'react';
import { motion } from 'framer-motion';
import { useAurora } from '../../lib/AuroraOps';
import { useUser } from '@clerk/clerk-react';
import { ViewType } from '../../types';
import {
    LayoutDashboard, Users, Calendar, DollarSign,
    TestTube, Settings, ShoppingBag
} from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

interface HubNodeProps {
    view: ViewType;
    icon: any;        // Lucide Icon
    label: string;
    isActive: boolean;
    onClick: () => void;
    angle: number;    // Angle in degrees for positioning
    radius?: number;  // Distance from center
}

const HubNode = ({ icon: Icon, label, isActive, onClick }: Omit<HubNodeProps, 'angle' | 'radius'>) => {
    return (
        <button
            onClick={onClick}
            className={`
                group relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300
                ${isActive ? 'bg-cyan-500/10' : 'hover:bg-slate-100'}
            `}
        >
            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all
                ${isActive
                    ? 'bg-cyan-500 text-white shadow-[0_4_12px_rgba(6,182,212,0.3)] scale-110'
                    : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-cyan-600'
                }
            `}>
                <Icon size={20} className={isActive ? 'stroke-[2.5px]' : ''} />
            </div>

            <span className={`
                text-[10px] font-bold uppercase tracking-wider transition-colors
                ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}
            `}>
                {label}
            </span>

            {/* Connection Line Indicator (Active only) */}
            {isActive && (
                <motion.div
                    layoutId="active-hub-indicator"
                    className="absolute -bottom-2 w-1 h-1 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,1)]"
                />
            )}
        </button>
    );
};

export const AuroraHub: React.FC = () => {
    const { currentView, setCurrentView } = useAurora();
    const { t } = useI18n();
    const { user } = useUser();

    // Default to dentist if not found (safe fallback)
    const role = (user?.publicMetadata?.role as string) || 'dentist';

    // Define the core navigation nodes
    const allNodes = [
        { view: ViewType.DASHBOARD, label: t('menu.dashboard'), icon: LayoutDashboard, roles: ['dentist', 'clinic_owner'] },
        { view: ViewType.PATIENTS, label: t('menu.patients'), icon: Users, roles: ['dentist', 'clinic_owner'] },
        { view: ViewType.SCHEDULE, label: t('menu.schedule'), icon: Calendar, roles: ['dentist', 'clinic_owner'] },
        { view: ViewType.FINANCE, label: t('menu.finance'), icon: DollarSign, roles: ['dentist', 'clinic_owner'] },
        { view: ViewType.LABS, label: t('menu.labs'), icon: TestTube, roles: ['dentist', 'clinic_owner'] },
        { view: ViewType.MARKETPLACE, label: t('menu.shop'), icon: ShoppingBag, roles: ['dentist', 'clinic_owner'] },
        // Clinic Owner specific
        { view: ViewType.MANAGE_CLINIC, label: t('menu.settings'), icon: Settings, roles: ['clinic_owner'] },
        // Settings for all
        { view: ViewType.SETTINGS, label: t('menu.settings'), icon: Settings, roles: ['dentist', 'patient'] },
    ];

    const nodes = allNodes.filter(node => node.roles.includes(role));

    return (
        <div className="w-full bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-[1600px] mx-auto px-4">
                <div className="flex items-center justify-between h-20">

                    {/* Left: Branding/Context (Placeholder for now) */}
                    <div className="hidden md:flex items-center gap-4 border-r border-slate-200 pr-6 mr-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <span className="font-black text-white text-xs">D</span>
                        </div>
                    </div>

                    {/* Center: The Hub Strip */}
                    <nav className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar py-2 px-2 mask-linear">
                        {nodes.map((node) => (
                            <HubNode
                                key={node.view}
                                {...node}
                                isActive={currentView === node.view}
                                onClick={() => setCurrentView(node.view)}
                            />
                        ))}
                    </nav>

                    {/* Right: Language Switcher & User */}
                    <div className="hidden md:flex items-center gap-4 border-l border-slate-200 pl-6 ml-2">
                        <LanguageSwitcher variant="header" />
                    </div>
                </div>
            </div>
        </div>
    );
};
