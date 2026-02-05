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
                // Backgrounds
                bg: 'var(--bg)',
                surface: {
                    DEFAULT: 'var(--surface)',
                    hover: 'var(--surface-hover)',
                },

                // Text
                text: {
                    DEFAULT: 'var(--text-main)', // standard text-text
                    muted: 'var(--text-muted)',
                    desc: 'var(--text-desc)',
                },

                // Borders
                border: 'var(--border)',

                // Primary / Accent (Dynamic)
                primary: {
                    DEFAULT: 'var(--primary)',
                    hover: 'var(--primary-hover)',
                    foreground: 'var(--primary-foreground)',
                },
            },
            borderRadius: {
                sm: 'var(--radius-sm)',
                md: 'var(--radius-md)',
                lg: 'var(--radius-lg)',
                xl: 'var(--radius-xl)',
            }
        },
    },
    plugins: [],
}
