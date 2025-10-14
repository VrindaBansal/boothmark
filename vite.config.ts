import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'fix-supabase-imports',
      resolveId(source) {
        if (source === '@supabase/postgrest-js') {
          return { id: '@supabase/postgrest-js', external: false };
        }
        return null;
      },
    },
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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            return 'vendor';
          }
        },
      },
      external: [],
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    target: 'es2015',
  },
  assetsInclude: ['**/*.mjs'],
  publicDir: 'public',
  optimizeDeps: {
    include: ['@supabase/supabase-js', '@supabase/postgrest-js'],
  },
  ssr: {
    noExternal: ['@supabase/supabase-js'],
  },
});
