import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAurora } from '../../lib/AuroraOps';
import { useUser, useClerk } from '@clerk/clerk-react';
import { ViewType } from '../../types';
import {
    LayoutDashboard, Users, Calendar, DollarSign,
    TestTube, Settings, ShoppingBag, LogOut, UserCircle, ChevronDown, User as UserIcon
} from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

interface HubNodeProps {
    view: ViewType;
    icon: any;        // Lucide Icon
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const HubNode = ({ icon: Icon, label, isActive, onClick }: HubNodeProps) => {
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
                    ? 'bg-cyan-500 text-white shadow-[0_4px_12px_rgba(6,182,212,0.3)] scale-110'
                    : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-cyan-600'
                }
            `}>
                <Icon size={20} className={isActive ? 'stroke-[2.5px]' : ''} />
            </div>

            <span className={`
                text-[10px] font-bold uppercase tracking-wider transition-colors
                ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-600'}
            `}>
                {label}
            </span>

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
    const { signOut, openUserProfile } = useClerk();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const role = (user?.publicMetadata?.role as string) || 'dentist';

    const allNodes = [
        { view: ViewType.DASHBOARD, label: t('menu.dashboard'), icon: LayoutDashboard, roles: ['dentist', 'clinic_owner'] },
        { view: ViewType.PATIENTS, label: t('menu.patients'), icon: Users, roles: ['dentist', 'clinic_owner'] },
        { view: ViewType.SCHEDULE, label: t('menu.schedule'), icon: Calendar, roles: ['dentist', 'clinic_owner'] },
        { view: ViewType.FINANCE, label: t('menu.finance'), icon: DollarSign, roles: ['dentist', 'clinic_owner'] },
        { view: ViewType.LABS, label: t('menu.labs'), icon: TestTube, roles: ['dentist', 'clinic_owner'] },
        { view: ViewType.MARKETPLACE, label: t('menu.shop'), icon: ShoppingBag, roles: ['dentist', 'clinic_owner'] },
        { view: ViewType.MANAGE_CLINIC, label: t('menu.settings'), icon: Settings, roles: ['clinic_owner'] },
        { view: ViewType.SETTINGS, label: t('menu.settings'), icon: Settings, roles: ['dentist', 'patient'] },
    ];

    const nodes = allNodes.filter(node => node.roles.includes(role));

    return (
        <div className="w-full bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-[1600px] mx-auto px-6">
                <div className="flex items-center justify-between h-24">

                    {/* Left: Branding & Profile Trigger */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-4 group p-2 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                                <span className="font-black text-white text-xl">D</span>
                            </div>
                            <div className="hidden lg:block text-left">
                                <p className="text-sm font-black text-slate-900 leading-none">Dentis OS</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    {user?.firstName || 'User'} · {role === 'clinic_owner' ? 'Admin' : 'Dentista'}
                                </p>
                            </div>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showProfileMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowProfileMenu(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-20"
                                    >
                                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white shadow-sm">
                                                <img src={user?.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 leading-none">{user?.fullName}</p>
                                                <p className="text-[10px] text-slate-400 font-bold mt-1">{user?.primaryEmailAddress?.emailAddress}</p>
                                            </div>
                                        </div>

                                        <div className="p-2">
                                            <button
                                                onClick={() => { setCurrentView(ViewType.SETTINGS); setShowProfileMenu(false); }}
                                                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors text-left group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                                                    <UserIcon size={16} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">{t('settings.title')}</span>
                                            </button>

                                            <button
                                                onClick={() => { openUserProfile(); setShowProfileMenu(false); }}
                                                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors text-left group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                                    <UserCircle size={16} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">Conta Clerk</span>
                                            </button>

                                            <div className="my-2 border-t border-slate-100" />

                                            <button
                                                onClick={() => signOut()}
                                                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-rose-50 transition-colors text-left group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                                                    <LogOut size={16} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 group-hover:text-rose-600 transition-colors">Sair do Sistema</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Center: The Hub Strip */}
                    <nav className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar py-2 px-2 mask-linear">
                        {nodes.map((node) => (
                            <HubNode
                                key={node.view}
                                {...node}
                                isActive={currentView === node.view}
                                onClick={() => setCurrentView(node.view)}
                            />
                        ))}
                    </nav>

                    {/* Right: Tools & Context */}
                    <div className="hidden md:flex items-center gap-6 border-l border-slate-100 pl-8">
                        <LanguageSwitcher variant="header" />
                    </div>
                </div>
            </div>
        </div>
    );
};
