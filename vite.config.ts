import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(async () => {
  // Load Replit plugins with graceful fallback
  // These plugins enhance UI in both dev and production (Render)
  const plugins = [react()];
  
  try {
    const pluginPromises = [
      import("@replit/vite-plugin-runtime-error-modal")
        .then(m => m.default())
        .catch(() => null),
      import("@replit/vite-plugin-shadcn-theme-json")
        .then(m => m.default())
        .catch(() => null),
      ...(process.env.REPL_ID !== undefined ? [
        import("@replit/vite-plugin-cartographer")
          .then(m => m.cartographer())
          .catch(() => null)
      ] : [])
    ];
    
    const loadedPlugins = await Promise.all(pluginPromises);
    const validPlugins = loadedPlugins.filter(p => p !== null);
    plugins.push(...validPlugins);
    
    if (validPlugins.length > 0) {
      console.log(`✅ Loaded ${validPlugins.length} Replit plugin(s)`);
    }
  } catch (error) {
    console.warn('⚠️  Replit plugins not available, using fallback theme:', error);
  }

  return {
    plugins,
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
      host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost',
      port: 3001,
      strictPort: true,
      hmr: false, // Temporarily disable HMR to stop continuous refresh
      watch: {
        ignored: [
          '**/data/**',
          '**/dist/**',
          '**/node_modules/**',
          '**/.git/**',
          '**/scripts/**',
          '**/*.cjs',
          '**/*.js',
          '**/client/index.html',
        ],
      },
      fs: {
        strict: false,
      },
    },
  };
});
