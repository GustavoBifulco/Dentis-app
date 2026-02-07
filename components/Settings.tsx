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
import { ConnectSettings } from './stripe/ConnectSettings';
import { useI18n } from '../lib/i18n';

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
  const { t, locale, setLocale } = useI18n();

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
      className={`flex items-center justify-between p-5 border-b border-border last:border-0 hover:bg-surface-hover transition-all ${onClick ? 'cursor-pointer group' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center text-text-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div>
          <span className="block font-bold text-text-main text-sm">{label}</span>
          {description && <span className="text-xs text-text-muted mt-0.5 block">{description}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {children}
        {onClick && <ChevronRight size={18} className="text-text-muted/50 group-hover:text-primary group-hover:translate-x-1 transition-all" strokeWidth={2.5} />}
      </div>
    </div>
  );

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      disabled={loading}
      className={`w-11 h-6 rounded-full transition-all duration-300 relative ${enabled ? 'bg-primary' : 'bg-text-muted/30'} ${loading ? 'opacity-50 cursor-wait' : ''}`}
    >
      <div className={`w-4 h-4 bg-surface rounded-full absolute top-1 transition-all duration-300 shadow-sm ${enabled ? 'left-6' : 'left-1'}`}></div>
    </button>
  );

  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">

      <SectionHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle', { default: "Gerencie preferências, aparência e integrações do sistema." })}
      />

      {/* Aparência */}
      <div className="bg-surface rounded-2xl shadow-lg border border-border overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
          <h3 className="font-black text-text-main flex items-center gap-2">
            <Palette size={20} />
            {t('settings.appearance')}
          </h3>
        </div>

        {/* Tema Claro/Escuro */}
        <SettingRow
          icon={theme.mode === 'light' ? Sun : Moon}
          label={t('settings.darkMode')}
          description={t('settings.darkModeDesc')}
        >
          <div className="flex bg-surface-hover p-1 rounded-lg">
            <button
              onClick={() => setTheme({ ...theme, mode: 'light' })}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${theme.mode === 'light' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted'}`}
            >
              {t('settings.light')}
            </button>
            <button
              onClick={() => setTheme({ ...theme, mode: 'dark' })}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${theme.mode === 'dark' ? 'bg-surface text-text-main shadow-sm' : 'text-text-muted'}`}
            >
              {t('settings.dark')}
            </button>
          </div>
        </SettingRow>

        {/* Cor de Destaque */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center text-text-muted">
                <Palette size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span className="block font-bold text-text-main text-sm">{t('settings.accentColor')}</span>
                <span className="text-xs text-text-muted">{t('settings.accentColorDesc')}</span>
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
      <div className="bg-surface rounded-2xl shadow-lg border border-border overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-warning/10 to-warning/5 border-b border-border">
          <h3 className="font-black text-text-main flex items-center gap-2">
            <Bell size={20} />
            {t('settings.notifications')}
          </h3>
        </div>

        <SettingRow
          icon={Bell}
          label={t('settings.notificationApps')}
          description={t('settings.notificationAppsDesc')}
        >
          <Toggle
            enabled={notifications.emailAppointments}
            onChange={() => updateNotification('emailAppointments', !notifications.emailAppointments)}
          />
        </SettingRow>

        <SettingRow
          icon={CreditCard}
          label={t('settings.notificationFinancial')}
          description={t('settings.notificationFinancialDesc')}
        >
          <Toggle
            enabled={notifications.emailPayments}
            onChange={() => updateNotification('emailPayments', !notifications.emailPayments)}
          />
        </SettingRow>

        <SettingRow
          icon={Mail}
          label={t('settings.notificationMarketing')}
          description={t('settings.notificationMarketingDesc')}
        >
          <Toggle
            enabled={notifications.emailMarketing}
            onChange={() => updateNotification('emailMarketing', !notifications.emailMarketing)}
          />
        </SettingRow>
      </div>

      {/* Equipe e Acesso */}
      <div className="bg-surface rounded-2xl shadow-lg border border-border overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-primary/5 to-secondary/10 border-b border-border">
          <h3 className="font-black text-text-main flex items-center gap-2">
            <Users2 size={20} />
            {t('settings.team')}
          </h3>
        </div>

        <SettingRow
          icon={Users2}
          label={t('settings.manageTeam')}
          description={t('settings.manageTeamDesc')}
          onClick={() => onNavigate(ViewType.MANAGE_CLINIC)}
        />

        <SettingRow
          icon={Shield}
          label={t('settings.security')}
          description={t('settings.securityDesc')}
          onClick={() => openUserProfile()}
        >
          <button onClick={() => openUserProfile()} className="text-xs font-bold text-primary hover:underline px-2">{t('settings.manage')}</button>
        </SettingRow>
      </div>

      {/* Pagamentos & Marketplace (Connect V2) */}
      <div className="bg-surface rounded-2xl shadow-lg border border-border overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-cyan-500/10 to-blue-500/5 border-b border-border">
          <h3 className="font-black text-text-main flex items-center gap-2">
            <CreditCard size={20} className="text-cyan-500" />
            {t('settings.payments')}
          </h3>
        </div>
        <div className="p-5">
          <ConnectSettings />
        </div>
        <SettingRow
          icon={Globe}
          label={t('settings.demoStorefront')}
          description={t('settings.demoStorefrontDesc')}
          onClick={() => onNavigate(ViewType.STOREFRONT)}
        />
      </div>

      {/* Sistema */}
      <div className="bg-surface rounded-2xl shadow-lg border border-border overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-surface-hover to-bg border-b border-border">
          <h3 className="font-black text-text-main flex items-center gap-2">
            <SettingsIcon size={20} />
            {t('settings.system')}
          </h3>
        </div>

        <SettingRow
          icon={Database}
          label={t('settings.backup')}
          description={t('settings.backupDesc')}
          onClick={() => onNavigate(ViewType.BACKUP)}
        />

        <SettingRow
          icon={Globe}
          label={t('settings.language')}
          description={t('settings.languageDesc')}
        >
          <div className="flex bg-surface-hover p-1 rounded-lg">
            <button
              onClick={() => setLocale('pt-BR')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${locale === 'pt-BR' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted'}`}
            >
              PT
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${locale === 'en' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale('es')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${locale === 'es' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted'}`}
            >
              ES
            </button>
          </div>
        </SettingRow>

        <SettingRow
          icon={FileText}
          label={t('settings.terms')}
          description={t('settings.termsDesc')}
          onClick={() => onNavigate(ViewType.TERMS)}
        />
      </div>

      {/* Versão */}
      <div className="text-center text-xs text-slate-400 mt-8">
        <p className="font-bold">Dentis OS v2.0.0</p>
        <p className="mt-1">{t('settings.copyright')}</p>
      </div>

    </div>
  );
};

export default Settings;
