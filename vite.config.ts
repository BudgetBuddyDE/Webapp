import { defineConfig, type CommonServerOptions } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react-swc';
// import dns from 'dns';

// Due to https://stackoverflow.com/a/75191787
// dns.setDefaultResultOrder('verbatim');

const production = process.env.NODE_ENV === 'production';

const proxy: CommonServerOptions['proxy'] = production
  ? undefined
  : {
      '/api': {
        target: 'http://localhost:8080',
        // changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    };

// https://vitejs.dev/config/
export default defineConfig({
  // https://github.com/vitejs/vite/issues/1973#issuecomment-787571499
  define: {
    'process.env': {
      BACKEND_HOST: process.env.BACKEND_HOST || 'http://localhost:8080',
      NODE_ENV: process.env.NODE_ENV,
    },
  },
  server: {
    open: true,
    host: 'localhost',
    port: 3000,
    proxy: proxy,
  },
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  build: {
    outDir: 'build',
  },
  plugins: [react()],
});
