import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react":   ["react","react-dom"],
          "vendor-charts":  ["recharts"],
          "vendor-icons":   ["lucide-react"],
          "vendor-xlsx":    ["xlsx"],
          "shared":         [
            "./src/shared/supabase.js",
            "./src/shared/hooks.js",
            "./src/shared/utils.js",
            "./src/shared/constants.jsx"
          ],
        },
      },
    },
  },
});
