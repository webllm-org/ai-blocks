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
const OUTPUT_DIR = join(ROOT, '../../public/r')

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
  const output = {
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    dependencies: item.dependencies || [],
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
    // Replace @/lib/utils with the standard shadcn path
    // Replace @/registry/* with @/components/* for installed components
    let transformedContent = content
      .replace(/@\/lib\/utils/g, '@/lib/utils')
      .replace(/@\/registry\/ui\/([^/]+)/g, '@/components/ui/$1')
      .replace(/@\/registry\/blocks\/([^/]+)/g, '@/components/blocks/$1')
      .replace(/@\/registry\/hooks\/([^/]+)/g, '@/hooks/$1')

    // Derive the target path for installation
    let targetPath
    if (item.type === 'registry:ui') {
      targetPath = `components/ui/${item.name}.tsx`
    } else if (item.type === 'registry:block') {
      targetPath = `components/blocks/${item.name}.tsx`
    } else if (item.type === 'registry:hook') {
      targetPath = `hooks/${item.name}.ts`
    } else {
      // Default: use the file name
      const fileName = file.path.split('/').pop()
      targetPath = `components/${fileName}`
    }

    output.files.push({
      path: targetPath,
      content: transformedContent,
      type: file.type,
    })
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
