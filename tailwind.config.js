/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        emerald: {
          950: '#020f09', 900: '#052e16', 800: '#065f46',
          700: '#047857', 600: '#059669', 500: '#10b981',
          400: '#34d399', 300: '#6ee7b7', 200: '#a7f3d0',
          100: '#d1fae5', 50: '#ecfdf5',
        },
        gold: {
          950: '#1a1000', 900: '#3d2800', 800: '#7a4f00',
          700: '#a36a00', 600: '#c98500', 500: '#d4a017',
          400: '#e4b84a', 300: '#f0cc7a', 200: '#f7e0ab',
          100: '#fbf0d6', 50: '#fefaf0',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: { '3xl': '1.5rem', '4xl': '2rem' },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}
