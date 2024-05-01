import react from '@vitejs/plugin-react-swc';
import dotenv from 'dotenv';
import path from 'path';
import {defineConfig} from 'vite';
import {ViteEjsPlugin} from 'vite-plugin-ejs';

dotenv.config();

// import dns from 'dns';

// Due to https://stackoverflow.com/a/75191787
// dns.setDefaultResultOrder('verbatim');

const production = process.env.NODE_ENV === 'production';

const STOCK_SERVICE_HOST = process.env.STOCK_SERVICE_HOST || 'http://localhost:7080';
const POCKETBASE_URL = process.env.POCKETBASE_URL || '';
const OPEN_AI_KEY = process.env.OPEN_AI_KEY || '';

// https://vitejs.dev/config/
export default defineConfig({
  // https://github.com/vitejs/vite/issues/1973#issuecomment-787571499
  define: {
    'process.env': {
      NODE_ENV: process.env.NODE_ENV,
      STOCK_SERVICE_HOST: STOCK_SERVICE_HOST,
      POCKETBASE_URL: POCKETBASE_URL,
      OPEN_AI_KEY: OPEN_AI_KEY,
    },
  },
  server: {
    open: true,
    host: 'localhost',
    port: 3000,
    proxy: !production
      ? {
          '/stock_service': {
            target: STOCK_SERVICE_HOST,
            changeOrigin: true,
            rewrite: path => path.replace('/stock_service', ''),
          },
          // "/socket": {
          //   target: "http://localhost:7070",
          //   changeOrigin: true,
          //   ws: true,
          //   rewrite: (path) => path.replace("/socket", ""),
          // },
        }
      : undefined,
  },
  resolve: {
    alias: [{find: '@', replacement: path.resolve(__dirname, 'src')}],
  },
  build: {
    outDir: 'build',
  },
  plugins: [
    react(),
    ViteEjsPlugin(config => {
      return {
        ...config,
        isProd: config.mode === 'production',
      };
    }),
  ],
});
