import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: "esbuild",
    // Target modern browsers for smaller output
    target: "es2020",
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React core
          "react-vendor": ["react", "react-dom"],
          // Router
          "router-vendor": ["react-router-dom"],
          // Query
          "query-vendor": ["@tanstack/react-query"],
          // UI components
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-switch",
          ],
          // Utilities
          "utils-vendor": ["clsx", "tailwind-merge", "class-variance-authority"],
          // Icons
          "icons-vendor": ["lucide-react"],
          // CSV parser
          "csv-vendor": ["papaparse"],
        },
        // Asset file naming for better caching
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || "";
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (/\.css$/.test(name)) {
            return "assets/css/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "papaparse",
      "lucide-react",
    ],
  },
}));
