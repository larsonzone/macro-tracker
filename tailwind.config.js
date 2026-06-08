/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          950: '#022c22',
          900: '#064e3b',
          800: '#065f46',
          700: '#047857',
          600: '#059669',
          500: '#10b981',
          400: '#34d399',
          300: '#6ee7b7',
          200: '#a7f3d0',
          100: '#d1fae5',
          50:  '#ecfdf5',
        },
        gold: {
          950: '#1a1000',
          900: '#3d2800',
          800: '#7a4f00',
          700: '#a36a00',
          600: '#c98500',
          500: '#d4a017',
          400: '#e4b84a',
          300: '#f0cc7a',
          200: '#f7e0ab',
          100: '#fbf0d6',
          50:  '#fefaf0',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'emerald-radial': 'radial-gradient(ellipse at top left, #064e3b 0%, #022c22 60%, #011812 100%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(212,160,23,0.15), 0 4px 16px rgba(0,0,0,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.25), 0 1px 4px rgba(0,0,0,0.15)',
        'inner-gold': 'inset 0 1px 0 rgba(212,160,23,0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,160,23,0)' },
          '50%': { boxShadow: '0 0 0 6px rgba(212,160,23,0.1)' },
        },
      },
    },
  },
  plugins: [],
}
