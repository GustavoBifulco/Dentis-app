
import React from 'react';
import { ViewType, UserRole } from '../types';
import { X, LayoutDashboard, Calendar, Users, TestTube, DollarSign, LogOut, Settings as SettingsIcon, Smile, Sparkles, FileText, PieChart, Layers, ShoppingBag } from 'lucide-react';
import Logo from './Logo';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  userRole: UserRole;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, userRole, onLogout, isOpen, onClose, theme }) => {
  
  const handleNavigation = (view: ViewType) => {
    setView(view);
    onClose(); 
  };

  const getMenus = () => {
    // Menu Comum
    const common = [
      { type: ViewType.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
      { type: ViewType.SCHEDULE, label: 'Agenda', icon: Calendar },
      { type: ViewType.PATIENTS, label: 'Pacientes', icon: Users },
      { type: ViewType.FINANCE, label: 'Financeiro', icon: DollarSign },
    ];

    // Menu Paciente
    if (userRole === 'patient') {
      const hasOrtho = true; 
      const patientItems = [
        { type: ViewType.DASHBOARD, label: 'Início', icon: LayoutDashboard },
        { type: ViewType.SCHEDULE, label: 'Agendar Consulta', icon: Calendar },
        { type: ViewType.ANAMNESIS, label: 'Minha Ficha', icon: FileText },
        { type: ViewType.PROFILE, label: 'Meus Dados', icon: Users },
      ];
      if (hasOrtho) {
        patientItems.splice(2, 0, { type: ViewType.TREATMENT_JOURNEY, label: 'Meu Tratamento', icon: Smile });
      }
      return [{ title: 'Portal do Paciente', items: patientItems }];
    }

    // Menu Gestão/Dentista
    const mgmtItems = [
        { title: 'Gestão', items: common },
        { title: 'Operacional', items: [
          { type: ViewType.MANAGEMENT_HUB, label: 'Central Operacional', icon: Layers },
        ]},
        { title: 'Conexões', items: [
          { type: ViewType.LABS, label: 'Laboratório', icon: TestTube },
          { type: ViewType.MARKETPLACE, label: 'Marketplace', icon: ShoppingBag },
        ]},
        { title: 'Estratégico', items: [
           { type: ViewType.FINANCIAL_SPLIT, label: 'Repasse & Split', icon: PieChart },
        ]}
    ];

    return mgmtItems;
  };

  const sections = getMenus();

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

        <nav className="flex-1 px-4 space-y-8 overflow-y-auto py-2">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-[11px] font-semibold text-lux-text-secondary uppercase tracking-wider mb-2 opacity-70">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
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
                      {item.type === ViewType.MARKETPLACE && (
                         <span className="text-[9px] bg-lux-subtle text-lux-text-secondary px-1.5 py-0.5 rounded ml-auto">Breve</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Widgets do Paciente */}
          {userRole === 'patient' && (
            <div className="mt-4 px-2">
              <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:scale-110 transition-transform duration-700">✨</div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">Insights</span>
                </div>
                <div className="space-y-2">
                  <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm border border-white/5">
                    <p className="text-[10px] leading-relaxed font-medium">
                      "Dica: Foco na higiene do arco superior essa semana."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sistema & Ajustes */}
          {userRole !== 'patient' && (
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

        <div className="p-6 border-t border-lux-border">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 text-lux-text-secondary hover:text-red-500 transition-colors text-sm font-medium px-2"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
