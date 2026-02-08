/**
 * SignInPage - Native Dentis sign-in page using Clerk with custom theming
 */
import React from 'react';
import { SignIn, useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell';
import { dentisClerkTheme } from '../lib/clerkTheme';
import { useI18n } from '../lib/i18n';

export default function SignInPage() {
    const { t } = useI18n();
    const { isSignedIn, isLoaded } = useAuth();

    // Redirect if already signed in
    if (isLoaded && isSignedIn) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <AuthShell
            title={t('auth.signIn')}
            subtitle={t('auth.welcomeBack')}
        >
            <SignIn
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                forceRedirectUrl="/dashboard"
                appearance={dentisClerkTheme}
            />
        </AuthShell>
    );
}
