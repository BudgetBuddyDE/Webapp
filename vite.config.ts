import dotenv from 'dotenv';
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
    // https://github.com/vitejs/vite/issues/1973#issuecomment-787571499
    define: {
        'process.env': {
            REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
            REACT_APP_SUPABASE_ANON: process.env.REACT_APP_SUPABASE_ANON,
        },
    },
    server: {
        open: true,
    },
    resolve: {
        alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
    },
    build: {
        outDir: "build"
    },
    plugins: [react()],
});
