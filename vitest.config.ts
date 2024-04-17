import {defineConfig} from 'vitest/config';
import path from 'path';

export default defineConfig({
  esbuild: {
    jsxInject: "import React from 'react'",
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: [{find: '@', replacement: path.resolve(__dirname, 'src')}],
  },
  define: {
    'process.env': {
      NODE_ENV: 'test',
    },
  },
});
