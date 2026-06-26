import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Gestor de Certificados",
        short_name: "CertificApp",
        theme_color: "#3b82f6",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
        ],
      },
    }),
  ],
});
