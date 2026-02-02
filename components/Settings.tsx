
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
        className={`flex items-center justify-between p-6 border-b border-lux-border last:border-0 hover:bg-lux-background/50 transition ${onClick ? 'cursor-pointer group' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-lux-subtle flex items-center justify-center text-lux-text">
          <Icon size={20} />
        </div>
        <div>
           <span className="block font-medium text-lux-text text-lg">{label}</span>
           {description && <span className="text-sm text-lux-text-secondary">{description}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
          {children}
          {onClick && <ChevronRight size={18} className="text-lux-text-secondary opacity-50 group-hover:opacity-100 transition-opacity" />}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <SectionHeader 
        title="Ajustes do Sistema" 
        subtitle="Personalize a aparência e comportamento do seu workspace." 
      />

      <div className="apple-card overflow-hidden">
        
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
            label="Aparência"
            description="Escolha entre o modo claro clínico ou modo escuro studio."
        >
            <div className="flex bg-lux-subtle p-1 rounded-lg">
              <button 
                onClick={() => onConfigChange({...config, mode: 'light'})}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${config.mode === 'light' ? 'bg-white text-black shadow-sm' : 'text-lux-text-secondary'}`}
              >
                Claro
              </button>
              <button 
                onClick={() => onConfigChange({...config, mode: 'dark'})}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${config.mode === 'dark' ? 'bg-lux-surface text-white shadow-sm' : 'text-lux-text-secondary'}`}
              >
                Escuro
              </button>
            </div>
        </SettingRow>

        {/* Estilo Visual (Gradiente) */}
        <SettingRow 
            icon={LayoutTemplate} 
            label="Estilo Vibrante"
            description="Ativar gradientes sutis no fundo e headers."
        >
          <button 
            onClick={() => onConfigChange({...config, useGradient: !config.useGradient})}
            className={`w-14 h-8 rounded-full transition-colors duration-300 relative ${config.useGradient ? 'bg-lux-accent' : 'bg-lux-border'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform duration-300 shadow-sm ${config.useGradient ? 'left-7' : 'left-1'}`}></div>
          </button>
        </SettingRow>

        {/* Cor de Destaque */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-lux-subtle flex items-center justify-center text-lux-text">
                <Palette size={20} />
              </div>
              <div>
                <span className="block font-medium text-lux-text text-lg">Cor de Destaque</span>
                <span className="text-sm text-lux-text-secondary">A cor principal para botões, links e indicadores.</span>
              </div>
          </div>
          <div className="flex gap-4 pl-14 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => onConfigChange({...config, accentColor: c.hex})}
                className={`w-10 h-10 rounded-full shadow-sm transition-transform hover:scale-110 flex items-center justify-center border-2 ${config.accentColor === c.hex ? 'border-lux-text' : 'border-transparent'}`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              >
                {config.accentColor === c.hex && <Check size={16} className="text-white drop-shadow-md" />}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
