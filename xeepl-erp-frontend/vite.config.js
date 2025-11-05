import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,js}', // Allow JSX in .js files
    }),
  ],
  esbuild: {
    loader: 'jsx', // Add loader for .js files
    include: /\.[jt]sx?$/, // Include .js files
  },
  server: {
    hmr: {
      overlay: true, // Optional: set to false to disable error overlay
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Change this to your backend server URL
        changeOrigin: true,
        secure: false,
        // Optional: rewrite path if needed
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
