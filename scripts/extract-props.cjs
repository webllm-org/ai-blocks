#!/usr/bin/env node

/**
 * Extract component props from TSX files using react-docgen-typescript
 * Outputs a single props.json with all component prop definitions
 */

const { parse } = require('react-docgen-typescript');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REGISTRY_DIR = path.join(ROOT, 'src/registry');
const OUTPUT_FILE = path.join(ROOT, 'props.json');

// Parser options
const parserOptions = {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  propFilter: (prop) => {
    // Filter out HTML attributes and React internals
    if (prop.declarations?.length > 0) {
      const hasPropAdditionalDescription = prop.declarations.find((declaration) => {
        return !declaration.fileName.includes('node_modules');
      });
      return Boolean(hasPropAdditionalDescription);
    }
    return true;
  },
};

function findTsxFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findTsxFiles(fullPath));
    } else if (entry.name.endsWith('.tsx') && !entry.name.startsWith('index')) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractProps() {
  const allProps = {};

  // Extract from UI components
  const uiDir = path.join(REGISTRY_DIR, 'ui');
  if (fs.existsSync(uiDir)) {
    const uiFiles = findTsxFiles(uiDir);
    console.log(`\nUI Components (${uiFiles.length} files):`);

    for (const file of uiFiles) {
      const relativePath = path.relative(REGISTRY_DIR, file);
      const componentId = path.basename(path.dirname(file)); // e.g., "chat-bubble"

      try {
        const docs = parse(file, parserOptions);

        for (const component of docs) {
          const props = Object.entries(component.props || {}).map(([name, prop]) => ({
            name,
            type: prop.type?.name || 'unknown',
            required: prop.required || false,
            defaultValue: prop.defaultValue?.value,
            description: prop.description || '',
          }));

          if (props.length > 0) {
            const key = `ui/${componentId}`;
            allProps[key] = {
              componentName: component.displayName,
              description: component.description || '',
              props,
            };
            console.log(`  ✓ ${component.displayName}: ${props.length} props`);
          }
        }
      } catch (error) {
        console.error(`  ✗ ${relativePath}: ${error.message}`);
      }
    }
  }

  // Extract from blocks
  const blocksDir = path.join(REGISTRY_DIR, 'blocks');
  if (fs.existsSync(blocksDir)) {
    const blockFiles = findTsxFiles(blocksDir);
    console.log(`\nBlock Components (${blockFiles.length} files):`);

    for (const file of blockFiles) {
      const relativePath = path.relative(REGISTRY_DIR, file);
      const filename = path.basename(file, '.tsx');

      // Skip demo files for prop extraction (they don't have props)
      if (filename.endsWith('Demo')) {
        continue;
      }

      const componentId = path.basename(path.dirname(file));

      try {
        const docs = parse(file, parserOptions);

        for (const component of docs) {
          const props = Object.entries(component.props || {}).map(([name, prop]) => ({
            name,
            type: prop.type?.name || 'unknown',
            required: prop.required || false,
            defaultValue: prop.defaultValue?.value,
            description: prop.description || '',
          }));

          if (props.length > 0) {
            const key = `blocks/${componentId}`;
            allProps[key] = {
              componentName: component.displayName,
              description: component.description || '',
              props,
            };
            console.log(`  ✓ ${component.displayName}: ${props.length} props`);
          }
        }
      } catch (error) {
        console.error(`  ✗ ${relativePath}: ${error.message}`);
      }
    }
  }

  // Extract from hooks
  const hooksDir = path.join(REGISTRY_DIR, 'hooks');
  if (fs.existsSync(hooksDir)) {
    const hookFiles = findTsxFiles(hooksDir).concat(
      findTsxFiles(hooksDir).map(f => f.replace('.tsx', '.ts')).filter(f => fs.existsSync(f))
    );

    // Also find .ts files
    const tsFiles = [];
    const findTsFiles = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          findTsFiles(fullPath);
        } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts') && !entry.name.startsWith('index')) {
          tsFiles.push(fullPath);
        }
      }
    };
    findTsFiles(hooksDir);

    console.log(`\nHooks (${tsFiles.length} files):`);

    for (const file of tsFiles) {
      const hookId = path.basename(path.dirname(file));
      console.log(`  - ${hookId} (hooks don't have props)`);
    }
  }

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProps, null, 2));
  console.log(`\nWritten to ${OUTPUT_FILE}`);
  console.log(`Total: ${Object.keys(allProps).length} components with props`);
}

extractProps();
