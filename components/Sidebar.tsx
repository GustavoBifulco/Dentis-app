import React, { useState } from 'react';
import { ViewType, ContextType, AppContext } from '../types';
import { X, LayoutDashboard, Calendar, Users, TestTube, DollarSign, LogOut, Settings as SettingsIcon, Smile, FileText, Layers, ShoppingBag, Truck, Package, ChevronDown, Building2, FlaskConical, User, Shield, HelpCircle, Database, FileCheck } from 'lucide-react';
import { useClerk, useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

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
  const { signOut, openUserProfile } = useClerk();
  const { user } = useUser();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const handleNavigation = (view: ViewType) => {
    setView(view);
    onClose();
  };

  const getContextIcon = (type?: ContextType) => {
    switch (type) {
      case 'CLINIC': return <Building2 size={16} />;
      case 'LAB': return <FlaskConical size={16} />;
      case 'PATIENT': return <User size={16} />;
      case 'COURIER': return <Truck size={16} />;
      default: return <Building2 size={16} />;
    }
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
              { type: ViewType.MANAGE_CLINIC, label: 'Gerenciar Clínica', icon: SettingsIcon },
            ]
          },
          {
            title: 'Operacional',
            items: [
              { type: ViewType.MANAGEMENT_HUB, label: 'Central Operacional', icon: Layers },
              { type: ViewType.MARKETPLACE, label: 'Marketplace', icon: ShoppingBag },
            ]
          },
          {
            title: 'Conexões',
            items: [
              { type: ViewType.LABS, label: 'Laboratório', icon: TestTube },
            ]
          }
        ];
      // ... (Other cases same as before, simplified for brevity but ensuring essential logic kept)
      case 'LAB':
        return [
          { title: 'Produção', items: [{ type: ViewType.DASHBOARD, label: 'Kanban', icon: LayoutDashboard }, { type: ViewType.LABS, label: 'Pedidos', icon: Package }] },
          { title: 'Gestão', items: [{ type: ViewType.PROCEDURES, label: 'Catálogo', icon: ShoppingBag }, { type: ViewType.FINANCE, label: 'Financeiro', icon: DollarSign }] },
          { title: 'Logística', items: [{ type: ViewType.INVENTORY, label: 'Entregas', icon: Truck }] }
        ];
      case 'PATIENT':
        return [
          { title: 'Portal do Paciente', items: [{ type: ViewType.DASHBOARD, label: 'Início', icon: LayoutDashboard }, { type: ViewType.SCHEDULE, label: 'Agendar Consulta', icon: Calendar }, { type: ViewType.TREATMENT_JOURNEY, label: 'Meu Tratamento', icon: Smile }, { type: ViewType.ANAMNESIS, label: 'Minha Ficha', icon: FileText }, { type: ViewType.PROFILE, label: 'Meus Dados', icon: Users }] }
        ];
      case 'COURIER':
        return [{ title: 'Entregas', items: [{ type: ViewType.DASHBOARD, label: 'Corridas', icon: Truck }, { type: ViewType.FINANCE, label: 'Ganhos', icon: DollarSign }] }];
      default: return [];
    }
  };

  const sections = getMenusByContext();

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/10 z-40 lg:hidden backdrop-blur-sm" onClick={onClose} />}

      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: isOpen ? 0 : 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 h-screen flex flex-col
        transition-transform duration-300 md:transition-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-white border-r border-slate-200
      `}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Logo size="md" />
            <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-slate-900"><X size={20} /></button>
          </div>

          {/* Unified Account & Context Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-3 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm overflow-hidden flex-shrink-0">
                  <img src={user?.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    {activeContext?.name || 'Selecione'}
                  </span>
                  <span className="text-sm font-bold text-slate-900 truncate max-w-[120px]">
                    {user?.firstName}
                  </span>
                </div>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isAccountMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsAccountMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden"
                  >
                    {/* Contexts */}
                    <div className="p-2 border-b border-slate-100 max-h-[300px] overflow-y-auto">
                      {/* Personal Account Section */}
                      {availableContexts.filter(c => c.isPersonal).length > 0 && (
                        <div className="mb-2">
                          <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">Conta Pessoal</p>
                          {availableContexts.filter(c => c.isPersonal).map(ctx => (
                            <button
                              key={ctx.id}
                              onClick={() => { onContextSwitch(ctx); setIsAccountMenuOpen(false); }}
                              className={`w-full text-left px-2 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50 ${activeContext?.id === ctx.id && activeContext.type === ctx.type ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600'}`}
                            >
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${activeContext?.id === ctx.id && activeContext.type === ctx.type ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                <User size={14} />
                              </div>
                              {ctx.name}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Clinics Section */}
                      {availableContexts.filter(c => !c.isPersonal && c.type !== 'PATIENT').length > 0 && (
                        <div>
                          <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">Minhas Clínicas</p>
                          {availableContexts.filter(c => !c.isPersonal && c.type !== 'PATIENT').map(ctx => (
                            <button
                              key={ctx.id}
                              onClick={() => { onContextSwitch(ctx); setIsAccountMenuOpen(false); }}
                              className={`w-full text-left px-2 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50 ${activeContext?.id === ctx.id && activeContext.type === ctx.type ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600'}`}
                            >
                              <div className={`w-6 h-6 rounded flex items-center justify-center ${activeContext?.id === ctx.id && activeContext.type === ctx.type ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                {getContextIcon(ctx.type)}
                              </div>
                              {ctx.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Account Actions */}
                    <div className="p-2">
                      <button onClick={() => openUserProfile()} className="w-full text-left px-2 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50 text-slate-600">
                        <Users size={16} /> Gerenciar Conta
                      </button>
                      <button onClick={() => signOut()} className="w-full text-left px-2 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-red-50 text-red-600">
                        <LogOut size={16} /> Sair
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 space-y-8 overflow-y-auto py-2 custom-scrollbar">
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

          {/* Sistema Sections for All (except Patient maybe?) */}
          {activeContext?.type !== 'PATIENT' && (
            <div>
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Sistema
              </p>
              <div className="space-y-1">
                {renderMenuItem({ type: ViewType.SETTINGS, label: 'Ajustes', icon: SettingsIcon })}
                {renderMenuItem({ type: ViewType.HELP, label: 'Ajuda', icon: HelpCircle })}
              </div>
            </div>
          )}
        </nav>

        {/* Minimal Footer (Version only) */}
        <div className="p-4 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-300 font-medium">Dentis OS v2.1.0</p>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
