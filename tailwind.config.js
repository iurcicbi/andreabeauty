/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './componenti/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette calda beige/aurie pentru beauty salon
        primary: {
          50: '#faf7f2',
          100: '#f0ebe2',
          200: '#e8dccc',
          300: '#d4bfa0',
          400: '#c9a96e',
          500: '#c9a96e',
          600: '#b8975a',
          700: '#8a6a3a',
          800: '#6a4a2a',
        },
        brand: {
          dark: '#1a1a1a',
          gold: '#c9a96e',
          cream: '#faf7f2',
        },
      },
      // Breakpoint ottimizzati per mobile-first
      screens: {
        'xs': '475px',
        // sm: '640px' (default)
        // md: '768px' (default)
        // lg: '1024px' (default)
        // xl: '1280px' (default)
      },
      // Spacing ottimizzato per touch targets
      spacing: {
        'touch': '44px', // Minimo touch target iOS/Android
      },
    },
  },
  plugins: [],
};
