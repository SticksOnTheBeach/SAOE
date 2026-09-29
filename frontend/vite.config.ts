import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Fixed port: the backend's CORS config allows this exact origin
    port: 5174,
    strictPort: true,
  },
})
