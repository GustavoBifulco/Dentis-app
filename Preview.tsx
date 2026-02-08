import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import App from './App';

const LandingExperience = lazy(() => import('./components/landing/LandingExperience'));

export default function Preview() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-mono">Loading Dentis OS...</div>}>
                <Routes>
                    <Route path="/sign-in" element={<SignInPage />} />
                    <Route path="/sign-up" element={<SignUpPage />} />

                    {/* 
                       Existing logic: App handles "if not signed in -> LandingExperience". 
                       So we keep App at root. But we need to make sure App doesn't conflict with /sign-in 
                    */}
                    <Route path="/*" element={<App />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
