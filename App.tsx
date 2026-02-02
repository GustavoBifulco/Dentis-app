import React, { useState, useEffect, Suspense, lazy } from 'react';
import { SignedIn, SignedOut, useUser, useClerk, useAuth } from "@clerk/clerk-react";
import { ViewType, ThemeConfig, Patient } from './types';
import { AppContextProvider, useAppContext } from './lib/useAppContext';
import { useNavigation } from './lib/navigation';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import { Toast } from './components/Shared';
import { AnimatePresence, motion } from 'framer-motion';

// Lazy Loading: Carrega os módulos sob demanda (Sugestão do Grok)
const Dashboard = lazy(() => import('./components/Dashboard'));
const Patients = lazy(() => import('./components/Patients'));
const PatientRecord = lazy(() => import('./components/PatientRecord'));
const Schedule = lazy(() => import('./components/Schedule'));
const Finance = lazy(() => import('./components/Finance'));
const Landing = lazy(() => import('./components/Landing'));
const Auth = lazy(() => import('./components/Auth'));
const Onboarding = lazy(() => import('./components/Onboarding'));
const Profile = lazy(() => import('./components/Profile'));
const Settings = lazy(() => import('./components/Settings'));
const TreatmentJourney = lazy(() => import('./components/TreatmentJourney'));
const Anamnesis = lazy(() => import('./components/Anamnesis'));
const ManagementHub = lazy(() => import('./components/ManagementHub'));
const Inventory = lazy(() => import('./components/Inventory'));
const Procedures = lazy(() => import('./components/Procedures'));
const ProcedureEngineer = lazy(() => import('./components/ProcedureEngineer'));
const FinancialSplit = lazy(() => import('./components/FinancialSplit'));
const Odontogram = lazy(() => import('./components/Odontogram'));
const SmartPrescription = lazy(() => import('./components/SmartPrescription'));
const TeamConfig = lazy(() => import('./components/TeamConfig'));
const Labs = lazy(() => import('./components/Labs'));
const Marketplace = lazy(() => import('./components/Marketplace'));
const KioskMode = lazy(() => import('./components/KioskMode'));
const PatientWallet = lazy(() => import('./components/PatientWallet'));

// Componente de Loading leve
const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center bg-lux-background text-lux-accent">
    <div className="animate-pulse font-medium">Carregando Dentis OS...</div>
  </div>
);

