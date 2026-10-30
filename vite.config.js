import { defineConfig } from "vite";
import vue2 from "@vitejs/plugin-vue2";
import path from "node:path";

export default defineConfig({
  plugins: [vue2()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@image": path.resolve(__dirname, "src/assets/img"),
      "@style": path.resolve(__dirname, "src/assets/css"),
      "@constants": path.resolve(__dirname, "src/constants/index.js"),
      "@mixin-scss": path.resolve(__dirname, "src/utils/common.scss"),
    },
  },
});
