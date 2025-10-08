/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#4285f4',
          600: '#1976d2',
          700: '#1565c0',
          800: '#0d47a1',
          900: '#0a3d91',
        },
        secondary: {
          500: '#2dd4da',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 25px rgba(0, 0, 0, 0.08), 0 3px 10px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
