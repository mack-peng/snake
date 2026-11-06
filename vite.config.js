import { defineConfig } from "vite";
import vue2 from "@vitejs/plugin-vue2";
import path from "node:path";

function minitoolClassicScript() {
  const scriptTag =
    /<script\s+type="module"\s+crossorigin\s+src="([^"]+)"\s*><\/script>/;
  return {
    name: "minitool-classic-script",
    apply: "build",
    enforce: "post",
    transformIndexHtml(html) {
      const match = html.match(scriptTag);
      if (!match) return html;
      return html.replace(scriptTag, "").replace(
        "</body>",
        `<script src="${match[1]}"></script></body>`
      );
    },
  };
}

export default defineConfig({
  base: "./",
  publicDir: false,
  plugins: [vue2(), minitoolClassicScript()],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@image": path.resolve(__dirname, "src/assets/img"),
      "@style": path.resolve(__dirname, "src/assets/css"),
      "@constants": path.resolve(__dirname, "src/constants/index.js"),
      "@mixin-scss": path.resolve(__dirname, "src/utils/common.scss"),
    },
  },
  build: {
    target: ["es2017", "chrome61"],
    cssTarget: ["chrome61"],
    modulePreload: false,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        format: "iife",
        inlineDynamicImports: true,
        entryFileNames: "assets/app.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
