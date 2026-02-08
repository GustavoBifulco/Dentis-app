/**
 * AuthShell - Premium layout wrapper for Dentis auth pages
 * Provides consistent branding, background, and footer for sign-in/sign-up
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '../../lib/i18n';

interface AuthShellProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export default function AuthShell({ children, title, subtitle }: AuthShellProps) {
    const { t } = useI18n();

    return (
        <div className="min-h-screen w-full flex flex-col">
            {/* Clinical Aurora gradient background */}
            <div
                className="fixed inset-0 -z-10"
                style={{
                    background: `
            radial-gradient(ellipse at 30% 20%, hsla(183, 100%, 35%, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, hsla(210, 100%, 60%, 0.10) 0%, transparent 50%),
            linear-gradient(to bottom, hsl(210, 20%, 98%), hsl(210, 15%, 95%))
          `,
                }}
            />

            {/* Top bar */}
            <header className="w-full py-6 px-6 md:px-8">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--text-muted))] hover:text-[hsl(var(--primary))] transition-colors"
                    >
                        <ArrowLeft size={16} />
                        {t('auth.backToHome')}
                    </Link>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 flex items-center justify-center px-6 py-8">
                <div className="w-full max-w-md">
                    {/* Logo + Branding */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(135deg, hsl(183, 100%, 35%), hsl(210, 100%, 50%))',
                                    boxShadow: '0 4px 12px hsla(183, 100%, 35%, 0.3)'
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5" />
                                    <path d="M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <span className="text-xl font-black tracking-tight text-[hsl(var(--text))]">
                                Dentis
                            </span>
                        </div>

                        {title && (
                            <h1 className="text-2xl md:text-3xl font-black text-[hsl(var(--text))] mb-2">
                                {title}
                            </h1>
                        )}
                        {subtitle && (
                            <p className="text-sm text-[hsl(var(--text-muted))] font-medium">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {/* Auth content (SignIn/SignUp) */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-[hsl(var(--border))] p-6 md:p-8 shadow-xl shadow-black/5">
                        {children}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-6 px-6">
                <div className="max-w-md mx-auto flex flex-col md:flex-row items-center justify-center gap-4 text-xs text-[hsl(var(--text-muted))]">
                    <span>© {new Date().getFullYear()} Dentis</span>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/terms"
                            className="hover:text-[hsl(var(--primary))] transition-colors font-medium"
                        >
                            {t('auth.termsLink')}
                        </Link>
                        <Link
                            to="/privacy"
                            className="hover:text-[hsl(var(--primary))] transition-colors font-medium"
                        >
                            {t('auth.privacyLink')}
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
