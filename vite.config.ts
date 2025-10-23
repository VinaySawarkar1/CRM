import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    // Only include Replit plugins in development, not in production
    ...(process.env.NODE_ENV !== "production" ? [
      // These will only be loaded if available (development only)
      ...(await Promise.allSettled([
        import("@replit/vite-plugin-runtime-error-modal").then(m => m.default()),
        import("@replit/vite-plugin-shadcn-theme-json").then(m => m.default()),
        ...(process.env.REPL_ID !== undefined ? [
          import("@replit/vite-plugin-cartographer").then(m => m.cartographer())
        ] : [])
      ]).then(results => 
        results
          .filter(result => result.status === 'fulfilled')
          .map(result => (result as PromiseFulfilledResult<any>).value)
      ))
    ] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 3001,
    strictPort: true,
    hmr: {
      host: '0.0.0.0',
      port: 3001,
    },
  },
});