const AppContent: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { session, setSession, switchContext, toast } = useAppContext();
  const { getToken } = useAuth();

  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [history, setHistory] = useState<ViewType[]>([]);
  const { navigate, goBack } = useNavigation(currentView, setCurrentView, history, setHistory);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Estado para controlar a visualização de autenticação
  const [authView, setAuthView] = useState<'login' | 'register' | null>(() => {
    const path = window.location.pathname;
    if (path === '/login') return 'login';
    if (path === '/register') return 'register';
    return null;
  });

  // Funções de navegação para autenticação
  const handleStartAuth = () => {
    setAuthView('register');
    window.history.pushState({}, '', '/register');
  };

  const handleLogin = () => {
    setAuthView('login');
    window.history.pushState({}, '', '/login');
  };

  const handleBackToLanding = () => {
    setAuthView(null);
    window.history.pushState({}, '', '/');
  };

  // Inicialização de Sessão Otimizada
  useEffect(() => {
    const initSession = async () => {
      if (!user || session) return;
      try {
        const token = await getToken();
        // Tenta conectar ao backend, se falhar usa modo offline seguro
        try {
          const res = await fetch('/api/session', { headers: { 'Authorization': `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            setSession(data.session);
            return;
          }
        } catch (e) { console.warn("Backend offline, inicializando modo seguro"); }

        // Fallback seguro (conforme Grok)
        setSession({
          user: { id: user.id, email: user.primaryEmailAddress?.emailAddress || '', name: user.fullName || '', role: 'dentist' },
          activeContext: null,
          availableContexts: [],
          onboardingComplete: user.publicMetadata?.onboardingComplete as boolean,
          capabilities: { isOrgAdmin: true, isHealthProfessional: true, isCourier: false, isPatient: false },
          activeOrganization: null, orgRole: 'admin'
        });
      } catch (e) { console.error(e); }
    };
    if (isLoaded && user) initSession();
  }, [user, isLoaded]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    navigate(ViewType.PATIENT_RECORD);
  };

  // Renderização Dinâmica com Suspense
  const renderContent = () => (
    <Suspense fallback={<LoadingFallback />}>
      {currentView === ViewType.DASHBOARD && <Dashboard activeContextType={session?.activeContext?.type || null} onNavigate={setCurrentView} />}
      {currentView === ViewType.PATIENTS && <Patients onSelectPatient={handlePatientSelect} />}
      {currentView === ViewType.PATIENT_RECORD && (selectedPatient ? <PatientRecord patient={selectedPatient} onBack={() => setCurrentView(ViewType.PATIENTS)} /> : <Patients onSelectPatient={handlePatientSelect} />)}
      {currentView === ViewType.SCHEDULE && <Schedule />}
      {currentView === ViewType.FINANCE && <Finance userRole="dentist" />}
      {currentView === ViewType.PROFILE && <Profile userRole="dentist" onLogout={() => signOut()} />}
      {currentView === ViewType.SETTINGS && <Settings config={{ mode: 'light', accentColor: '#B59410', useGradient: false }} onConfigChange={() => { }} onNavigate={setCurrentView} />}
      {currentView === ViewType.TREATMENT_JOURNEY && <TreatmentJourney />}
      {currentView === ViewType.ANAMNESIS && <Anamnesis />}
      {currentView === ViewType.MANAGEMENT_HUB && <ManagementHub onNavigate={setCurrentView} />}
      {currentView === ViewType.INVENTORY && <Inventory />}
      {currentView === ViewType.LABS && <Labs />}
      {currentView === ViewType.MARKETPLACE && <Marketplace />}
      {currentView === ViewType.PROCEDURES && <Procedures />}
      {currentView === ViewType.PROCEDURE_ENGINEER && <ProcedureEngineer />}
      {currentView === ViewType.FINANCIAL_SPLIT && <FinancialSplit />}
      {currentView === ViewType.TEAM_SETTINGS && <TeamConfig />}
      {currentView === ViewType.CLINICAL_EXECUTION && <Odontogram />}
      {currentView === ViewType.DOCUMENTS && <SmartPrescription />}
      {currentView === ViewType.PATIENT_WALLET && <PatientWallet onBack={() => setCurrentView(ViewType.DASHBOARD)} />}
    </Suspense>
  );

  if (!isLoaded) return <LoadingFallback />;

  return (
    <>
      <SignedOut>
        <Suspense fallback={<LoadingFallback />}>
          {authView ? (
            <Auth
              mode={authView}
              onSwitchMode={(mode) => setAuthView(mode)}
              onBack={handleBackToLanding}
            />
          ) : (
            <Landing onStart={handleStartAuth} onLogin={handleLogin} />
          )}
        </Suspense>
      </SignedOut>

      <SignedIn>
        {!(user?.publicMetadata?.onboardingComplete) ? (
          <Suspense fallback={<LoadingFallback />}><Onboarding onComplete={() => setSession(prev => prev ? { ...prev, onboardingComplete: true } : null)} /></Suspense>
        ) : (
          <div className="flex h-screen overflow-hidden bg-lux-background text-lux-text">
            <Sidebar currentView={currentView} setView={setCurrentView} availableContexts={session?.availableContexts || []} activeContext={session?.activeContext || null} onContextSwitch={switchContext} onLogout={() => signOut()} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
              <MobileHeader currentView={currentView} onMenuClick={() => setIsMobileMenuOpen(true)} onBackClick={goBack} title="Dentis" />
              <div className="flex-1 overflow-y-auto p-8 relative">
                <div className="max-w-[1400px] mx-auto pb-20">
                  <AnimatePresence mode='wait'>
                    <motion.div key={currentView} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      {renderContent()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </main>
            {toast && <Toast message={toast.message} type={toast.type} />}
          </div>
        )}
      </SignedIn>
    </>
  );
};

const App: React.FC = () => {
  if (window.location.pathname === '/kiosk') return <Suspense fallback={<LoadingFallback />}><KioskMode /></Suspense>;
  return (
    <AppContextProvider>
      <AppContent />
    </AppContextProvider>
  );
};

export default App;