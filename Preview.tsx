import React, { Suspense, lazy } from 'react';
const LandingExperience = lazy(() => import('./components/landing/LandingExperience'));

export default function Preview() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-mono">Loading Fluid Core...</div>}>
            <LandingExperience />
        </Suspense>
    );
}
