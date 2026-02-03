
import React from 'react';
import { ThemeConfig, ViewType } from '../types';
import { Moon, Sun, Check, LayoutTemplate, Palette, Users2, ChevronRight } from 'lucide-react';
import { SectionHeader } from './Shared';

interface SettingsProps {
  config: ThemeConfig;
  onConfigChange: (c: ThemeConfig) => void;
  onNavigate: (view: ViewType) => void;
}

const COLORS = [
  { name: 'Ouro Real', hex: '#B59410' },
  { name: 'Azul Safira', hex: '#0047AB' },
  { name: 'Violeta Profundo', hex: '#5b21b6' },
  { name: 'Esmeralda', hex: '#059669' },
  { name: 'Titânio', hex: '#334155' },
  { name: 'Rubi', hex: '#be123c' },
];

const Settings: React.FC<SettingsProps> = ({ config, onConfigChange, onNavigate }) => {

  const SettingRow = ({ icon: Icon, label, description, children, onClick }: any) => (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-8 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all ${onClick ? 'cursor-pointer group' : ''}`}
    >
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-slate-100/50 flex items-center justify-center text-slate-500 border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
          <Icon size={22} strokeWidth={2.5} />
        </div>
        <div>
          <span className="block font-black text-slate-900 tracking-tight text-lg">{label}</span>
          {description && <span className="text-sm text-slate-400 font-bold uppercase tracking-wider text-[10px] mt-0.5 block">{description}</span>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {children}
        {onClick && <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" strokeWidth={3} />}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <SectionHeader
        title="Ajustes do Sistema"
        subtitle="Personalize a aparência e comportamento do seu workspace."
      />

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">

        {/* Gestão de Equipe (Submenu) */}
        <SettingRow
          icon={Users2}
          label="Equipe & Permissões"
          description="Gerencie os usuários, dentistas parceiros e comissões."
          onClick={() => onNavigate(ViewType.TEAM_SETTINGS)}
        />

        {/* Tema Claro/Escuro */}
        <SettingRow
          icon={config.mode === 'light' ? Sun : Moon}
          label="Aparência do Workspace"
          description="Escolha o esquema de cores que melhor se adapta ao seu ambiente."
        >
          <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100">
            <button
              onClick={() => onConfigChange({ ...config, mode: 'light' })}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${config.mode === 'light' ? 'bg-white text-blue-600 shadow-xl shadow-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Dia
            </button>
            <button
              onClick={() => onConfigChange({ ...config, mode: 'dark' })}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${config.mode === 'dark' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/40' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Noite
            </button>
          </div>
        </SettingRow>

        {/* Estilo Visual (Gradiente) */}
        <SettingRow
          icon={LayoutTemplate}
          label="Efeitos Visuais"
          description="Ativar gradientes e transparências suaves (Glassmorphism)."
        >
          <button
            onClick={() => onConfigChange({ ...config, useGradient: !config.useGradient })}
            className={`w-14 h-8 rounded-full transition-all duration-500 relative ${config.useGradient ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-slate-200'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all duration-500 shadow-sm ${config.useGradient ? 'left-7 scale-110' : 'left-1 scale-100'}`}></div>
          </button>
        </SettingRow>

        {/* Cor de Destaque */}
        <div className="p-8">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-100/50 flex items-center justify-center text-slate-500 border border-slate-100">
              <Palette size={22} strokeWidth={2.5} />
            </div>
            <div>
              <span className="block font-black text-slate-900 tracking-tight text-lg">Identidade Visual</span>
              <span className="text-sm text-slate-400 font-bold uppercase tracking-wider text-[10px] mt-0.5 block">A cor principal que define a marca da sua clínica.</span>
            </div>
          </div>
          <div className="flex gap-4 pl-1 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => onConfigChange({ ...config, accentColor: c.hex })}
                className={`w-12 h-12 rounded-[1.25rem] shadow-lg transition-all hover:scale-110 flex items-center justify-center border-4 ${config.accentColor === c.hex ? 'border-white ring-4 ring-blue-500/10' : 'border-transparent opacity-80 hover:opacity-100'}`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              >
                {config.accentColor === c.hex && <Check size={20} strokeWidth={3} className="text-white drop-shadow-md" />}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
