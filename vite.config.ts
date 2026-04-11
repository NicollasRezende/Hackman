import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
<<<<<<< HEAD
          react:  ['react', 'react-dom'],
          lucide: ['lucide-react'],
=======
          react:   ['react', 'react-dom'],
          lucide:  ['lucide-react'],
          leaflet: ['leaflet', 'react-leaflet'],
>>>>>>> origin/main
        },
      },
    },
  },
})
