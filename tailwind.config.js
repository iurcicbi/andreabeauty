/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './componenti/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette colori per barber shop
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        barber: {
          dark: '#1a1a1a',
          gold: '#d4af37',
          cream: '#f5f5dc',
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
