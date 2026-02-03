import React from 'react';
import { ViewType, ContextType, AppContext } from '../types';
import { X, LayoutDashboard, Calendar, Users, TestTube, DollarSign, LogOut, Settings as SettingsIcon, Smile, FileText, Layers, ShoppingBag, Truck, Package } from 'lucide-react';
import { useClerk, useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import ContextSwitcher from './ContextSwitcher';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  availableContexts: AppContext[];
  activeContext: AppContext | null;
  onContextSwitch: (context: AppContext) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setView,
  availableContexts,
  activeContext,
  onContextSwitch,
  onLogout,
  isOpen,
  onClose
}) => {
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleNavigation = (view: ViewType) => {
    setView(view);
    onClose();
  };

  const renderMenuItem = (item: any) => {
    const Icon = item.icon;
    const isActive = currentView === item.type;

    return (
      <motion.button
        key={item.type}
        onClick={() => handleNavigation(item.type)}
        whileHover={{ x: 4, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className={`
          w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors duration-200 group relative
          ${isActive
            ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-200'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }
        `}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute inset-0 bg-blue-600 rounded-xl z-0"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-3">
          <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
          <span className="text-sm">{item.label}</span>
        </span>
      </motion.button>
    );
  };

  const getMenusByContext = (): Array<{ title: string; items: any[] }> => {
    if (!activeContext) return [];

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
            ]
          },
          {
            title: 'Operacional',
            items: [
              { type: ViewType.MANAGEMENT_HUB, label: 'Central Operacional', icon: Layers },
            ]
          },
          {
            title: 'Conexões',
            items: [
              { type: ViewType.LABS, label: 'Laboratório', icon: TestTube },
              { type: ViewType.MARKETPLACE, label: 'Marketplace', icon: ShoppingBag },
            ]
          }
        ];

      case 'LAB':
        return [
          {
            title: 'Produção',
            items: [
              { type: ViewType.DASHBOARD, label: 'Kanban', icon: LayoutDashboard },
              { type: ViewType.LABS, label: 'Pedidos', icon: Package },
            ]
          },
          {
            title: 'Gestão',
            items: [
              { type: ViewType.PROCEDURES, label: 'Catálogo', icon: ShoppingBag },
              { type: ViewType.FINANCE, label: 'Financeiro', icon: DollarSign },
            ]
          },
          {
            title: 'Logística',
            items: [
              { type: ViewType.INVENTORY, label: 'Entregas', icon: Truck },
            ]
          }
        ];

      case 'PATIENT':
        return [
          {
            title: 'Portal do Paciente',
            items: [
              { type: ViewType.DASHBOARD, label: 'Início', icon: LayoutDashboard },
              { type: ViewType.SCHEDULE, label: 'Agendar Consulta', icon: Calendar },
              { type: ViewType.TREATMENT_JOURNEY, label: 'Meu Tratamento', icon: Smile },
              { type: ViewType.ANAMNESIS, label: 'Minha Ficha', icon: FileText },
              { type: ViewType.PROFILE, label: 'Meus Dados', icon: Users },
            ]
          }
        ];

      case 'COURIER':
        return [
          {
            title: 'Entregas',
            items: [
              { type: ViewType.DASHBOARD, label: 'Corridas', icon: Truck },
              { type: ViewType.FINANCE, label: 'Ganhos', icon: DollarSign },
            ]
          }
        ];

      default:
        return [];
    }
  };

  const sections = getMenusByContext();

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/10 z-40 lg:hidden backdrop-blur-sm" onClick={onClose} />}

      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: isOpen ? 0 : 0, opacity: 1 }} // Desktop always visible via CSS, mobile controlled by transform
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 h-screen flex flex-col
        transition-transform duration-300 md:transition-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-white border-r border-slate-200
      `}>
        <div className="p-8 flex justify-between items-center">
          <Logo size="md" />
          <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-slate-900"><X size={20} /></button>
        </div>

        {/* Context Switcher */}
        <div className="px-4 mb-6">
          <ContextSwitcher
            availableContexts={availableContexts}
            activeContext={activeContext}
            onSwitch={onContextSwitch}
          />
        </div>

        <nav className="flex-1 px-4 space-y-8 overflow-y-auto py-2">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => renderMenuItem(item))}
              </div>
            </div>
          ))}

          {/* Sistema & Ajustes */}
          {activeContext?.type !== 'PATIENT' && (
            <div>
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Sistema
              </p>
              <button
                onClick={() => handleNavigation(ViewType.SETTINGS)}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${currentView === ViewType.SETTINGS
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }
                `}
              >
                <SettingsIcon size={18} strokeWidth={currentView === ViewType.SETTINGS ? 2.5 : 2} className="transition-transform group-hover:scale-110" />
                <span className="text-sm">Ajustes</span>
              </button>
            </div>
          )}
        </nav>

        <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50 backdrop-blur-md sticky bottom-0">
          <div className="flex items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shadow-sm flex-shrink-0">
                <img
                  src={user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                  alt={user?.fullName || ''}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-900 truncate">{user?.fullName || 'Usuário'}</span>
                <span className="text-[11px] text-slate-500 truncate font-medium">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
              title="Sair"
            >
              <LogOut size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
