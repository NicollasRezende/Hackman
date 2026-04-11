import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
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
