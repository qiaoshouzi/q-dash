import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/[hash].js",
        chunkFileNames: "assets/[hash].js",
        assetFileNames: "assets/[hash][extname]",
      },
    },
  },
  server: {
    host: "0.0.0.0",
    https: {
      key: fs.readFileSync(path.join(__dirname, "./dev-https/https.key")),
      cert: fs.readFileSync(path.join(__dirname, "./dev-https/https.cer")),
    },
  },
  envPrefix: ["VITE_", "CF_", "Q_"],
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
