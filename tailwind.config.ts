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
      },
      fontFamily: {
        sans: ['Rawline', 'Raleway', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
