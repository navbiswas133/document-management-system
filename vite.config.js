import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'lodash/debounce': 'lodash/debounce.js',
    },
  },
  server: {
    proxy: {
      '/api/documentManagement': {
        target: 'https://apis.allsoft.co',
        changeOrigin: true,
        secure: true,
        timeout: 60000,
      },
      '/s3-files': {
        target: 'https://allsoft-consulting.s3.ap-south-1.amazonaws.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/s3-files/, ''),
      },
    },
  },
  preview: {
    proxy: {
      '/api/documentManagement': {
        target: 'https://apis.allsoft.co',
        changeOrigin: true,
        secure: true,
        timeout: 60000,
      },
      '/s3-files': {
        target: 'https://allsoft-consulting.s3.ap-south-1.amazonaws.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/s3-files/, ''),
      },
    },
  },
})
