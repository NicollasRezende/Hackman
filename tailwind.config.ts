import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
<<<<<<< HEAD
        gov: {
          blue: '#1351b4',
          'blue-dark': '#0c326f',
          'blue-soft': '#e8edf7',
          'blue-line': '#dbe5f5',
          text: '#1f2a44',
          muted: '#505f79',
          bg: '#f8f9fb',
        },
=======
>>>>>>> origin/main
        verde: {
          DEFAULT: '#006633',
          med: '#00843D',
          light: '#E8F5EE',
          dim: '#F0FAF4',
        },
        ouro: {
          DEFAULT: '#E6A817',
          bg: '#FFFBEB',
          border: '#FDE68A',
        },
        gdf: {
          dark: '#111C14',
          border: '#D3E6DA',
          soft: '#F7FAF8',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
