import React, { useState } from 'react';
import { ThemeConfig, ViewType } from '../types';
import {
  Moon, Sun, Check, Palette, Users2, ChevronRight,
  Bell, Lock, Globe, Database, Zap, Shield, Mail,
  CreditCard, FileText, Settings as SettingsIcon
} from 'lucide-react';
import { SectionHeader } from './Shared';
import { useAppContext } from '../lib/useAppContext';

interface SettingsProps {
  config: ThemeConfig;
  onConfigChange: (c: ThemeConfig) => void;
  onNavigate: (view: ViewType) => void;
}

const COLORS = [
  { name: 'Ouro Real', hex: '#B59410' },
  { name: 'Azul Safira', hex: '#0047AB' },
  { name: 'Violeta', hex: '#5b21b6' },
  { name: 'Esmeralda', hex: '#059669' },
  { name: 'Titânio', hex: '#334155' },
  { name: 'Rubi', hex: '#be123c' },
];

const Settings: React.FC<SettingsProps> = ({ config, onConfigChange, onNavigate }) => {
  const { showToast } = useAppContext();
  const [notifications, setNotifications] = useState({
    appointments: true,
    payments: true,
    marketing: false,
  });

  const SettingRow = ({ icon: Icon, label, description, children, onClick }: any) => (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-5 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-all ${onClick ? 'cursor-pointer group' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div>
          <span className="block font-bold text-slate-900 text-sm">{label}</span>
          {description && <span className="text-xs text-slate-500 mt-0.5 block">{description}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {children}
        {onClick && <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" strokeWidth={2.5} />}
      </div>
    </div>
  );

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-all duration-300 relative ${enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${enabled ? 'left-6' : 'left-1'}`}></div>
    </button>
  );

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
    showToast(`Notificações ${!notifications[key] ? 'ativadas' : 'desativadas'}`, 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">

      <SectionHeader
        title="Configurações"
        subtitle="Gerencie preferências, aparência e integrações do sistema."
      />

      {/* Aparência */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
          <h3 className="font-black text-slate-900 flex items-center gap-2">
            <Palette size={20} />
            Aparência
          </h3>
        </div>

        {/* Tema Claro/Escuro */}
        <SettingRow
          icon={config.mode === 'light' ? Sun : Moon}
          label="Modo de Cor"
          description="Escolha entre tema claro ou escuro"
        >
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => onConfigChange({ ...config, mode: 'light' })}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${config.mode === 'light' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              Claro
            </button>
            <button
              onClick={() => onConfigChange({ ...config, mode: 'dark' })}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${config.mode === 'dark' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500'}`}
            >
              Escuro
            </button>
          </div>
        </SettingRow>

        {/* Efeitos Visuais */}
        <SettingRow
          icon={Zap}
          label="Efeitos Visuais"
          description="Gradientes e animações suaves"
        >
          <Toggle
            enabled={config.useGradient}
            onChange={() => onConfigChange({ ...config, useGradient: !config.useGradient })}
          />
        </SettingRow>

        {/* Cor de Destaque */}
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Palette size={20} strokeWidth={2.5} />
            </div>
            <div>
              <span className="block font-bold text-slate-900 text-sm">Cor Principal</span>
              <span className="text-xs text-slate-500">Identidade visual da clínica</span>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => {
                  onConfigChange({ ...config, accentColor: c.hex });
                  showToast(`Cor alterada para ${c.name}`, 'success');
                }}
                className={`w-10 h-10 rounded-lg shadow-md transition-all hover:scale-110 flex items-center justify-center border-2 ${config.accentColor === c.hex ? 'border-white ring-2 ring-blue-500' : 'border-transparent'}`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              >
                {config.accentColor === c.hex && <Check size={16} strokeWidth={3} className="text-white" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notificações */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-slate-200">
          <h3 className="font-black text-slate-900 flex items-center gap-2">
            <Bell size={20} />
            Notificações
          </h3>
        </div>

        <SettingRow
          icon={Bell}
          label="Consultas e Agendamentos"
          description="Lembretes de consultas agendadas"
        >
          <Toggle
            enabled={notifications.appointments}
            onChange={() => handleNotificationToggle('appointments')}
          />
        </SettingRow>

        <SettingRow
          icon={CreditCard}
          label="Pagamentos e Cobranças"
          description="Alertas de pagamentos recebidos"
        >
          <Toggle
            enabled={notifications.payments}
            onChange={() => handleNotificationToggle('payments')}
          />
        </SettingRow>

        <SettingRow
          icon={Mail}
          label="Marketing e Novidades"
          description="Dicas e atualizações do sistema"
        >
          <Toggle
            enabled={notifications.marketing}
            onChange={() => handleNotificationToggle('marketing')}
          />
        </SettingRow>
      </div>

      {/* Equipe e Acesso */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200">
          <h3 className="font-black text-slate-900 flex items-center gap-2">
            <Users2 size={20} />
            Equipe e Acesso
          </h3>
        </div>

        <SettingRow
          icon={Users2}
          label="Gerenciar Equipe"
          description="Usuários, permissões e comissões"
          onClick={() => onNavigate(ViewType.TEAM_SETTINGS)}
        />

        <SettingRow
          icon={Shield}
          label="Segurança e Privacidade"
          description="Autenticação e proteção de dados"
          onClick={() => showToast('Em breve: Configurações de segurança', 'info')}
        />
      </div>

      {/* Sistema */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
          <h3 className="font-black text-slate-900 flex items-center gap-2">
            <SettingsIcon size={20} />
            Sistema
          </h3>
        </div>

        <SettingRow
          icon={Database}
          label="Backup e Dados"
          description="Exportar e restaurar informações"
          onClick={() => showToast('Em breve: Backup automático', 'info')}
        />

        <SettingRow
          icon={Globe}
          label="Idioma e Região"
          description="Português (Brasil)"
          onClick={() => showToast('Em breve: Seleção de idioma', 'info')}
        />

        <SettingRow
          icon={FileText}
          label="Termos e Privacidade"
          description="Políticas e documentos legais"
          onClick={() => showToast('Em breve: Documentos legais', 'info')}
        />
      </div>

      {/* Versão */}
      <div className="text-center text-xs text-slate-400 mt-8">
        <p className="font-bold">Dentis OS v2.0.0</p>
        <p className="mt-1">© 2024 Dentis. Todos os direitos reservados.</p>
      </div>

    </div>
  );
};

export default Settings;
