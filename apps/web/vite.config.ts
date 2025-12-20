import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'prompt', // Hiển thị popup hỏi user thay vì tự update
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
            manifest: {
                name: 'Kiến Tạo Việt - Trợ Lý Soạn Đề',
                short_name: 'Kiến Tạo Việt',
                description: 'Tạo Ma trận đề kiểm tra và Đề thi theo Công văn 7991/BGDĐT-GDTrH',
                theme_color: '#ffffff',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@exam-matrix/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
            '@exam-matrix/export': path.resolve(__dirname, '../../packages/export/src/index.ts'),
            '@exam-matrix/rag': path.resolve(__dirname, '../../packages/rag/src/index.ts'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:8787',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
});
