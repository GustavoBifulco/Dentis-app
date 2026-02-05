/**
 * Feature Flags & Graceful Degradation
 * Detects which external services are configured and enables/disables features accordingly
 */

/**
 * Check if environment variables are set and valid
 */
const isEnvSet = (key: string): boolean => {
    const value = process.env[key];
    return !!(value && value.trim() !== '' && value !== 'undefined');
};

/**
 * Feature availability flags
 */
export const features = {
    // AI Assistant (OpenAI)
    ai: isEnvSet('OPENAI_API_KEY'),

    // Payments (Stripe)
    payments: isEnvSet('STRIPE_SECRET_KEY') && isEnvSet('STRIPE_WEBHOOK_SECRET'),

    // File uploads (S3/R2)
    uploads: isEnvSet('S3_ACCESS_KEY') && isEnvSet('S3_SECRET_KEY') && isEnvSet('S3_BUCKET_NAME'),

    // Email (SMTP)
    email: isEnvSet('SMTP_HOST') && isEnvSet('SMTP_USER'),

    // WhatsApp API
    whatsapp: isEnvSet('WHATSAPP_API_KEY'),

    // Database (always required)
    database: isEnvSet('DATABASE_URL'),

    // Authentication (always required)
    auth: isEnvSet('CLERK_SECRET_KEY') && isEnvSet('CLERK_PUBLISHABLE_KEY')
};

/**
 * Get human-readable status
 */
export const getFeatureStatus = () => {
    return Object.entries(features).map(([name, enabled]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        enabled,
        status: enabled ? '✓ Enabled' : '✗ Disabled'
    }));
};

/**
 * Log feature status on startup
 */
export const logFeatureStatus = () => {
    console.log('\n🔧 Feature Status:');
    getFeatureStatus().forEach(({ name, enabled }) => {
        const icon = enabled ? '✓' : '✗';
        const color = enabled ? '\x1b[32m' : '\x1b[33m'; // Green or Yellow
        const reset = '\x1b[0m';
        console.log(`  ${color}${icon}${reset} ${name}: ${enabled ? 'Enabled' : 'Disabled'}`);
    });
    console.log('');
};

/**
 * Validate critical features
 * Throws error if required features are not available
 */
export const validateCriticalFeatures = () => {
    const critical = ['database', 'auth'];
    const missing = critical.filter(key => !features[key as keyof typeof features]);

    if (missing.length > 0) {
        throw new Error(
            `❌ Critical features not configured: ${missing.join(', ')}\n` +
            'Please check your environment variables (.env file)'
        );
    }
};

/**
 * Helper to check feature before using
 */
export const requireFeature = (feature: keyof typeof features, errorMessage?: string) => {
    if (!features[feature]) {
        const defaultMessage = `Feature "${feature}" is not available. Please contact support to enable this feature.`;
        throw new Error(errorMessage || defaultMessage);
    }
};

/**
 * Get user-friendly error for disabled feature
 */
export const getFeatureError = (feature: keyof typeof features): string => {
    const messages: Record<keyof typeof features, string> = {
        ai: 'Assistente de IA não está disponível no momento. Entre em contato com o suporte para habilitar este recurso.',
        payments: 'Sistema de pagamentos não está configurado. Entre em contato com o suporte.',
        uploads: 'Upload de arquivos não está disponível. Entre em contato com o suporte.',
        email: 'Envio de e-mails não está configurado. Entre em contato com o suporte.',
        whatsapp: 'Envio de WhatsApp não está disponível. Entre em contato com o suporte.',
        database: 'Erro de conexão com o banco de dados.',
        auth: 'Sistema de autenticação não está configurado corretamente.'
    };

    return messages[feature] || 'Este recurso não está disponível.';
};
