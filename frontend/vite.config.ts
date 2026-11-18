import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Fixed port: the backend's CORS config allows this exact origin
    port: 5174,
    strictPort: true,
    watch: {
      usePolling: true, // Indispensable pour WSL sous Windows !
    },
    proxy: {
      // Relais de développement : le navigateur reste sur la même origine (CORS).
      '/youtube-channel-videos': {
        target: 'https://www.youtube.com',
        changeOrigin: true,
        rewrite: () => '/feeds/videos.xml?channel_id=UCz8MkF5U6HeqLwsGBzTxQ3w',
        configure(proxy) {
          proxy.on('proxyReq', (request) => {
            // Ne pas transmettre à YouTube les cookies ou identifiants du site local.
            for (const header of ['cookie', 'authorization', 'origin', 'referer',
              'sec-fetch-site', 'sec-fetch-mode', 'sec-fetch-dest', 'sec-fetch-user']) {
              request.removeHeader(header)
            }
            request.setHeader('accept-encoding', 'identity')
            request.setHeader('user-agent', 'Mozilla/5.0')
          })
        },
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
