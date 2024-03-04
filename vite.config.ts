//import { fileURLToPath, URL } from 'url';
import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    // resolve: {
    //     alias: [{ find: '~src', replacement: fileURLToPath(new URL('./src', import.meta.url)) }],
    // },
    build: {
        rollupOptions: {
            input: {
                app: './src/index.html',
            },
        },
        outDir: '../dist',
        sourcemap: true,
    },
    resolve: {
        alias: {
            // TODO jah: Hadde håpet dette ble håndtert av vite-tsconfig-paths (se tsconfig.json)
            '@styles': path.resolve(__dirname, './src/styles'),
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5678',
                bypass: function (req) {
                    if (req.url?.endsWith('.ts')) {
                        return req.url; // Do not proxy
                    }
                },
            },
            '/login': {
                target: 'http://localhost:5678',
            },
            '/logout': {
                target: 'http://localhost:5678',
            },
            '/oauth2': {
                target: 'http://localhost:5678',
            },
        },
        port: 1234,
        strictPort: true,
        hmr: {
            port: 1234,
        },
        middlewareMode: false,
    },
    root: './src/',
});
