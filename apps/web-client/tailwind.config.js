/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#3b82f6', // blue-500
                    foreground: '#ffffff',
                },
                secondary: {
                    DEFAULT: '#64748b', // slate-500
                    foreground: '#ffffff',
                },
                destructive: {
                    DEFAULT: '#ef4444', // red-500
                    foreground: '#ffffff',
                },
                background: '#ffffff',
                foreground: '#0f172a', // slate-900
            }
        },
    },
    plugins: [],
}
