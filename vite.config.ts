import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths()],
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
                    if (req.url?.includes('.ts')) {
                        return req.url; // Do not proxy
                    }
                },
            },
            '/frontend-config': {
                target: 'http://localhost:5678',
            },
        },
        port: 1234,
        /*
         * Bind eksplisitt til IPv4-loopback. Vite sin default ('localhost') løses på moderne
         * Node/macOS til IPv6 (::1), og da svarer ikke dev-serveren på IPv4. Wonderwall-containeren
         * når host-Vite via host.docker.internal, som Colima videresender til host-ens IPv4-loopback
         * (127.0.0.1) -> en IPv6-only binding gir "connection refused" / Bad Gateway.
         * 127.0.0.1 er deterministisk IPv4 og eksponerer ikke dev-serveren på nettverket.
         */
        host: '127.0.0.1',
        hmr: {
            port: 1234,
        },
        strictPort: true,
        middlewareMode: false,
    },
    root: './src/',
});
