import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Indispensable pour Docker : écoute sur toutes les adresses IP
    host: true, 
    // Force le port 5173
    port: 5173, 
    // Si le port est pris, l'app plantera au lieu de changer de port (plus facile à débugger)
    strictPort: true,
    // Indispensable sur Windows pour que le "Hot Reload" fonctionne
    watch: {
      usePolling: true,
    }
  }
})