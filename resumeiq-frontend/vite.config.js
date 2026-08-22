import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var allowedHosts = [
    "resumeiq-frontend1.onrender.com",
    "resumeiq-frontend-3kg2.onrender.com",
    process.env.RENDER_EXTERNAL_HOSTNAME,
].filter(function (host) { return Boolean(host); });
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 5173,
        allowedHosts: allowedHosts,
        proxy: {
            "/api": {
                target: "http://localhost:5000",
                changeOrigin: true,
                secure: false,
            },
        },
    },
    preview: {
        allowedHosts: allowedHosts,
    },
});
