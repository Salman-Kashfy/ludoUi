import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
    server: {
        https: {
            key: 'F:/.vite-ssl/private.key',
            cert: 'F:/.vite-ssl/certificate.crt',
        },
        port: 4000
    }
})
