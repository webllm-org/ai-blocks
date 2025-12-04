# ai-blocks

AI-focused UI components for building AI frontend interfaces with [WebLLM](https://webllm.org).

## What is WebLLM?

WebLLM is a browser-native LLM and AI integration protocol. It provides a unified API for accessing language models directly in the browser, enabling privacy-preserving AI features without server-side API calls.

## What is ai-blocks?

This package provides 50+ ready-to-use AI components that work with WebLLM:

- **Chat interfaces** - Simple chat, personas, voice chat, tool use
- **Text generation** - Streaming, rewriting, expanding, autocomplete
- **Structured output** - Sentiment analysis, entity extraction, JSON generation
- **Content tools** - Summarization, translation, reading level adjustment
- **Forms** - Smart validation, autofill, contact forms
- **E-commerce** - Product search, reviews, size advisor
- **Education** - Flashcards, quizzes, Socratic tutoring
- **Accessibility** - Alt text, simplification, screen reader prep

All components can be installed via the shadcn CLI and work with the `webllm` npm package.

## Installation

### Option 1: shadcn CLI (recommended)

Install individual components via shadcn CLI:

```bash
npx shadcn@latest add https://webllm.org/r/simple-chat.json
npx shadcn@latest add https://webllm.org/r/chat-with-tools.json
```

### Option 2: npm package

Install the package for direct imports:

```bash
npm install ai-blocks webllm
```

```tsx
import { SimpleChatDemo } from 'ai-blocks';
// or individual imports
import { SimpleChatDemo } from 'ai-blocks/demos/SimpleChatDemo';
```

**Note:** Direct imports require a [shadcn/ui](https://ui.shadcn.com) setup with path aliases configured (`@/components/ui/*`, `@/lib/utils`).

## Browse Components

View all available components:

```bash
curl https://webllm.org/r/index.json
```

Or browse visually at [webllm.org/blocks](https://webllm.org/blocks).

## Requirements

- React 18+
- [webllm](https://www.npmjs.com/package/webllm) npm package
- [shadcn/ui](https://ui.shadcn.com) setup with path aliases (`@/components/ui/*`, `@/lib/utils`)
- Tailwind CSS
- [lucide-react](https://lucide.dev) for icons

> **Note:** Currently only React with shadcn/ui is supported. Plain React and vanilla JS exports may be added in the future.

## Links

- [Website](https://webllm.org)
- [Component Browser](https://webllm.org/blocks)
- [Documentation](https://webllm.org/docs)
- [GitHub](https://github.com/webllm-org/webllm)

.
