import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/btk': {
        target: 'http://www.ihbarweb.org.tr',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/btk/, ''),
      },
      '/api/whois': {
        target: 'https://reverse-whois.whoisxmlapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/whois/, '/api/v2'),
      },
      '/api/serp': {
        target: 'https://serpapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/serp/, '/search'),
      },
      '/api/files': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});