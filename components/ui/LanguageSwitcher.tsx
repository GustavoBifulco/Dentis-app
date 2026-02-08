import React from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { Locale } from '../../lib/i18n/types';

interface LanguageSwitcherProps {
    variant?: 'header' | 'settings';
    className?: string;
}

const LOCALES: { code: Locale; label: string; flag: string }[] = [
    { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
];

/**
 * Language Switcher Component
 * Header variant: dropdown with globe icon
 * Settings variant: full radio button list with descriptions
 */
export function LanguageSwitcher({ variant = 'header', className = '' }: LanguageSwitcherProps) {
    const { locale, setLocale, t } = useI18n();
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentLocale = LOCALES.find(l => l.code === locale) || LOCALES[0];

    if (variant === 'settings') {
        return (
            <div className={`space-y-4 ${className}`}>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        {t('settings.language')}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('settings.languageDesc')}
                    </p>
                </div>
                <div className="space-y-2">
                    {LOCALES.map((loc) => (
                        <button
                            key={loc.code}
                            onClick={() => setLocale(loc.code)}
                            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${locale === loc.code
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                        >
                            <span className="text-2xl">{loc.flag}</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                                {loc.label}
                            </span>
                            {locale === loc.code && (
                                <span className="ml-auto text-blue-600 dark:text-blue-400 text-sm font-bold">
                                    ✓ {t('common.selected')}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Header variant - compact dropdown
    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={t('settings.language')}
            >
                <Globe size={18} className="text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {currentLocale.flag}
                </span>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                    {LOCALES.map((loc) => (
                        <button
                            key={loc.code}
                            onClick={() => {
                                setLocale(loc.code);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${locale === loc.code ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                                }`}
                        >
                            <span className="text-lg">{loc.flag}</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                {loc.label}
                            </span>
                            {locale === loc.code && (
                                <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LanguageSwitcher;
