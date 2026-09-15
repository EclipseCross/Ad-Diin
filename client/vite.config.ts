import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Three.js ecosystem (lazy-loaded by ImmersiveHome)
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          // UI helpers
          'vendor-ui': ['gsap', 'lucide-react', 'react-hot-toast'],
        },
      },
    },
  },
})
