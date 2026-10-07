import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        proxy: {
            // forward /api/* to the Flask backend without rewriting the path
            '/api': {
                target: 'http://127.0.0.1:5000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return null;
                    if (id.includes('react') && !id.includes('react-dom')) return 'vendor_react';
                    if (id.includes('react-dom')) return 'vendor_react-dom';
                    if (id.includes('framer-motion')) return 'vendor_framer-motion';
                    if (id.includes('recharts')) return 'vendor_recharts';
                    if (id.includes('jspdf')) return 'vendor_jspdf';
                    // fallback vendor chunk
                    return 'vendor_misc';
                },
            },
        },
    },
});
