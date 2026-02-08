import React, { useState, Suspense, lazy } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { AnimatePresence } from 'framer-motion';
import { AuroraProvider, useAurora } from './lib/AuroraOps';
import { AuroraHub } from './components/aurora/AuroraHub';
import { ViewType } from './types';
import { useI18n } from './lib/i18n';

// --- COMPONENTS ---
const LandingExperience = lazy(() => import('./components/landing/LandingExperience'));
const OnboardingV2 = lazy(() => import('./components/OnboardingV2'));
const Patients = lazy(() => import('./components/Patients'));
const PatientRecord = lazy(() => import('./components/PatientRecord'));
const Schedule = lazy(() => import('./components/Schedule'));
const Finance = lazy(() => import('./components/Finance'));
const Profile = lazy(() => import('./components/Profile'));
const Labs = lazy(() => import('./components/Labs'));


// Internal component to use the hook context
const AppContent = () => {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const { currentView, setCurrentView } = useAurora();
  const { t } = useI18n();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // --- PUBLIC LANDING ---
  if (!isSignedIn) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <LandingExperience />
      </Suspense>
    );
  }

  // --- ONBOARDING CHECK ---
  const onboardingComplete = user?.publicMetadata?.onboardingComplete;
  if (!onboardingComplete) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <OnboardingV2 onComplete={() => user?.reload()} />
      </Suspense>
    );
  }

  // --- DASHBOARD APP ---
  const userRole = (user?.publicMetadata?.role as any) || 'dentist';

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        {selectedPatient ? (
          <PatientRecord
            patient={selectedPatient}
            onBack={() => setSelectedPatient(null)}
          />
        ) : (
          <>
            {/* NEW AURORA HUB NAVIGATION */}
            <AuroraHub />

            <div className="flex-1 p-6 overflow-y-auto">
              {currentView === ViewType.PATIENTS && (
                <Patients onSelectPatient={(p: any) => setSelectedPatient(p)} />
              )}
              {currentView === ViewType.SCHEDULE && <Schedule />}
              {currentView === ViewType.FINANCE && <Finance userRole={userRole} />}
              {currentView === ViewType.LABS && <Labs />}
              {currentView === ViewType.PROFILE && (
                <Profile
                  userRole={userRole}
                  onLogout={() => signOut()}
                />
              )}
              {/* Fallback for Dashboard or unmatched views */}
              {(currentView === ViewType.DASHBOARD || !currentView) && (
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">{t('greetings.welcomeBack')}</h2>
                  <p className="text-slate-500">{t('menu.dashboard')}</p>
                </div>
              )}
            </div>
          </>
        )}
      </Suspense>
    </main>
  );
};

export default function App() {
  const { isLoaded } = useAuth();

  if (!isLoaded) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <AuroraProvider>
      <AppContent />
    </AuroraProvider>
  );
}
