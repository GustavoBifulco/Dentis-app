import React from 'react';
import { ViewType, ContextType, AppContext } from '../types';
import { X, LayoutDashboard, Calendar, Users, TestTube, DollarSign, LogOut, Settings as SettingsIcon, Smile, FileText, Layers, ShoppingBag, Truck, Package } from 'lucide-react';
import { useClerk, useUser } from "@clerk/clerk-react";
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
      <button
        key={item.type}
        onClick={() => handleNavigation(item.type)}
        className={`
          w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group
          ${isActive
            ? 'bg-lux-accent text-lux-contrast font-medium shadow-md shadow-lux-accent/20'
            : 'text-lux-text-secondary hover:text-lux-text hover:bg-lux-subtle'
          }
        `}
      >
        <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className="transition-transform group-hover:scale-105" />
        <span className="text-sm">{item.label}</span>
      </button>
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
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm" onClick={onClose} />}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 h-screen flex flex-col
        transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        glass-panel border-r border-lux-border
      `}>
        <div className="p-8 flex justify-between items-center">
          <Logo size="md" />
          <button onClick={onClose} className="lg:hidden text-lux-text"><X size={20} /></button>
        </div>

        {/* Context Switcher */}
        <ContextSwitcher
          availableContexts={availableContexts}
          activeContext={activeContext}
          onSwitch={onContextSwitch}
        />

        <nav className="flex-1 px-4 space-y-8 overflow-y-auto py-2">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-[11px] font-semibold text-lux-text-secondary uppercase tracking-wider mb-2 opacity-70">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => renderMenuItem(item))}
              </div>
            </div>
          ))}

          {/* Sistema & Ajustes */}
          {activeContext?.type !== 'PATIENT' && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-lux-text-secondary uppercase tracking-wider mb-2 opacity-70">
                Sistema
              </p>
              <button
                onClick={() => handleNavigation(ViewType.SETTINGS)}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group
                  ${currentView === ViewType.SETTINGS
                    ? 'bg-lux-accent text-lux-contrast font-medium shadow-md shadow-lux-accent/20'
                    : 'text-lux-text-secondary hover:text-lux-text hover:bg-lux-subtle'
                  }
                `}
              >
                <SettingsIcon size={18} strokeWidth={currentView === ViewType.SETTINGS ? 2 : 1.5} className="transition-transform group-hover:scale-105" />
                <span className="text-sm">Ajustes</span>
              </button>
            </div>
          )}
        </nav>

        <div className="mt-auto p-4 border-t border-lux-border bg-lux-background/50 backdrop-blur-md sticky bottom-0">
          <div className="flex items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-lux-border flex-shrink-0">
                <img
                  src={user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                  alt={user?.fullName || ''}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-lux-text truncate">{user?.fullName || 'Usuário'}</span>
                <span className="text-[10px] text-lux-text-secondary truncate opacity-70">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              className="p-2 text-lux-text-secondary hover:text-red-500 hover:bg-rose-50 transition-all rounded-xl"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
