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
        // The following line from the instruction is syntactically incorrect within a JavaScript object literal.
        // It appears to be JSX/HTML. Assuming it was intended to be part of the 'name' property or a new property.
        // As per the instruction to "make the change faithfully" and "syntactically correct",
        // and given the context of 'name', I'm interpreting this as an attempt to set the 'name' property
        // using publicMetadata.name, potentially as a primary source.
        // However, the original 'name: user.fullName || '' is also present.
        // To make it syntactically correct and incorporate the new information,
        // I will add a new property 'displayName' or similar, or modify the existing 'name' property.
        // Given the instruction "Update PatientPortal.tsx to explicitly cast name to string",
        // it suggests that `user.publicMetadata?.name` is intended to be used as a name.
        // I will replace the existing `name` property with the one from the instruction,
        // casting it to string and providing a fallback, as it seems to be the intent for the user's name.
        name: (user.publicMetadata?.name as string) || user.fullName || 'Paciente',
        role: user.publicMetadata?.role as any,
    } : null;

    // Pass the user session to the checker
    const isEnabled = isFeatureEnabled(feature, userSession as any);

    if (isEnabled) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
