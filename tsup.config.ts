import { defineConfig } from "tsup"
import { readdir } from "fs/promises"
import { join } from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"
import type { Plugin } from "esbuild"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get all demo files dynamically
async function getDemoEntries() {
  const demosDir = join(__dirname, "src/registry/blocks/demos")
  const files = await readdir(demosDir)
  const entries: Record<string, string> = {}

  for (const file of files) {
    if (file.endsWith(".tsx")) {
      const name = file.replace(".tsx", "")
      entries[`demos/${name}`] = `src/registry/blocks/demos/${file}`
    }
  }

  return entries
}

// Plugin to rewrite @webllm/client imports to webllm
const rewriteWebllmImports: Plugin = {
  name: "rewrite-webllm-imports",
  setup(build) {
    build.onResolve({ filter: /^@webllm\/client$/ }, () => ({
      path: "webllm",
      external: true,
    }))
  },
}

export default defineConfig(async () => ({
  entry: {
    index: "src/index.ts",
    ...(await getDemoEntries()),
  },
  format: ["esm"],
  dts: false, // Skipped - components use @/ path aliases that users must provide
  splitting: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "webllm",
    // shadcn path aliases - users provide their own
    /^@\//,
    // Lucide icons
    "lucide-react",
  ],
  esbuildPlugins: [rewriteWebllmImports],
}))
