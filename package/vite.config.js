import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Ship the hand-written `src/styles.css` as `dist/style.css` so consumers can
 * `import "@twobitedd/console-network/styles.css"` without the JS bundle
 * auto-applying styles (which would break tree-shaking / theme swaps).
 */
function copyStyles() {
  return {
    name: "console-network:copy-styles",
    closeBundle() {
      const outDir = resolve(__dirname, "dist");
      mkdirSync(outDir, { recursive: true });
      copyFileSync(
        resolve(__dirname, "src/styles.css"),
        resolve(outDir, "style.css"),
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), copyStyles()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.js"),
      name: "ConsoleNetwork",
      fileName: (format) => `console-network.${format}.js`,
      formats: ["es", "cjs"],
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: ["react", "react/jsx-runtime", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "ReactJSXRuntime",
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
