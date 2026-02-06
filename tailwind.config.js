/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./lib/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./App.tsx"
    ],
    theme: {
        extend: {
            colors: {
                // Semantic colors using HSL
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',

                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },

                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },

                // Legacy support (keep for existing components)
                bg: 'hsl(var(--background))',
                surface: {
                    DEFAULT: 'hsl(var(--surface))',
                    hover: 'hsl(var(--surface-hover))',
                },

                // Text
                text: {
                    DEFAULT: 'hsl(var(--text-main))',
                    main: 'hsl(var(--text-main))',
                    muted: 'hsl(var(--text-muted))',
                    desc: 'hsl(var(--text-desc))',
                },

                // Primary / Accent (Dynamic - Clinical Aurora Teal)
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    hover: 'hsl(var(--primary-hover))',
                    light: 'hsl(var(--primary-light))',
                    foreground: 'hsl(var(--primary-foreground))',
                },

                // Secondary
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },

                // Muted
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },

                // Accent (for AI features)
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },

                // Destructive / Error
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },

                error: {
                    DEFAULT: 'hsl(var(--error))',
                    bg: 'hsl(var(--error-bg))',
                    border: 'hsl(var(--error-border))',
                    hover: 'hsl(var(--error-hover))',
                },

                // Success
                success: {
                    DEFAULT: 'hsl(var(--success))',
                    bg: 'hsl(var(--success-bg))',
                    border: 'hsl(var(--success-border))',
                    hover: 'hsl(var(--success-hover))',
                    foreground: 'hsl(var(--success-foreground))',
                },

                // Warning
                warning: {
                    DEFAULT: 'hsl(var(--warning))',
                    bg: 'hsl(var(--warning-bg))',
                    border: 'hsl(var(--warning-border))',
                    hover: 'hsl(var(--warning-hover))',
                    foreground: 'hsl(var(--warning-foreground))',
                },

                // Info
                info: {
                    DEFAULT: 'hsl(var(--info))',
                    bg: 'hsl(var(--info-bg))',
                    border: 'hsl(var(--info-border))',
                    hover: 'hsl(var(--info-hover))',
                    foreground: 'hsl(var(--info-foreground))',
                },

                // Borders
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            borderRadius: {
                sm: 'var(--radius-sm)',
                md: 'var(--radius-md)',
                lg: 'var(--radius-lg)',
                xl: 'var(--radius-xl)',
                '2xl': 'var(--radius-2xl)',
            }
        },
    },
    plugins: [],
}
