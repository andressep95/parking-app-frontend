/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Sampled from the mobile app's operation screens (img/operation_entry_screen.png,
        // img/operation_exit_screen.png) so web and mobile share one brand blue.
        brand: {
          50: '#f2f5fd',
          100: '#e0e7fb',
          200: '#bccbf6',
          300: '#8ba4ef',
          400: '#597ee8',
          500: '#436ce5',
          600: '#3662e3',
          700: '#1b47c5',
          800: '#163aa1',
          900: '#122f82',
          950: '#0c1e55',
        },
        // Mirrors the mobile app's "Libres" / success-state green.
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      },
    },
  },
  plugins: [],
};
