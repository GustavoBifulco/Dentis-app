import React, { useState } from 'react';
import { ViewType, ContextType, AppContext, UserRole } from '../types';
import {
    LayoutDashboard, Calendar, Users, TestTube, DollarSign, LogOut,
    Settings as SettingsIcon, Smile, FileText, Layers, ShoppingBag,
    Truck, Package, ChevronDown, Building2, FlaskConical, User,
    Sparkles, Zap, Menu, X, HelpCircle
} from 'lucide-react';
import { useClerk, useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

interface TopbarProps {
    currentView: ViewType;
    setView: (view: ViewType) => void;
    availableContexts: AppContext[];
    activeContext: AppContext | null;
    onContextSwitch: (context: AppContext) => void;
    onLogout: () => void;
}

const Topbar: React.FC<TopbarProps> = ({
    currentView,
    setView,
    availableContexts,
    activeContext,
    onContextSwitch,
    onLogout
}) => {
    const { signOut, openUserProfile } = useClerk();
    const { user } = useUser();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [showUserPlanModal, setShowUserPlanModal] = useState(false);

    // -- Helpers --
    const getContextIcon = (type?: ContextType) => {
        switch (type) {
            case 'CLINIC': return <Building2 size={16} />;
            case 'LAB': return <FlaskConical size={16} />;
            case 'PATIENT': return <User size={16} />;
            case 'COURIER': return <Truck size={16} />;
            default: return <Building2 size={16} />;
        }
    };

    const getMenusByContext = (): Array<{ title: string; items: any[] }> => {
        if (!activeContext) return [];

        // Logic copied and adapted from Sidebar.tsx
        switch (activeContext.type) {
            case 'CLINIC':
                return [
                    {
                        title: 'Gestão',
                        items: [
                            { type: ViewType.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
                            { type: ViewType.SCHEDULE, label: 'Agenda', icon: Calendar },
                            { type: ViewType.PATIENTS, label: 'Pacientes', icon: Users },
                            { type: ViewType.FINANCE, label: 'Financeiro', icon: DollarSign },
                            ...(activeContext.isPersonal ? [] : [{ type: ViewType.MANAGE_CLINIC, label: 'Gerenciar', icon: SettingsIcon }]),
                        ]
                    },
                    {
                        title: 'Operacional',
                        items: [
                            { type: ViewType.MANAGEMENT_HUB, label: 'Central', icon: Layers },
                            { type: ViewType.COMMUNICATION, label: 'Comunicação', icon: Sparkles }, // Using Sparkles as temp placeholder if MessageSquare not imp
                        ]
                    },
                    {
                        title: 'Inteligência',
                        items: [
                            { type: ViewType.AI_ASSISTANT, label: 'Dentis AI', icon: Sparkles },
                        ]
                    },
                    // For desktop topbar, we might want to group these differently if there are too many
                    // But for now keeping structure similar
                    {
                        title: 'Conexões',
                        items: [
                            { type: ViewType.LABS, label: 'Lab', icon: TestTube },
                            { type: ViewType.MARKETPLACE, label: 'Shop', icon: ShoppingBag },
                        ]
                    }
                ];
            case 'LAB':
                return [
                    { title: 'Produção', items: [{ type: ViewType.DASHBOARD, label: 'Kanban', icon: LayoutDashboard }, { type: ViewType.LABS, label: 'Pedidos', icon: Package }] },
                    { title: 'Gestão', items: [{ type: ViewType.PROCEDURES, label: 'Catálogo', icon: ShoppingBag }, { type: ViewType.FINANCE, label: 'Financeiro', icon: DollarSign }] },
                    { title: 'Logística', items: [{ type: ViewType.INVENTORY, label: 'Entregas', icon: Truck }] }
                ];
            case 'PATIENT':
                return [
                    { title: 'Portal', items: [{ type: ViewType.DASHBOARD, label: 'Início', icon: LayoutDashboard }, { type: ViewType.SCHEDULE, label: 'Agendar', icon: Calendar }, { type: ViewType.TREATMENT_JOURNEY, label: 'Tratamento', icon: Smile }, { type: ViewType.ANAMNESIS, label: 'Ficha', icon: FileText }, { type: ViewType.PROFILE, label: 'Dados', icon: Users }] }
                ];
            case 'COURIER':
                return [{ title: 'Entregas', items: [{ type: ViewType.DASHBOARD, label: 'Corridas', icon: Truck }, { type: ViewType.FINANCE, label: 'Ganhos', icon: DollarSign }] }];
            default: return [];
        }
    };

    const menuSections = getMenusByContext();
    const allMenuItems = menuSections.flatMap(s => s.items);

    const handleNavigation = (view: ViewType) => {
        setView(view);
        setIsMobileMenuOpen(false);
    };

    // --- Renderers ---

    const renderDesktopMenuItem = (item: any) => {
        const Icon = item.icon;
        const isActive = currentView === item.type;
        return (
            <button
                key={item.type}
                onClick={() => handleNavigation(item.type)}
                className={`
          relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
          ${isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }
        `}
            >
                <Icon size={16} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                <span>{item.label}</span>
                {isActive && (
                    <motion.div
                        layoutId="topbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full translate-y-2 opacity-0"
                    // Hidden visually but could be a line bottom
                    />
                )}
            </button>
        );
    };

    const renderMobileDrawer = () => (
        <AnimatePresence>
            {isMobileMenuOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <motion.div
                        initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl flex flex-col lg:hidden"
                    >
                        <div className="p-4 flex items-center justify-between border-b border-slate-100">
                            <Logo size="sm" />
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {menuSections.map((section, idx) => (
                                <div key={idx}>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">{section.title}</h4>
                                    <div className="space-y-1">
                                        {section.items.map(item => {
                                            const Icon = item.icon;
                                            const isActive = currentView === item.type;
                                            return (
                                                <button
                                                    key={item.type}
                                                    onClick={() => handleNavigation(item.type)}
                                                    className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors
                            ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'}
                          `}
                                                >
                                                    <Icon size={18} />
                                                    <span className="text-sm font-medium">{item.label}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Mobile System Menu */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Sistema</h4>
                                <div className="space-y-1">
                                    <button onClick={() => handleNavigation(ViewType.SETTINGS)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50">
                                        <SettingsIcon size={18} /> <span className="text-sm font-medium">Ajustes</span>
                                    </button>
                                    <button onClick={() => handleNavigation(ViewType.HELP)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50">
                                        <HelpCircle size={18} /> <span className="text-sm font-medium">Ajuda</span>
                                    </button>
                                    <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50">
                                        <LogOut size={18} /> <span className="text-sm font-medium">Sair</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    return (
        <>
            {/* Topbar Container */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 flex items-center justify-between px-4 lg:px-6">

                {/* Left: Mobile Toggle + Logo */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="flex items-center gap-2">
                        <Logo size="sm" />
                        {/* Optional: Breadcrumb or Context Badge on Desktop */}
                        <div className="hidden lg:flex items-center">
                            <div className="h-4 w-px bg-slate-200 mx-2"></div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded-full">
                                {activeContext?.name || 'Carregando...'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Center: Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[50vw]">
                    {allMenuItems.map(renderDesktopMenuItem)}
                </nav>

                {/* Right: User & Actions */}
                <div className="flex items-center gap-2 lg:gap-4">
                    {/* Context Switcher Dropdown (Desktop & Mobile) */}
                    <div className="relative">
                        <button
                            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                <img src={user?.imageUrl} alt={user?.fullName || ''} className="w-full h-full object-cover" />
                            </div>
                            <ChevronDown size={14} className="text-slate-400 hidden lg:block" />
                        </button>

                        {/* Reuse UserMenu Dropdown logic here - Simplification for brevity, full menu below */}
                        <AnimatePresence>
                            {isAccountMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsAccountMenuOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                                    >
                                        {/* Header */}
                                        <div className="p-3 bg-slate-50 border-b border-slate-100">
                                            <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
                                            <p className="text-xs text-slate-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                                        </div>

                                        {/* Contexts */}
                                        <div className="p-2 border-b border-slate-100 max-h-[250px] overflow-y-auto">
                                            {availableContexts.length > 0 && (
                                                <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">Trocar Contexto</p>
                                            )}
                                            {availableContexts.map(ctx => (
                                                <button
                                                    key={ctx.id}
                                                    onClick={() => { onContextSwitch(ctx); setIsAccountMenuOpen(false); }}
                                                    className={`w-full text-left px-2 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50 ${activeContext?.id === ctx.id && activeContext.type === ctx.type ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600'}`}
                                                >
                                                    <div className={`w-6 h-6 rounded flex items-center justify-center ${activeContext?.id === ctx.id && activeContext.type === ctx.type ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                                        {getContextIcon(ctx.type)}
                                                    </div>
                                                    <span className="truncate">{ctx.name}</span>
                                                </button>
                                            ))}
                                            {activeContext?.isPersonal && (
                                                <button onClick={() => { setView(ViewType.ADD_CLINIC); setIsAccountMenuOpen(false); }} className="w-full text-left px-2 py-2 rounded-lg text-xs font-bold text-purple-600 hover:bg-purple-50">
                                                    + Adicionar Clínica
                                                </button>
                                            )}
                                        </div>

                                        {/* System Items */}
                                        <div className="p-2 border-b border-slate-100">
                                            <button onClick={() => { setView(ViewType.SETTINGS); setIsAccountMenuOpen(false); }} className="w-full text-left px-2 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50 text-slate-600">
                                                <SettingsIcon size={14} /> Ajustes
                                            </button>
                                            <button onClick={() => { setView(ViewType.HELP); setIsAccountMenuOpen(false); }} className="w-full text-left px-2 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50 text-slate-600">
                                                <HelpCircle size={14} /> Ajuda
                                            </button>
                                        </div>

                                        {/* Footer Items */}
                                        <div className="p-2">
                                            <button onClick={() => { openUserProfile(); setIsAccountMenuOpen(false); }} className="w-full text-left px-2 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50 text-slate-600">
                                                <SettingsIcon size={14} /> Gerenciar Conta
                                            </button>
                                            <button onClick={() => { signOut(); setIsAccountMenuOpen(false); }} className="w-full text-left px-2 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-red-50 text-red-600">
                                                <LogOut size={14} /> Sair
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer */}
            {renderMobileDrawer()}
        </>
    );
};

export default Topbar;
