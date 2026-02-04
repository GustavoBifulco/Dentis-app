import React, { useState, useEffect } from 'react';
import { ViewType } from '../types';
import {
  Moon, Sun, Check, Palette, Users2, ChevronRight,
  Bell, Lock, Globe, Database, Zap, Shield, Mail,
  CreditCard, FileText, Settings as SettingsIcon,
  LogOut, UserCircle
} from 'lucide-react';
import { SectionHeader } from './Shared';
import { useAppContext } from '../lib/useAppContext';
import { UserProfile, useClerk } from '@clerk/clerk-react';
import { ColorPicker } from './ColorPicker';

interface SettingsProps {
  onNavigate: (view: ViewType) => void;
}

const COLORS = [
  { name: 'Ouro Real', hex: '#B59410' },
  { name: 'Azul Safira', hex: '#2563EB' },
  { name: 'Violeta', hex: '#7c3aed' },
  { name: 'Esmeralda', hex: '#059669' },
  { name: 'Titânio', hex: '#475569' },
  { name: 'Rubi', hex: '#dc2626' },
];

const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const { showToast, theme, setTheme, session } = useAppContext();
  const { openUserProfile } = useClerk(); // Clerk hook to open profile modal

  const [loading, setLoading] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [notifications, setNotifications] = useState({
    emailAppointments: true,
    emailPayments: true,
    emailMarketing: false,
    securityAlerts: true,
    whatsappEnabled: false,
    pushEnabled: false,
  });

  // Carregar preferências do servidor
  useEffect(() => {
    async function fetchPrefs() {
      if (!session?.user?.id) return;
      try {
        setLoading(true);
        // Em produção, o token deve ir no header Authorization.
        // Aqui estamos usando header customizado para simplificar ou conforme middleware.
        const res = await fetch('/api/settings/notifications', {
          headers: { 'X-User-Id': session.user.id }
        });
        if (res.ok) {
          const data = await res.json();
          // Remover campos de metadados se vierem
          const { id, userId, createdAt, updatedAt, ...prefs } = data;
          setNotifications(prev => ({ ...prev, ...prefs }));
        }
      } catch (error) {
        console.error("Erro ao carregar configurações", error);
        showToast("Erro ao carregar preferências", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchPrefs();
  }, [session?.user?.id]);

  // Função para salvar no servidor
  const updateNotification = async (key: string, value: boolean) => {
    const newPrefs = { ...notifications, [key]: value };
    setNotifications(newPrefs); // Atualização otimista

    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': session?.user?.id || ''
        },
        body: JSON.stringify({ [key]: value })
      });

      if (!res.ok) throw new Error();

      showToast('Preferência salva', 'success');
    } catch (error) {
      setNotifications(notifications); // Reverte em caso de erro
      showToast('Erro ao salvar preferência', 'error');
    }
  };

  const SettingRow = ({ icon: Icon, label, description, children, onClick }: any) => (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all ${onClick ? 'cursor-pointer group' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-slate-700 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all">
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div>
          <span className="block font-bold text-slate-900 dark:text-white text-sm">{label}</span>
          {description && <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">{description}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {children}
        {onClick && <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" strokeWidth={2.5} />}
      </div>
    </div>
  );

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      disabled={loading}
      className={`w-11 h-6 rounded-full transition-all duration-300 relative ${enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'} ${loading ? 'opacity-50 cursor-wait' : ''}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${enabled ? 'left-6' : 'left-1'}`}></div>
    </button>
  );

  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">

      <SectionHeader
        title="Configurações"
        subtitle="Gerencie preferências, aparência e integrações do sistema."
      />

      {/* Aparência */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Palette size={20} />
            Aparência
          </h3>
        </div>

        {/* Tema Claro/Escuro */}
        <SettingRow
          icon={theme.mode === 'light' ? Sun : Moon}
          label="Modo de Cor"
          description="Escolha entre tema claro ou escuro"
        >
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
            <button
              onClick={() => setTheme({ ...theme, mode: 'light' })}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${theme.mode === 'light' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Claro
            </button>
            <button
              onClick={() => setTheme({ ...theme, mode: 'dark' })}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${theme.mode === 'dark' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Escuro
            </button>
          </div>
        </SettingRow>

        {/* Cor de Destaque */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                <Palette size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span className="block font-bold text-slate-900 dark:text-white text-sm">Cor Principal</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Identidade visual da clínica</span>
              </div>
            </div>

            {/* Novo Seletor Moderno */}
            <ColorPicker
              color={theme.accentColor}
              onChange={(newColor) => setTheme({ ...theme, accentColor: newColor })}
            />
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
            enabled={notifications.emailAppointments}
            onChange={() => updateNotification('emailAppointments', !notifications.emailAppointments)}
          />
        </SettingRow>

        <SettingRow
          icon={CreditCard}
          label="Pagamentos e Cobranças"
          description="Alertas de pagamentos recebidos"
        >
          <Toggle
            enabled={notifications.emailPayments}
            onChange={() => updateNotification('emailPayments', !notifications.emailPayments)}
          />
        </SettingRow>

        <SettingRow
          icon={Mail}
          label="Marketing e Novidades"
          description="Dicas e atualizações do sistema"
        >
          <Toggle
            enabled={notifications.emailMarketing}
            onChange={() => updateNotification('emailMarketing', !notifications.emailMarketing)}
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
          onClick={() => onNavigate(ViewType.MANAGE_CLINIC)}
        />

        <SettingRow
          icon={Shield}
          label="Segurança da Conta"
          description="Senha, Autenticação de Dois Fatores (2FA) e Sessões"
          onClick={() => openUserProfile()}
        >
          <button onClick={() => openUserProfile()} className="text-xs font-bold text-blue-600 hover:underline px-2">Gerenciar</button>
        </SettingRow>
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
          onClick={() => onNavigate(ViewType.BACKUP)}
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
          onClick={() => onNavigate(ViewType.TERMS)}
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
