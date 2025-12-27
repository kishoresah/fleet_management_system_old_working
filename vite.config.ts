import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";

export default defineConfig({
  base: './',
  plugins: [
    react(),
    checker({ typescript: false }) // ✅ disable TS checking
  ],
});
