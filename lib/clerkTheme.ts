/**
 * Dentis Clerk Theme Configuration
 * Deep appearance theming to make Clerk components look native to Dentis design system
 */
import type { Appearance } from '@clerk/types';

export const dentisClerkTheme: Appearance = {
    layout: {
        socialButtonsPlacement: 'bottom',
        socialButtonsVariant: 'blockButton',
        shimmer: true,
    },
    variables: {
        colorPrimary: 'hsl(183, 100%, 35%)', // --primary
        colorText: 'hsl(210, 20%, 15%)', // --text
        colorTextSecondary: 'hsl(210, 10%, 50%)', // --muted
        colorBackground: 'transparent',
        colorInputBackground: 'white',
        colorInputText: 'hsl(210, 20%, 15%)',
        borderRadius: '1rem',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontWeight: {
            normal: 500,
            medium: 600,
            bold: 700,
        },
        spacingUnit: '1rem',
    },
    elements: {
        // Root card - remove shadow, transparent bg
        card: 'shadow-none bg-transparent p-0',
        rootBox: 'w-full',

        // Hide default header (we use AuthShell header)
        headerTitle: 'hidden',
        headerSubtitle: 'hidden',

        // Social buttons
        socialButtonsBlockButton: `
      w-full rounded-xl border border-[hsl(var(--border))] bg-white 
      py-3 px-4 font-semibold text-[hsl(var(--text))]
      hover:bg-[hsl(var(--muted))] hover:border-[hsl(var(--primary))]
      transition-all duration-200
    `,
        socialButtonsBlockButtonText: 'font-semibold text-sm',

        // Divider
        dividerLine: 'bg-[hsl(var(--border))]',
        dividerText: 'text-xs text-[hsl(var(--text-muted))] font-medium uppercase tracking-wider',

        // Form fields
        formFieldLabel: 'font-semibold text-xs uppercase tracking-wider text-[hsl(var(--text-muted))] mb-1',
        formFieldInput: `
      w-full rounded-xl border border-[hsl(var(--border))] bg-white
      px-4 py-3 text-[hsl(var(--text))] placeholder:text-[hsl(var(--text-muted))]
      focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))]
      transition-all duration-200
    `,
        formFieldInputShowPasswordButton: 'text-[hsl(var(--text-muted))] hover:text-[hsl(var(--primary))]',
        formFieldErrorText: 'text-[hsl(var(--error))] text-xs mt-1',
        formFieldSuccessText: 'text-[hsl(var(--success))] text-xs mt-1',

        // Primary button
        formButtonPrimary: `
      w-full rounded-full py-4 px-6 
      bg-[hsl(var(--primary))] text-white font-bold text-sm uppercase tracking-wider
      hover:opacity-90 active:scale-[0.98]
      transition-all duration-200
      shadow-lg shadow-[hsl(var(--primary))]/20
    `,

        // Secondary/link buttons
        formButtonReset: 'text-[hsl(var(--primary))] font-medium hover:underline',

        // Footer links
        footerActionLink: 'text-[hsl(var(--primary))] font-semibold hover:underline',
        footerActionText: 'text-[hsl(var(--text-muted))] text-sm',

        // Identity preview (user avatar/email after first step)
        identityPreview: 'bg-[hsl(var(--muted))] rounded-xl p-3',
        identityPreviewEditButton: 'text-[hsl(var(--primary))]',

        // Alert/error states
        alert: 'bg-[hsl(var(--error-bg))] border border-[hsl(var(--error))] rounded-xl p-4',
        alertText: 'text-[hsl(var(--error))] text-sm',

        // Loading states
        spinner: 'text-[hsl(var(--primary))]',

        // OTP input
        otpCodeFieldInput: `
      w-12 h-14 text-center text-xl font-bold
      rounded-xl border border-[hsl(var(--border))] bg-white
      focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))]
    `,

        // Phone input
        phoneInputBox: 'rounded-xl border border-[hsl(var(--border))]',

        // Navbar (if shown)
        navbar: 'hidden',
        navbarButton: 'hidden',
    },
};

export default dentisClerkTheme;
