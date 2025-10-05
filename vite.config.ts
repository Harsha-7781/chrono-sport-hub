import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// No 'lovable-tagger' import or usage here!

// The error point is here, but the syntax is correct:
export default defineConfig(({ mode }:{mode:string}) => ({ 
  server: {
    host: "0.0.0.0", 
    port: 8080,
  },
  
  plugins: [
    react(),
  ], // Removed .filter(Boolean) as it's unnecessary if you have no conditional plugins
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));