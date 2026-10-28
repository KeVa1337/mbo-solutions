import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Images and fonts come from the main site's /assets (served from the repo root in dev, never copied);
// built files go to /assets/v2 so they sit next to the old site's assets without clashing.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: "..",
  build: { assetsDir: "assets/v2", copyPublicDir: false },
});
