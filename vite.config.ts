import path from "path"
import { createRequire } from "node:module"
import react from "@vitejs/plugin-react"
import { defineConfig, type PluginOption } from "vite"

// kimi-plugin-inspect-react ist ein internes Dev-Inspect-Tool. In manchen
// npm-Installationen fehlt das ausgelieferte dist/-Bundle (fehlerhafte
// Paket-Veröffentlichung), was prod-Builds bricht. Wir laden es deshalb
// defensiv: existiert es, nehmen wir es; fehlt es, bauen wir trotzdem.
const requireCjs = createRequire(import.meta.url)
function loadInspectAttr(): PluginOption | null {
  try {
    const mod = requireCjs("kimi-plugin-inspect-react") as { inspectAttr?: () => PluginOption }
    return mod?.inspectAttr ? mod.inspectAttr() : null
  } catch {
    return null
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [loadInspectAttr(), react()].filter(Boolean) as PluginOption[],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Railway-Preview-Server lehnt sonst Requests mit fremdem Host-Header
  // ab (Vite-Default: nur localhost erlaubt). Die Production-URL und
  // alle .up.railway.app-Branch-/PR-Preview-URLs werden whitelistet.
  preview: {
    allowedHosts: [
      "tinahwebsite-production.up.railway.app",
      ".up.railway.app",
    ],
  },
});
