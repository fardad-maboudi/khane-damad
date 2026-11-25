import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, './site'),
  // .env files live at the repo root, next to package.json (Vite's root is ./site).
  envDir: __dirname,
  css: {
    postcss: path.resolve(__dirname, './postcss.config.js'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './site/src'),
      // @joorchin/client-sdk imports js-tiktoken without declaring it. The real
      // package carries ~22 MB of rank tables and the site never tokenizes
      // prompts, so both specifiers resolve to a loud stub instead.
      'js-tiktoken/lite': path.resolve(__dirname, './site/src/lib/vendor/js-tiktoken-lite.js'),
      'js-tiktoken/ranks/o200k_base': path.resolve(__dirname, './site/src/lib/vendor/js-tiktoken-ranks.js'),
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
});
