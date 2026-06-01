import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    outDir: "dist-ui",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        ui: resolve(__dirname, "src/ui.html")
      }
    }
  }
});
