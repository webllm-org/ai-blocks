#!/usr/bin/env node

/**
 * Generate registry.json from playground blocks data.
 *
 * This script reads the TypeScript block definition files and extracts
 * the metadata needed for the shadcn registry format.
 *
 * Run: node scripts/generate-registry-from-blocks.js
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BLOCKS_DIR = join(__dirname, '../../playground/data/blocks')
const REGISTRY_PATH = join(__dirname, '../registry.json')

// Base registry items (UI components and hooks that aren't in blocks data)
const baseItems = [
  {
    name: "ai-avatar",
    type: "registry:ui",
    title: "AI Avatar",
    description: "An avatar component with AI/user variants and thinking indicator.",
    files: [
      { path: "src/registry/ui/ai-avatar/ai-avatar.tsx", type: "registry:component" },
      { path: "src/registry/ui/ai-avatar/index.ts", type: "registry:component" }
    ]
  },
  {
    name: "ai-input",
    type: "registry:ui",
    title: "AI Input",
    description: "An enhanced textarea input with stop button, file attachments, and submit handling.",
    files: [
      { path: "src/registry/ui/ai-input/ai-input.tsx", type: "registry:component" },
      { path: "src/registry/ui/ai-input/index.ts", type: "registry:component" }
    ]
  },
  {
    name: "chat-bubble",
    type: "registry:ui",
    title: "Chat Bubble",
    description: "A chat message bubble with streaming text support, avatar, and timestamp.",
    registryDependencies: ["local:ai-avatar"],
    files: [
      { path: "src/registry/ui/chat-bubble/chat-bubble.tsx", type: "registry:component" },
      { path: "src/registry/ui/chat-bubble/index.ts", type: "registry:component" }
    ]
  },
  {
    name: "message-list",
    type: "registry:ui",
    title: "Message List",
    description: "A scrollable list of chat messages with auto-scroll and empty state.",
    registryDependencies: ["local:chat-bubble"],
    files: [
      { path: "src/registry/ui/message-list/message-list.tsx", type: "registry:component" },
      { path: "src/registry/ui/message-list/index.ts", type: "registry:component" }
    ]
  },
  {
    name: "chat-interface",
    type: "registry:block",
    title: "Chat Interface",
    description: "A complete chat interface with message list, input, and streaming support.",
    registryDependencies: ["local:ai-input", "local:message-list"],
    files: [
      { path: "src/registry/blocks/chat-interface/chat-interface.tsx", type: "registry:component" },
      { path: "src/registry/blocks/chat-interface/index.ts", type: "registry:component" }
    ]
  },
  {
    name: "streaming-text",
    type: "registry:block",
    title: "Streaming Text",
    description: "A text component with streaming cursor and optional typing animation.",
    files: [
      { path: "src/registry/blocks/streaming-text/streaming-text.tsx", type: "registry:component" },
      { path: "src/registry/blocks/streaming-text/index.ts", type: "registry:component" }
    ]
  },
  {
    name: "prompt-form",
    type: "registry:block",
    title: "Prompt Form",
    description: "A prompt input form with optional model selector, temperature, and token controls.",
    registryDependencies: ["local:ai-input"],
    files: [
      { path: "src/registry/blocks/prompt-form/prompt-form.tsx", type: "registry:component" },
      { path: "src/registry/blocks/prompt-form/index.ts", type: "registry:component" }
    ]
  },
  {
    name: "use-streaming",
    type: "registry:hook",
    title: "useStreaming",
    description: "Hook for handling streaming text responses from AI APIs.",
    files: [
      { path: "src/registry/hooks/use-streaming/use-streaming.ts", type: "registry:hook" },
      { path: "src/registry/hooks/use-streaming/index.ts", type: "registry:hook" }
    ]
  },
  {
    name: "use-chat",
    type: "registry:hook",
    title: "useChat",
    description: "Hook for managing chat conversations with message history and generation.",
    files: [
      { path: "src/registry/hooks/use-chat/use-chat.ts", type: "registry:hook" },
      { path: "src/registry/hooks/use-chat/index.ts", type: "registry:hook" }
    ]
  },
  {
    name: "use-webllm",
    type: "registry:hook",
    title: "useWebLLM",
    description: "Hook for integrating with WebLLM client for browser-native LLM access.",
    files: [
      { path: "src/registry/hooks/use-webllm/use-webllm.ts", type: "registry:hook" },
      { path: "src/registry/hooks/use-webllm/index.ts", type: "registry:hook" }
    ]
  }
]

/**
 * Parse a TypeScript block file and extract block definitions
 */
function parseBlockFile(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const blocks = []

  // Find all block objects in the array
  // Match pattern: { id: "...", title: "...", description: "...", ... }
  const blockRegex = /\{\s*id:\s*["']([^"']+)["'],\s*title:\s*["']([^"']+)["'],\s*description:\s*["']([^"']+)["'][^}]*component:\s*(\w+)/gs

  let match
  while ((match = blockRegex.exec(content)) !== null) {
    const [, id, title, description, componentName] = match

    // Skip comingSoon blocks
    if (content.includes(`id: "${id}"`) && content.includes('comingSoon: true')) {
      const blockSection = content.substring(
        content.indexOf(`id: "${id}"`),
        content.indexOf(`id: "${id}"`) + 500
      )
      if (blockSection.includes('comingSoon: true')) {
        continue
      }
    }

    // Derive file path from component name (e.g., SimpleChatDemo -> SimpleChatDemo.tsx)
    const fileName = `${componentName}.tsx`

    blocks.push({
      name: id,
      type: "registry:block",
      title,
      description,
      files: [
        {
          path: `src/registry/blocks/demos/${fileName}`,
          type: "registry:component"
        }
      ]
    })
  }

  return blocks
}

/**
 * Main function
 */
function main() {
  console.log('Generating registry.json from blocks data...\n')

  // Get all block files (exclude index.ts, types.ts, categories.ts, themes.ts, README.md)
  const blockFiles = readdirSync(BLOCKS_DIR)
    .filter(f => f.endsWith('.ts') && !['index.ts', 'types.ts', 'categories.ts', 'themes.ts'].includes(f))

  console.log(`Found ${blockFiles.length} block files:`)
  blockFiles.forEach(f => console.log(`  - ${f}`))
  console.log()

  // Parse each block file
  const demoItems = []
  for (const file of blockFiles) {
    const filePath = join(BLOCKS_DIR, file)
    const blocks = parseBlockFile(filePath)
    console.log(`  ${file}: ${blocks.length} blocks`)
    demoItems.push(...blocks)
  }

  // Combine base items with demo items
  const allItems = [...baseItems, ...demoItems]

  // Create registry object
  const registry = {
    "$schema": "https://ui.shadcn.com/schema/registry.json",
    name: "ai-blocks",
    homepage: "https://webllm.org/blocks",
    items: allItems
  }

  // Write registry.json
  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n')

  console.log(`\nGenerated registry.json with ${allItems.length} items:`)
  console.log(`  - ${baseItems.length} base components (UI, hooks)`)
  console.log(`  - ${demoItems.length} demo blocks`)
  console.log(`\nOutput: ${REGISTRY_PATH}`)
}

main()
