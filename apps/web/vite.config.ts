import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'prompt', // Hiển thị popup hỏi user thay vì tự update
            includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png'],
            manifest: {
                name: 'Kiến Tạo Việt - Trợ Lý Soạn Đề',
                short_name: 'Kiến Tạo Việt',
                description: 'Tạo Ma trận đề kiểm tra và Đề thi theo Công văn 7991/BGDĐT-GDTrH',
                theme_color: '#6366f1',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: '/',
                scope: '/',
                orientation: 'portrait-primary',
                categories: ['education', 'productivity'],
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ],
                shortcuts: [
                    {
                        name: 'Tạo đề thi',
                        short_name: 'Tạo đề',
                        url: '/create-exam',
                        icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
                    },
                    {
                        name: 'Thư viện',
                        short_name: 'Thư viện',
                        url: '/libraries',
                        icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
                    }
                ]
            },
            // Chú thích: Workbox caching strategies cho offline support
            workbox: {
                // Cache static assets
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                // Runtime caching cho API calls
                runtimeCaching: [
                    {
                        // Cache API responses
                        urlPattern: /^https:\/\/api\..*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 // 24 hours
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        // Cache images
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                            }
                        }
                    },
                    {
                        // Cache fonts
                        urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'fonts-cache',
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            }
                        }
                    }
                ],
                // Navigations to cache
                navigateFallback: 'index.html',
                navigateFallbackDenylist: [/^\/api/]
            },
            // Dev options
            devOptions: {
                enabled: false // Enable for dev testing: true
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
