export const FEATURE_FLAGS = {
    CLINIC_MANAGEMENT: 'clinic_management',
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS | string;

export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
    // In the future, this can query the DB or an external service.
    // For now, it checks the environment variable.
    if (feature === FEATURE_FLAGS.CLINIC_MANAGEMENT) {
        return import.meta.env.VITE_ENABLE_CLINIC_MANAGEMENT === 'true';
    }
    return false;
};
