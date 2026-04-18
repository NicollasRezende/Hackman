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
        tc: {
          bg: '#1A1614',
          surface: '#231F1D',
          card: '#2A2523',
          elevated: '#332E2B',
          border: '#3D3734',
          'border-light': '#4A433F',
          accent: '#E07A5F',
          'accent-hover': '#C96A52',
          'accent-light': 'rgba(224,122,95,0.15)',
          text: '#F5F0EB',
          'text-secondary': '#B8AFA8',
          'text-muted': '#857B74',
          success: '#4ADE80',
          'success-bg': 'rgba(74,222,128,0.12)',
          warning: '#FBBF24',
          'warning-bg': 'rgba(251,191,36,0.12)',
          danger: '#F87171',
          'danger-bg': 'rgba(248,113,113,0.12)',
          info: '#60A5FA',
          'info-bg': 'rgba(96,165,250,0.12)',
        },
      },
      fontFamily: {
        sans: ['Rawline', 'Raleway', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
