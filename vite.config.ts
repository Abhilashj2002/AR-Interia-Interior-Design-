import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 5500,
      strictPort: true,
      host: '127.0.0.1',
      allowedHosts: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5175',
          changeOrigin: true,
          rewrite: (path) => path
        },
        '/category': {
          target: 'http://localhost:5175',
          changeOrigin: true,
          rewrite: (path) => path
        },

        '/uploads': {
          target: 'http://localhost:5175',
          changeOrigin: true,
          rewrite: (path) => path
        },
        '/videos': {
          target: 'http://localhost:5175',
          changeOrigin: true,
          rewrite: (path) => path
        }
      },
      watch: {
        usePolling: true
      }
    },
    plugins: [],
    define: {
      'import.meta.env.VITE_PRO_ENGINE_KEY': JSON.stringify(env.VITE_PRO_ENGINE_KEY)
    },
    build: {
      chunkSizeWarningLimit: 1200,
      target: 'esnext',
      reportCompressedSize: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            // Heavy 3D and charting libraries get their own chunks
            if (id.includes('three')) return 'vendor-three';
            if (id.includes('chart.js')) return 'vendor-chart';
            if (id.includes('axios') || id.includes('node_modules/axios')) return 'vendor-axios';
            if (id.includes('node_modules/date-fns')) return 'vendor-date-fns';
            // Keep general vendor to reasonable size
            if (id.includes('node_modules')) return 'vendor';
          }
        },
        external: []
      },
      sourcemap: false
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    appType: 'spa'
  };
});

