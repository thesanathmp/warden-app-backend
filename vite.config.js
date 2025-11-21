import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const allowedHosts =
  (process.env.VITE_ALLOWED_HOSTS || "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);

export default defineConfig({
  server: {
    host: true,
    allowedHosts: ['v1bz5k05-5173.inc1.devtunnels.ms']
  },
  preview: {
    allowedHosts: ['v1bz5k05-5173.inc1.devtunnels.ms'],
    proxy: {
      // Forward API calls to the backend during development so the
      // frontend works from the forwarded/public URL on mobile devices.
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/photos': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",

      includeAssets: [
        "favicon.ico",
        "favicon.svg",
        "favicon-96x96.png",
        "web-app-manifest-192x192.png",
        "web-app-manifest-512x512.png"
      ],

      manifest: {
        name: "Warden Portal - Food Hygiene Inspection",
        short_name: "Warden Portal",
        description: "Food Safety Inspection and Management System for Karnataka Government Schools",
        theme_color: "#667eea",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        scope: "/",

        icons: [
          {
            src: "/favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon"
          },
          {
            src: "/favicon-96x96.png",
            sizes: "96x96",
            type: "image/png"
          },
          {
            src: "/web-app-manifest-192x192.png",
            type: "image/png",
            sizes: "192x192",
            purpose: "any maskable"
          },
          {
            src: "/web-app-manifest-512x512.png",
            type: "image/png",
            sizes: "512x512",
            purpose: "any maskable"
          }
        ]
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],

        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: { maxEntries: 100 }
            }
          },
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              url.pathname.startsWith("/api"),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache"
            }
          }
        ]
      }
    })
  ]
});
