
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Configurar base path para GitHub Pages
  base: mode === 'production' ? '/subscription-blueprint-hub/' : '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['react-datepicker', 'date-fns']
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-toast'],
          supabase: ['@supabase/supabase-js'],
          utils: ['date-fns', 'clsx', 'tailwind-merge']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    assetsDir: 'assets'
  },
}));
