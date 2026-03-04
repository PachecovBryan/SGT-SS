import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      //archivo  para engañar a la librería
      canvas: path.resolve(__dirname, 'src/shim.js'),
    },
  },
  define: {
    global: 'window',
  },
});