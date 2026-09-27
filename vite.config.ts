import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // The whole prototype ships as one screen; with the six Future modules one ~1.3 MB chunk is expected.
  build: { chunkSizeWarningLimit: 1600 },
});
