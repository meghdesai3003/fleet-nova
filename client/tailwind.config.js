/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        navy: {
          950: '#0C1219',
          900: '#111926',
          800: '#1A2534',
          700: '#243247',
          600: '#334159',
        },
        paper: {
          50: '#F6F7F4',
          100: '#EEF0EA',
          200: '#E2E5DC',
        },
        ink: {
          900: '#151A21',
          700: '#3A4350',
          500: '#647085',
        },
        amber: {
          400: '#F4B93D',
          500: '#EFA512',
          600: '#CE8A05',
        },
        signal: {
          teal: '#128A7E',
          sky: '#2874C9',
          rust: '#C1442A',
          slate: '#6B7686',
        },
      },
      boxShadow: {
        panel: '0 1px 2px rgba(15,23,32,0.06), 0 8px 24px -12px rgba(15,23,32,0.18)',
      },
      backgroundImage: {
        'route-dots': 'repeating-linear-gradient(90deg, currentColor 0, currentColor 4px, transparent 4px, transparent 12px)',
      },
    },
  },
  plugins: [],
};
