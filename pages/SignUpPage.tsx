/**
 * SignUpPage - Native Dentis sign-up page using Clerk with custom theming
 */
import React from 'react';
import { SignUp, useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell';
import { dentisClerkTheme } from '../lib/clerkTheme';
import { useI18n } from '../lib/i18n';

export default function SignUpPage() {
    const { t } = useI18n();
    const { isSignedIn, isLoaded } = useAuth();

    // Redirect if already signed in
    if (isLoaded && isSignedIn) {
        return <Navigate to="/onboarding" replace />;
    }

    return (
        <AuthShell
            title={t('auth.signUp')}
            subtitle={t('auth.welcome')}
        >
            <SignUp
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                forceRedirectUrl="/onboarding"
                appearance={dentisClerkTheme}
            />
        </AuthShell>
    );
}
