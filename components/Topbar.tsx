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
import { useI18n } from '../lib/i18n';

interface TopbarProps {
    currentView: ViewType;
    setView: (view: ViewType) => void;
    availableContexts: AppContext[];
    activeContext: AppContext | null;
    onContextSwitch: (context: AppContext) => void;
    onLogout: () => void;
    orgRole?: string | null;
}

const Topbar: React.FC<TopbarProps> = ({
    currentView,
    setView,
    availableContexts,
    activeContext,
    onContextSwitch,
    onLogout,
    orgRole
}) => {
    const { signOut, openUserProfile } = useClerk();
    const { user } = useUser();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const { t } = useI18n();

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
                        title: t('menu.management'),
                        items: [
                            { type: ViewType.DASHBOARD, label: t('menu.dashboard'), icon: LayoutDashboard },
                            { type: ViewType.SCHEDULE, label: t('menu.schedule'), icon: Calendar },
                            { type: ViewType.PATIENTS, label: t('menu.patients'), icon: Users },
                            { type: ViewType.FINANCE, label: t('menu.finance'), icon: DollarSign },
                            ...(activeContext.isPersonal || orgRole !== 'admin' ? [] : [{ type: ViewType.MANAGE_CLINIC, label: t('menu.settings'), icon: SettingsIcon }]),
                        ]
                    },
                    {
                        title: t('menu.operational'),
                        items: [
                            { type: ViewType.MANAGEMENT_HUB, label: t('menu.central'), icon: Layers },
                            { type: ViewType.COMMUNICATION, label: t('menu.communication'), icon: Sparkles },
                        ]
                    },
                    {
                        title: t('menu.intelligence'),
                        items: [
                            { type: ViewType.AI_ASSISTANT, label: 'Dentis AI', icon: Sparkles },
                        ]
                    },
                    {
                        title: t('menu.connections'),
                        items: [
                            { type: ViewType.LABS, label: t('menu.labs'), icon: TestTube },
                            { type: ViewType.MARKETPLACE, label: t('menu.shop'), icon: ShoppingBag },
                        ]
                    }
                ];
            case 'LAB':
                return [
                    { title: t('menu.production', { defaultValue: 'Produção' }), items: [{ type: ViewType.DASHBOARD, label: t('menu.kanban', { defaultValue: 'Kanban' }), icon: LayoutDashboard }, { type: ViewType.LABS, label: t('menu.orders', { defaultValue: 'Pedidos' }), icon: Package }] },
                    { title: t('menu.management'), items: [{ type: ViewType.PROCEDURES, label: t('menu.catalog', { defaultValue: 'Catálogo' }), icon: ShoppingBag }, { type: ViewType.FINANCE, label: t('menu.finance'), icon: DollarSign }] },
                    { title: t('menu.logistics', { defaultValue: 'Logística' }), items: [{ type: ViewType.INVENTORY, label: t('menu.deliveries', { defaultValue: 'Entregas' }), icon: Truck }] }
                ];
            case 'PATIENT':
                return [
                    { title: t('menu.portal'), items: [{ type: ViewType.DASHBOARD, label: t('menu.dashboard'), icon: LayoutDashboard }, { type: ViewType.SCHEDULE, label: t('menu.schedule'), icon: Calendar }, { type: ViewType.TREATMENT_JOURNEY, label: t('menu.treatment'), icon: Smile }, { type: ViewType.ANAMNESIS, label: t('menu.records'), icon: FileText }, { type: ViewType.PROFILE, label: t('menu.profile'), icon: Users }] }
                ];
            case 'COURIER':
                return [{ title: t('menu.deliveries', { defaultValue: 'Entregas' }), items: [{ type: ViewType.DASHBOARD, label: t('menu.runs'), icon: Truck }, { type: ViewType.FINANCE, label: t('menu.gains', { defaultValue: 'Ganhos' }), icon: DollarSign }] }];
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
                        ? 'text-primary bg-primary/10'
                        : 'text-text-muted hover:text-text-main hover:bg-surface-hover'
                    }
        `}
            >
                <Icon size={16} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                <span>{item.label}</span>
                {isActive && (
                    <motion.div
                        layoutId="topbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full translate-y-2 opacity-0"
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
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <motion.div
                        initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-y-0 left-0 z-50 w-72 bg-surface shadow-xl flex flex-col lg:hidden"
                    >
                        <div className="p-4 flex items-center justify-between border-b border-border">
                            <Logo size="sm" />
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-text-muted hover:text-text-main">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {menuSections.map((section, idx) => (
                                <div key={idx}>
                                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 px-2">{section.title}</h4>
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
                            ${isActive ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-text-main hover:bg-surface-hover'}
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
                                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 px-2">{t('settings.system')}</h4>
                                <div className="space-y-1">
                                    <button onClick={() => handleNavigation(ViewType.SETTINGS)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-main hover:bg-surface-hover">
                                        <SettingsIcon size={18} /> <span className="text-sm font-medium">{t('menu.settings')}</span>
                                    </button>
                                    <button onClick={() => handleNavigation(ViewType.HELP)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-main hover:bg-surface-hover">
                                        <HelpCircle size={18} /> <span className="text-sm font-medium">{t('menu.help')}</span>
                                    </button>
                                    <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/10">
                                        <LogOut size={18} /> <span className="text-sm font-medium">{t('menu.logout')}</span>
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
            <header className="fixed top-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-md border-b border-border z-30 flex items-center justify-between px-4 lg:px-6">

                {/* Left: Mobile Toggle + Logo */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden p-2 -ml-2 text-text-muted hover:bg-surface-hover rounded-lg transition-colors"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="flex items-center gap-2">
                        <Logo size="sm" />
                        {/* Optional: Breadcrumb or Context Badge on Desktop */}
                        <div className="hidden lg:flex items-center">
                            <div className="h-4 w-px bg-border mx-2"></div>
                            <span className="text-xs font-semibold text-text-muted uppercase tracking-wide bg-muted px-2 py-0.5 rounded-full">
                                {activeContext?.name || t('common.loading')}
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
                            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-surface-hover border border-transparent hover:border-border transition-all"
                        >
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                                <img src={user?.imageUrl} alt={user?.fullName || ''} className="w-full h-full object-cover" />
                            </div>
                            <ChevronDown size={14} className="text-text-muted hidden lg:block" />
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
                                        className="absolute right-0 top-full mt-2 w-72 bg-surface rounded-xl shadow-xl border border-border z-50 overflow-hidden"
                                    >
                                        {/* Header */}
                                        <div className="p-3 bg-muted border-b border-border">
                                            <p className="text-sm font-bold text-text-main">{user?.fullName}</p>
                                            <p className="text-xs text-text-muted truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                                        </div>

                                        {/* Contexts */}
                                        <div className="p-2 border-b border-border max-h-[250px] overflow-y-auto">
                                            {availableContexts.length > 0 && (
                                                <p className="px-2 py-1 text-[10px] font-bold text-text-muted uppercase">{t('menu.switchContext')}</p>
                                            )}
                                            {availableContexts.map(ctx => (
                                                <button
                                                    key={ctx.id}
                                                    onClick={() => { onContextSwitch(ctx); setIsAccountMenuOpen(false); }}
                                                    className={`w-full text-left px-2 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-surface-hover ${activeContext?.id === ctx.id && activeContext.type === ctx.type ? 'bg-primary/10 text-primary font-bold' : 'text-text-main'}`}
                                                >
                                                    <div className={`w-6 h-6 rounded flex items-center justify-center ${activeContext?.id === ctx.id && activeContext.type === ctx.type ? 'bg-primary/20' : 'bg-muted'}`}>
                                                        {getContextIcon(ctx.type)}
                                                    </div>
                                                    <span className="truncate">{ctx.name}</span>
                                                </button>
                                            ))}
                                            {activeContext?.isPersonal && (
                                                <button onClick={() => { setView(ViewType.ADD_CLINIC); setIsAccountMenuOpen(false); }} className="w-full text-left px-2 py-2 rounded-lg text-xs font-bold text-purple-600 hover:bg-purple-50">
                                                    + {t('menu.addClinic')}
                                                </button>
                                            )}
                                        </div>

                                        {/* System Items */}
                                        <div className="p-2 border-b border-border">
                                            <button onClick={() => { setView(ViewType.SETTINGS); setIsAccountMenuOpen(false); }} className="w-full text-left px-2 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-surface-hover text-text-main">
                                                <SettingsIcon size={14} /> {t('menu.settings')}
                                            </button>
                                            <button onClick={() => { setView(ViewType.HELP); setIsAccountMenuOpen(false); }} className="w-full text-left px-2 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-surface-hover text-text-main">
                                                <HelpCircle size={14} /> {t('menu.help')}
                                            </button>
                                        </div>

                                        {/* Footer Items */}
                                        <div className="p-2">
                                            <button onClick={() => { openUserProfile(); setIsAccountMenuOpen(false); }} className="w-full text-left px-2 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-surface-hover text-text-main">
                                                <SettingsIcon size={14} /> {t('menu.manageAccount')}
                                            </button>
                                            <button onClick={() => { signOut(); setIsAccountMenuOpen(false); }} className="w-full text-left px-2 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-destructive/10 text-destructive">
                                                <LogOut size={14} /> {t('menu.logout')}
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
