import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { isFeatureEnabled } from '../../lib/feature-flags';

interface FeatureGateProps {
    feature: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ feature, children, fallback = null }) => {
    const { user } = useUser();

    // Convert Clerk User to internal UserSession format used by the helper
    // Note: ID logic is loose here because the flag checker mainly cares about Email or synced AllowedModules
    const userSession = user ? {
        id: Number(user.publicMetadata?.userId) || 0,
        email: user.primaryEmailAddress?.emailAddress,
        role: user.publicMetadata?.role as any,
        name: user.fullName || '',
    } : null;

    // Pass the user session to the checker
    const isEnabled = isFeatureEnabled(feature, userSession);

    if (isEnabled) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
