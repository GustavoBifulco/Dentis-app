import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, useUser, useClerk } from "@clerk/clerk-react";
import { ViewType, ThemeConfig, Patient, AppContext } from './types';
import { AppContextProvider, useAppContext } from './lib/useAppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import PatientRecord from './components/PatientRecord';
import Schedule from './components/Schedule';
import Finance from './components/Finance';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import OnboardingSuccess from './components/OnboardingSuccess';
import Profile from './components/Profile';
import Settings from './components/Settings';
import TreatmentJourney from './components/TreatmentJourney';
import Anamnesis from './components/Anamnesis';
import ManagementHub from './components/ManagementHub';
import Inventory from './components/Inventory';
import Procedures from './components/Procedures';
import ProcedureEngineer from './components/ProcedureEngineer';
import FinancialSplit from './components/FinancialSplit';
import Odontogram from './components/Odontogram';
import SmartPrescription from './components/SmartPrescription';
import TeamConfig from './components/TeamConfig';
import Labs from './components/Labs';
import Marketplace from './components/Marketplace';
import KioskMode from './components/KioskMode';
import PatientWallet from './components/PatientWallet';
import { EmptyState } from './components/Shared';
import { Menu, Bell, Search, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppContent: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { session, setSession, switchContext } = useAppContext();
  const hasCompletedOnboarding = user?.publicMetadata?.onboardingComplete === true;

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    mode: 'light',
    accentColor: '#B59410',
    useGradient: false
  });

  // Initialize session with mock data (will be replaced with API call)
  useEffect(() => {
    if (user && !session) {
      // Mock available contexts based on user metadata
      const mockContexts: AppContext[] = [
        { type: 'CLINIC', id: 1, name: 'Clínica Sorriso', organizationId: 1 }
      ];

      // Check if user has patient profile
      if (user.publicMetadata?.role === 'patient') {
        mockContexts.push({ type: 'PATIENT', id: 1, name: 'Portal Pessoal' });
      }

      setSession({
        id: 1,
        clerkId: user.id,
        name: user.fullName || '',
        email: user.primaryEmailAddress?.emailAddress || '',
        professionalType: null,
        capabilities: {
          isOrgAdmin: true,
          isHealthProfessional: true,
          isCourier: false,
          isPatient: false
        },
        availableContexts: mockContexts,
        activeContext: mockContexts[0],
        activeOrganization: null,
        orgRole: 'admin'
      });
    }
  }, [user, session, setSession]);

  useEffect(() => {
    const root = window.document.documentElement;
    const style = root.style;
    root.classList.remove('light', 'dark');
    root.classList.add(themeConfig.mode);
    style.setProperty('--color-accent', themeConfig.accentColor);
    style.setProperty('--color-contrast', '#FFFFFF');
    if (themeConfig.useGradient) {
      style.setProperty('--bg-gradient', `linear-gradient(135deg, ${themeConfig.accentColor} 0%, ${adjustColor(themeConfig.accentColor, -30)} 100%)`);
    } else {
      style.setProperty('--bg-gradient', 'none');
    }
  }, [themeConfig]);

  const adjustColor = (color: string, amount: number) => {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
  }

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView(ViewType.PATIENT_RECORD);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewType.DASHBOARD:
        return <Dashboard activeContextType={session?.activeContext?.type || null} onNavigate={setCurrentView} />;
      case ViewType.PATIENTS: return <Patients onSelectPatient={handlePatientSelect} />;
      case ViewType.PATIENT_RECORD:
        return selectedPatient
          ? <PatientRecord patient={selectedPatient} onBack={() => setCurrentView(ViewType.PATIENTS)} />
          : <Patients onSelectPatient={handlePatientSelect} />;
      case ViewType.SCHEDULE: return <Schedule />;
      case ViewType.FINANCE: return <Finance userRole="dentist" />;
      case ViewType.PROFILE: return <Profile userRole="dentist" onLogout={() => signOut()} />;
      case ViewType.SETTINGS: return <Settings config={themeConfig} onConfigChange={setThemeConfig} onNavigate={setCurrentView} />;
      case ViewType.TREATMENT_JOURNEY: return <TreatmentJourney />;
      case ViewType.ANAMNESIS: return <Anamnesis />;
      case ViewType.MANAGEMENT_HUB: return <ManagementHub onNavigate={setCurrentView} />;
      case ViewType.INVENTORY: return <Inventory />;
      case ViewType.LABS: return <Labs />;
      case ViewType.MARKETPLACE: return <Marketplace />;
      case ViewType.PROCEDURES: return <Procedures />;

      case ViewType.PROCEDURE_ENGINEER: return <ProcedureEngineer />;
      case ViewType.FINANCIAL_SPLIT: return <FinancialSplit />;
      case ViewType.TEAM_SETTINGS: return <TeamConfig />;
      case ViewType.CLINICAL_EXECUTION: return <Odontogram />;
      case ViewType.DOCUMENTS: return <SmartPrescription />;
      case ViewType.PATIENT_WALLET: return <PatientWallet onBack={() => setCurrentView(ViewType.DASHBOARD)} />;
      default: return <EmptyState title="Em Breve" description="Funcionalidade em desenvolvimento." actionLabel="Voltar" onAction={() => setCurrentView(ViewType.DASHBOARD)} />;
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case ViewType.DASHBOARD: return 'Visão Geral';
      case ViewType.SCHEDULE: return 'Agenda Inteligente';
      case ViewType.PATIENTS: return 'Pacientes';
      case ViewType.PATIENT_RECORD: return 'Prontuário Digital';
      case ViewType.FINANCE: return 'Gestão Financeira';
      case ViewType.PROFILE: return 'Meu Perfil';
      case ViewType.SETTINGS: return 'Ajustes';
      case ViewType.TREATMENT_JOURNEY: return 'Meu Tratamento';
      case ViewType.ANAMNESIS: return 'Anamnese';
      case ViewType.MANAGEMENT_HUB: return 'Operacional';
      case ViewType.INVENTORY: return 'Estoque';
      case ViewType.LABS: return 'Laboratório';
      case ViewType.MARKETPLACE: return 'Marketplace';
      case ViewType.PROCEDURES: return 'Procedimentos';
      case ViewType.PROCEDURE_ENGINEER: return 'Engenharia';
      case ViewType.FINANCIAL_SPLIT: return 'Repasse';
      case ViewType.TEAM_SETTINGS: return 'Equipe';
      case ViewType.CLINICAL_EXECUTION: return 'Odontograma';
      case ViewType.DOCUMENTS: return 'Receituário';
      case ViewType.PATIENT_WALLET: return 'Carteira Digital';
      default: return 'Dentis';
    }
  };

  if (!isLoaded) return <div className="flex h-screen items-center justify-center bg-lux-background text-lux-accent">Carregando...</div>;

  return (
    <>
      <SignedOut>
        {showAuth ? (
          <Auth
            mode={authMode}
            onSwitchMode={setAuthMode}
            onBack={() => setShowAuth(false)}
          />
        ) : (
          <Landing
            onStart={() => { setAuthMode('register'); setShowAuth(true); }}
            onLogin={() => { setAuthMode('login'); setShowAuth(true); }}
          />
        )}
      </SignedOut>

      <SignedIn>
        {!hasCompletedOnboarding ? (
          window.location.search.includes('session_id=') ? (
            <OnboardingSuccess onComplete={() => window.location.reload()} />
          ) : (
            <Onboarding onComplete={() => window.location.reload()} />
          )
        ) : (
          <div className="flex h-screen overflow-hidden bg-lux-background text-lux-text transition-colors duration-500 selection:bg-lux-accent selection:text-lux-contrast">
            <Sidebar
              currentView={currentView}
              setView={setCurrentView}
              availableContexts={session?.availableContexts || []}
              activeContext={session?.activeContext || null}
              onContextSwitch={switchContext}
              onLogout={() => signOut()}
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
              <header className="flex-shrink-0 z-30 px-8 py-5 glass-panel border-b border-lux-border flex justify-between items-center transition-all">
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 text-lux-text hover:bg-lux-surface rounded-xl transition"><Menu size={24} strokeWidth={1.5} /></button>
                  <div>
                    <div className="flex items-center text-[11px] font-semibold text-lux-text-secondary uppercase tracking-wider mb-0.5">
                      <span className="opacity-70">Workspace</span>
                      <span className="mx-2 opacity-30">/</span>
                      <span className="text-lux-accent">{session?.activeContext?.name || 'Contexto'}</span>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-lux-text">{getTitle()}</h1>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="hidden md:flex items-center bg-lux-subtle border border-transparent hover:border-lux-border rounded-lg px-3 py-1.5 w-64 transition-all cursor-text group">
                    <Search size={14} className="text-lux-text-secondary mr-2 group-hover:text-lux-text transition-colors" />
                    <span className="text-sm text-lux-text-secondary font-medium">Buscar...</span>
                    <div className="ml-auto flex items-center gap-1"><Command size={10} className="text-lux-text-secondary opacity-50" /><span className="text-[10px] text-lux-text-secondary font-bold opacity-50">K</span></div>
                  </div>
                  <div className="h-6 w-[1px] bg-lux-border mx-1"></div>
                  <div className="relative">
                    <button onClick={() => setShowNotifications(!showNotifications)} className="relative text-lux-text-secondary hover:text-lux-text transition p-1">
                      <Bell size={20} strokeWidth={1.5} />
                      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-lux-background"></span>
                    </button>
                    {showNotifications && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                        <div className="absolute right-0 top-10 w-80 bg-lux-surface border border-lux-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <div className="p-3 border-b border-lux-border bg-lux-subtle/50"><h4 className="text-xs font-bold text-lux-text uppercase tracking-wider">Notificações</h4></div>
                          <div className="max-h-64 overflow-y-auto">
                            <div className="p-4 border-b border-lux-border last:border-0 hover:bg-lux-subtle cursor-pointer transition">
                              <p className="text-sm font-bold text-lux-text">Boas vindas!</p>
                              <p className="text-xs text-lux-text-secondary mt-1">Bem-vindo ao Dentis OS.</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <button onClick={() => setCurrentView(ViewType.PROFILE)} className="w-9 h-9 rounded-full overflow-hidden border border-lux-border hover:ring-2 hover:ring-lux-accent transition-all duration-300">
                    <img src={user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName}`} alt="Avatar" className="w-full h-full object-cover" />
                  </button>
                </div>
              </header>
              <div className="flex-1 overflow-y-auto p-8 relative">
                <div className="max-w-[1400px] mx-auto pb-20">
                  <AnimatePresence mode='wait'>
                    <motion.div
                      key={currentView}
                      initial={{ opacity: 0, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.99 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      {renderContent()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </main>
          </div>
        )}
      </SignedIn>
    </>
  );
};

const App: React.FC = () => {
  if (window.location.pathname === '/kiosk') {
    return <KioskMode />;
  }

  return (
    <AppContextProvider>
      <AppContent />
    </AppContextProvider>
  );
};

export default App;
