#!/usr/bin/env node

/**
 * Build script for generating shadcn-compatible registry JSON files.
 *
 * This script reads the registry.json manifest and generates individual
 * JSON files for each component that can be consumed by `npx shadcn add`.
 *
 * Features:
 * - Auto-detects npm dependencies from imports (webllm, lucide-react, etc.)
 * - Auto-detects registry dependencies from @/registry/* imports
 * - Transforms import paths for shadcn compatibility
 *
 * Output: ../../public/r/{component-name}.json
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUTPUT_DIR = join(ROOT, '../playground/public/r')

/**
 * Known npm packages that should be added as dependencies when imported.
 * Maps import source patterns to the npm package name to add.
 */
const NPM_PACKAGE_MAP = {
  '@webllm/client': 'webllm',
  'webllm': 'webllm',
  'lucide-react': 'lucide-react',
  'framer-motion': 'framer-motion',
  'date-fns': 'date-fns',
  'zod': 'zod',
  'zustand': 'zustand',
  'react-hook-form': 'react-hook-form',
  '@hookform/resolvers': '@hookform/resolvers',
  'class-variance-authority': 'class-variance-authority',
  'clsx': 'clsx',
  'tailwind-merge': 'tailwind-merge',
  'cmdk': 'cmdk',
  '@radix-ui': null, // Radix UI is typically included via shadcn, so we skip it
}

/**
 * Extract imports from TypeScript/TSX content.
 * Returns an object with npmPackages and registryDeps arrays.
 */
function extractImports(content) {
  const npmPackages = new Set()
  const registryDeps = new Set()

  // Match import statements: import { x } from "source" or import x from "source"
  // Also handles: import type { x } from "source"
  const importRegex = /import\s+(?:type\s+)?(?:{[^}]*}|\*\s+as\s+\w+|\w+)?\s*,?\s*(?:{[^}]*})?\s*from\s*["']([^"']+)["']/g

  let match
  while ((match = importRegex.exec(content)) !== null) {
    const importSource = match[1]

    // Check for registry dependencies (@/registry/*)
    const registryMatch = importSource.match(/@\/registry\/(ui|blocks|hooks)\/([^/]+)/)
    if (registryMatch) {
      const componentName = registryMatch[2]
      registryDeps.add(componentName)
      continue
    }

    // Check for npm package dependencies
    for (const [pattern, packageName] of Object.entries(NPM_PACKAGE_MAP)) {
      if (packageName === null) continue // Skip packages we don't want to add

      if (importSource === pattern || importSource.startsWith(pattern + '/')) {
        npmPackages.add(packageName)
        break
      }
    }
  }

  return {
    npmPackages: Array.from(npmPackages),
    registryDeps: Array.from(registryDeps),
  }
}

// Header comment to prepend to component files
const COMPONENT_HEADER = `/**
 * AI Blocks - https://webllm.org/blocks
 * MIT License | Copyright (c) WebLLM
 *
 * This component uses client-side AI via WebLLM.
 * Users can install the browser extension for AI support,
 * or developers can provide gateway tokens for hosted inference.
 * Learn more: https://webllm.org/docs
 */
`

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
  const allNpmDeps = new Set(item.dependencies || [])
  const allRegistryDeps = new Set(
    (item.registryDependencies || []).map(dep =>
      dep.startsWith('local:') ? dep.replace('local:', '') : dep
    )
  )

  const output = {
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    dependencies: [],  // Will be populated from allNpmDeps
    devDependencies: item.devDependencies || [],
    registryDependencies: [],  // Will be populated from allRegistryDeps
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

    // Extract dependencies from imports
    const { npmPackages, registryDeps } = extractImports(content)

    // Add auto-detected dependencies
    npmPackages.forEach(pkg => allNpmDeps.add(pkg))
    registryDeps.forEach(dep => {
      // Don't add self-reference
      if (dep !== item.name) {
        allRegistryDeps.add(dep)
      }
    })

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

    // Derive the target path for installation based on actual file name
    const fileName = file.path.split('/').pop()

    // Prepend header comment to component files (tsx/ts files only)
    if (fileName.endsWith('.tsx') || fileName.endsWith('.ts')) {
      transformedContent = COMPONENT_HEADER + transformedContent
    }
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

  // Set final dependencies from accumulated sets
  output.dependencies = Array.from(allNpmDeps).sort()
  output.registryDependencies = Array.from(allRegistryDeps).sort()

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
console.log(`  npx shadcn add @ai-blocks/{component-name}`)
console.log(`  # or: npx shadcn@latest add https://webllm.org/r/{component-name}.json`)
