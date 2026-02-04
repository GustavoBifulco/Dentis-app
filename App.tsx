import React, { useState, useEffect, Suspense, lazy } from 'react';
import { SignedIn, SignedOut, useUser, useClerk, useAuth } from "@clerk/clerk-react";
import { ViewType, ThemeConfig, Patient, UserRole } from './types';
import { AppContextProvider, useAppContext } from './lib/useAppContext';
import { useNavigation } from './lib/navigation';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import { Toast } from './components/Shared';
import { AnimatePresence, motion } from 'framer-motion';

// Static Imports for stability
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import PatientRecord from './components/PatientRecord';
import Schedule from './components/Schedule';
import Finance from './components/Finance';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import OnboardingV2 from './components/OnboardingV2';
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
import PatientRegister from './pages/PatientRegister';

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

  // Inicialização de Sessão
  const initSession = async (force = false) => {
    if (!user || (session && !force)) return;
    try {
      const token = await getToken();
      try {
        const res = await fetch('/api/session', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setSession(data.session);
          return;
        }
      } catch (e) { console.warn("Backend offline or error, using fallback"); }

      // Fallback
      setSession({
        user: { id: user.id, email: user.primaryEmailAddress?.emailAddress || '', name: user.fullName || '', role: (user.publicMetadata?.role as string) || UserRole.DENTIST },
        activeContext: null,
        availableContexts: [],
        onboardingComplete: !!user.publicMetadata?.onboardingComplete,
        capabilities: { isOrgAdmin: true, isHealthProfessional: true, isCourier: false, isPatient: false },
        activeOrganization: null, orgRole: 'admin'
      });
    } catch (e) { console.error("Session Init Fatal Error:", e); }
  };

  useEffect(() => {
    if (isLoaded && user) initSession();
  }, [user, isLoaded]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    navigate(ViewType.PATIENT_RECORD);
  };

  // Renderização
  const renderContent = () => {
    switch (currentView) {
      case ViewType.DASHBOARD: return <Dashboard activeContextType={session?.activeContext?.type || null} onNavigate={setCurrentView} />;
      case ViewType.PATIENTS: return <Patients onSelectPatient={handlePatientSelect} />;
      case ViewType.PATIENT_RECORD: return selectedPatient ? <PatientRecord patient={selectedPatient} onBack={() => setCurrentView(ViewType.PATIENTS)} /> : <Patients onSelectPatient={handlePatientSelect} />;
      case ViewType.SCHEDULE: return <Schedule />;
      case ViewType.FINANCE: return <Finance userRole={UserRole.DENTIST} />;
      case ViewType.PROFILE: return <Profile userRole={UserRole.DENTIST} onLogout={() => signOut()} />;
      case ViewType.SETTINGS: return <Settings onNavigate={setCurrentView} />;
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
      default: return <Dashboard activeContextType={session?.activeContext?.type || null} onNavigate={setCurrentView} />;
    }
  };

  if (!isLoaded) return <LoadingFallback />;

  return (
    <>
      <SignedOut>
        <AnimatePresence mode="wait">
          {authView ? (
            <motion.div
              key={authView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <Auth
                mode={authView}
                onSwitchMode={(mode) => setAuthView(mode)}
                onBack={handleBackToLanding}
              />
            </motion.div>
          ) : (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <Landing onStart={handleStartAuth} onLogin={handleLogin} />
            </motion.div>
          )}
        </AnimatePresence>
      </SignedOut>

      <SignedIn>
        {!(user?.publicMetadata?.onboardingComplete || session?.onboardingComplete) ? (
          <OnboardingV2 onComplete={() => {
            // Reload session after onboarding
            initSession(true);
          }} />
        ) : (
          <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
            <Sidebar currentView={currentView} setView={setCurrentView} availableContexts={session?.availableContexts || []} activeContext={session?.activeContext || null} onContextSwitch={switchContext} onLogout={() => signOut()} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
              <MobileHeader currentView={currentView} onMenuClick={() => setIsMobileMenuOpen(true)} onBackClick={goBack} title="Dentis" />
              <div className="flex-1 overflow-y-auto p-4 md:p-8 relative custom-scrollbar">
                <div className="max-w-[1600px] mx-auto pb-20">
                  <AnimatePresence mode='wait'>
                    <motion.div
                      key={currentView}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={{
                        initial: { opacity: 0, y: 20, scale: 0.99 },
                        animate: { opacity: 1, y: 0, scale: 1 },
                        exit: { opacity: 0, y: -20, scale: 0.99 }
                      }}
                      transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
                      className="h-full"
                    >
                      {renderContent()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </main>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => { }} />}
          </div>
        )}
      </SignedIn>
    </>
  );
};

const App: React.FC = () => {
  // Public routes that don't require authentication
  if (window.location.pathname === '/kiosk') return <Suspense fallback={<LoadingFallback />}><KioskMode /></Suspense>;
  if (window.location.pathname.startsWith('/register/')) return <PatientRegister />;

  return (
    <AppContextProvider>
      <AppContent />
    </AppContextProvider>
  );
};

export default App;
