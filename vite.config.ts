import { UserConfig, defineConfig, loadEnv } from "vite";

import react from '@vitejs/plugin-react'
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig((config) => {
  const env = loadEnv(config.mode, process.cwd(), "");
  return {
    base: env.VITE_PREFIX,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [react()],
    css: {
      devSourcemap: true,
    },
  } as UserConfig;
});