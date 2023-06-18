import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import path from 'path';
import { defineConfig } from 'vite';

dotenv.config();

export default defineConfig(() => {
  return {
    // https://github.com/vitejs/vite/issues/1973#issuecomment-787571499
    define: {
      'process.env': {
        REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
        REACT_APP_SUPABASE_ANON: process.env.REACT_APP_SUPABASE_ANON,
      },
    },
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
    server: {
      open: true,
    },
    build: {
      outDir: 'build',
      // rollupOptions: {
      //   external: ['lodash.debounce'],
      // },
    },
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin'],
        },
      }),
    ],
  };
});
