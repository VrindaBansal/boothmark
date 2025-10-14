import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
// @ts-ignore
import moduleFixPlugin from './vite-plugin-supabase-fix.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    moduleFixPlugin(),
    react(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    },
    dedupe: ['@supabase/supabase-js', '@supabase/postgrest-js'],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    target: 'esnext',
  },
  assetsInclude: ['**/*.mjs'],
  publicDir: 'public',
  optimizeDeps: {
    include: ['@supabase/supabase-js', '@supabase/postgrest-js', 'tailwind-merge', 'clsx', 'zustand'],
  },
  ssr: {
    noExternal: ['@supabase/supabase-js', 'tailwind-merge', 'zustand', 'clsx'],
  },
});
