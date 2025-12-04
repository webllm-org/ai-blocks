#!/usr/bin/env node

/**
 * Build script for generating shadcn-compatible registry JSON files.
 *
 * This script reads the registry.json manifest and generates individual
 * JSON files for each component that can be consumed by `npx shadcn add`.
 *
 * Output: ../../public/r/{component-name}.json
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUTPUT_DIR = join(ROOT, '../playground/public/r')

// Read the registry manifest
const registryPath = join(ROOT, 'registry.json')
const registry = JSON.parse(readFileSync(registryPath, 'utf-8'))

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true })
}

console.log(`Building ai-blocks registry to ${OUTPUT_DIR}`)
console.log(`Found ${registry.items.length} components\n`)

// Process each item in the registry
for (const item of registry.items) {
  // Track dependencies discovered from file content
  let usesWebllm = false

  const output = {
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    dependencies: [...(item.dependencies || [])],
    devDependencies: item.devDependencies || [],
    registryDependencies: (item.registryDependencies || []).map(dep => {
      // Convert local: prefix to our registry URL
      if (dep.startsWith('local:')) {
        return dep.replace('local:', '')
      }
      return dep
    }),
    files: [],
    tailwind: item.tailwind || {},
    cssVars: item.cssVars || {},
  }

  // Read each file's content
  for (const file of item.files) {
    const filePath = join(ROOT, file.path)

    if (!existsSync(filePath)) {
      console.warn(`  Warning: File not found: ${file.path}`)
      continue
    }

    const content = readFileSync(filePath, 'utf-8')

    // Transform import paths for registry compatibility
    // Replace @webllm/client with the public package name "webllm"
    // Replace @/lib/utils with the standard shadcn path
    // Replace @/registry/* with @/components/* for installed components
    let transformedContent = content
      .replace(/@webllm\/client/g, 'webllm')
      .replace(/@\/lib\/utils/g, '@/lib/utils')
      .replace(/@\/registry\/ui\/([^/]+)/g, '@/components/ui/$1')
      .replace(/@\/registry\/blocks\/([^/]+)/g, '@/components/blocks/$1')
      .replace(/@\/registry\/hooks\/([^/]+)/g, '@/hooks/$1')

    // Track if this file uses webllm
    if (content.includes('@webllm/client') || content.includes('from "webllm"')) {
      usesWebllm = true
    }

    // Derive the target path for installation based on actual file name
    const fileName = file.path.split('/').pop()
    let targetPath
    if (item.type === 'registry:ui') {
      targetPath = `components/ui/${fileName}`
    } else if (item.type === 'registry:block') {
      targetPath = `components/blocks/${fileName}`
    } else if (item.type === 'registry:hook') {
      targetPath = `hooks/${fileName}`
    } else {
      targetPath = `components/${fileName}`
    }

    output.files.push({
      path: targetPath,
      content: transformedContent,
      type: file.type,
    })
  }

  // Add webllm dependency if any file uses it
  if (usesWebllm && !output.dependencies.includes('webllm')) {
    output.dependencies.push('webllm')
  }

  // Write the component JSON
  const outputPath = join(OUTPUT_DIR, `${item.name}.json`)
  writeFileSync(outputPath, JSON.stringify(output, null, 2))
  console.log(`  Created: ${item.name}.json (${output.files.length} files)`)
}

// Create an index file listing all available components
const indexOutput = {
  name: registry.name,
  homepage: registry.homepage,
  components: registry.items.map(item => ({
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
  })),
}

writeFileSync(join(OUTPUT_DIR, 'index.json'), JSON.stringify(indexOutput, null, 2))
console.log(`\nCreated index.json with ${registry.items.length} components`)

console.log('\nRegistry build complete!')
console.log(`\nUsage:`)
console.log(`  npx shadcn@latest add https://webllm.org/r/{component-name}.json`)
