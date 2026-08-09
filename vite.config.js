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
      '/s3-files': {
        target: 'https://allsoft-consulting.s3.ap-south-1.amazonaws.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/s3-files/, ''),
      },
    },
  },
})
