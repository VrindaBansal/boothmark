// Vite plugin to fix module import issues
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

export default function moduleFixPlugin() {
  return {
    name: 'module-fix',
    enforce: 'pre',
    resolveId(source, importer) {
      // Fix Supabase PostgREST
      if (source === '@supabase/postgrest-js' && importer?.includes('@supabase/supabase-js')) {
        const __dirname = fileURLToPath(new URL('.', import.meta.url));
        return resolve(__dirname, 'node_modules/@supabase/postgrest-js/dist/cjs/index.js');
      }

      // Fix tailwind-merge
      if (source === 'tailwind-merge') {
        const __dirname = fileURLToPath(new URL('.', import.meta.url));
        return resolve(__dirname, 'node_modules/tailwind-merge/dist/bundle-mjs.mjs');
      }

      // Fix clsx
      if (source === 'clsx') {
        const __dirname = fileURLToPath(new URL('.', import.meta.url));
        return resolve(__dirname, 'node_modules/clsx/dist/clsx.mjs');
      }

      // Fix zustand - use CJS version
      if (source === 'zustand') {
        const __dirname = fileURLToPath(new URL('.', import.meta.url));
        return resolve(__dirname, 'node_modules/zustand/index.js');
      }

      return null;
    },
    load(id) {
      // Handle tailwind-merge exports
      if (id.includes('tailwind-merge/dist/bundle-mjs.mjs')) {
        const content = readFileSync(id, 'utf8');
        return content;
      }

      // Handle clsx exports
      if (id.includes('clsx/dist/clsx.mjs')) {
        const content = readFileSync(id, 'utf8');
        return content;
      }

      return null;
    },
  };
}
