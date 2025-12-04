# @webllm/ai-blocks

AI-focused UI components for building LLM-powered interfaces. This package provides reusable components and demos that can be installed via the shadcn CLI.

## Registry Architecture

### How It Works

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SOURCE OF TRUTH                                  │
│                                                                          │
│  packages/playground/data/blocks/*.ts                                   │
│  - Block metadata (id, title, description, tags, etc.)                  │
│  - Component references                                                  │
│  - Source code via Vite ?raw imports                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     generate-registry-from-blocks.js                     │
│                                                                          │
│  Reads TypeScript block files and extracts metadata                     │
│  Output: packages/ai-blocks/registry.json                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         build-registry.js                                │
│                                                                          │
│  Reads registry.json + component source files                           │
│  Transforms imports: @webllm/client → webllm                            │
│  Auto-detects webllm dependency                                         │
│  Output: packages/playground/public/r/*.json                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SERVED AT RUNTIME                                │
│                                                                          │
│  https://webllm.org/r/{component-name}.json                             │
│  - Individual component JSON files for shadcn CLI                       │
│  - index.json with full component listing                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### Import Path Transformation

Components use `@webllm/client` internally (for monorepo builds), but users need the public `webllm` package:

| Context | Import |
|---------|--------|
| Source files | `import { generateText } from "@webllm/client"` |
| Playground runtime | `@webllm/client` (internal package) |
| Registry JSON | `import { generateText } from "webllm"` |
| Code display on site | `webllm` (via `displayCode` getter) |
| Copy to clipboard | `webllm` |
| Download .tsx | `webllm` |

This is handled by:
1. **Build script** (`build-registry.js`): Transforms imports in generated JSON files
2. **displayCode getter** (`BlockDef.displayCode`): Transforms code for site display

### BlockDef and displayCode

Block definitions use `defineBlocks()` helper which adds a `displayCode` getter:

```typescript
// packages/playground/data/blocks/chat.ts
import { defineBlocks } from "./types"
import SimpleChatDemoCode from "@ai-blocks/registry/blocks/demos/SimpleChatDemo.tsx?raw"

export const chatBlocks = defineBlocks([
  {
    id: "simple-chat",
    title: "Simple Chat",
    code: SimpleChatDemoCode,  // Raw code with @webllm/client
    // ...
  },
])

// Usage in components:
block.code        // Raw: @webllm/client (for internal use)
block.displayCode // Transformed: webllm (for user-facing display)
```

## Build Commands

```bash
# Generate registry.json from blocks data
npm run generate:registry

# Full build (generate + build JSON files)
npm run build:registry

# Clean generated files
npm run clean
```

## Usage

Install components via shadcn CLI:

```bash
npx shadcn@latest add https://webllm.org/r/simple-chat.json
npx shadcn@latest add https://webllm.org/r/chat-with-tools.json
```

View all available components:

```bash
curl https://webllm.org/r/index.json
```

## Directory Structure

```
packages/ai-blocks/
├── src/
│   └── registry/
│       ├── blocks/demos/     # Demo component source files
│       ├── ui/               # Base UI components
│       └── hooks/            # React hooks
├── scripts/
│   ├── generate-registry-from-blocks.js  # Generates registry.json
│   └── build-registry.js                  # Builds JSON files
├── registry.json             # Generated manifest (gitignored)
└── README.md

packages/playground/
├── data/blocks/              # Block definitions (source of truth)
│   ├── types.ts              # BlockDef, defineBlocks()
│   ├── chat.ts
│   ├── image.ts
│   └── ...
├── lib/
│   └── transform-code.ts     # transformCodeForDisplay()
└── public/r/                 # Generated JSON files (gitignored)
    ├── index.json
    ├── simple-chat.json
    └── ...
```
