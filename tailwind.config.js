/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf3',
          100: '#d1fae1',
          200: '#a7f3c9',
          300: '#6ee7a8',
          400: '#34d382',
          500: '#10b965',
          DEFAULT: '#00F076', // Electric green
          neon: '#00F076',
          hover: '#00D668',
          dark: '#059669',
        },
        navy: {
          950: '#070B11',
          900: '#0B0F17', // Main dark background
          850: '#111827',
          800: '#161F30', // Card background
          750: '#1E293B',
          700: '#334155',
        },
        charcoal: {
          900: '#121417',
          800: '#1B1E23',
          700: '#262A32',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 240, 118, 0.35)',
        'neon-sm': '0 0 10px rgba(0, 240, 118, 0.25)',
        'card-dark': '0 4px 20px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
