import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'gov-blue': {
          DEFAULT: '#1351B4',
          dark: '#0C326F',
          light: '#DBE8FB',
          dim: '#EEF4FD',
        },
        'gov-green': {
          DEFAULT: '#168821',
        },
        verde: {
          DEFAULT: '#168821',
          light: '#DAF2DC',
          med: '#0d6b18',
        },
        ouro: {
          DEFAULT: '#ffcd07',
          bg: '#fff8db',
          border: '#f3d96a',
        },
        gdf: {
          dark: '#071d41',
          border: '#ededed',
          soft: '#f8f8f8',
        },
        trilha: {
          DEFAULT: '#4F46E5',
          dark: '#3730A3',
          light: '#EEF2FF',
          soft: '#F5F7FF',
          border: '#C7D2FE',
          accent: '#818CF8',
          success: '#059669',
          warning: '#D97706',
          danger: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Rawline', 'Raleway', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
