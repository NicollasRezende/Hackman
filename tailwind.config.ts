import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        verde: {
          DEFAULT: '#1351b4',
          med: '#2670e8',
          light: '#dbe8fb',
          dim: '#f8f8f8',
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
