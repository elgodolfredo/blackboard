# Agent Guidelines for Blackboard

A Svelte + TypeScript + Vite project. This document provides essential information for agentic coding tools working in this repository.

## Build, Lint & Test Commands

```bash
# Development
npm run dev              # Start dev server at http://localhost:5173

# Type checking & validation
npm run check           # Run svelte-check + TypeScript type checking
                        # Checks both src/** and tsconfig.node.json

# Build
npm run build           # Compile for production (dist/)

# Preview
npm run preview         # Preview production build locally
```

**Note:** There are no unit tests configured. Use `npm run check` for validation.

## Code Style Guidelines

### TypeScript Configuration
- **Target:** ES2022
- **Module:** ESNext
- **Strict mode:** Enabled (`checkJs: true`, `allowJs: true`)
- **Svelte types:** Automatically included via `@tsconfig/svelte`
- All `.ts`, `.js`, and `.svelte` files are type-checked

### Imports
- Use ES6 imports: `import { ... } from 'module'`
- Absolute imports work via Svelte/Vite (e.g., `import Counter from './lib/Counter.svelte'`)
- Import styles after scripts in Svelte files
- Group imports: external packages first, then local modules

### File Organization
- Components: `src/lib/*.svelte`
- Entry point: `src/main.ts`
- Styles: Scoped `<style>` blocks in Svelte components or `src/app.css`
- Assets: `src/assets/` or public files in `public/`

### Svelte 5 Specifics
- Use `$state` for reactive state: `let count: number = $state(0)`
- Use `<script lang="ts">` for TypeScript in components
- Scoped styles are default (CSS within `<style>` blocks)
- Event handlers: `onclick={handler}`, `onchange={handler}`, etc.

### Formatting & Naming
- Indentation: 2 spaces (Vite/Svelte default)
- Use camelCase for variables and functions
- Use PascalCase for component files (e.g., `Counter.svelte`)
- Use kebab-case for CSS classes when needed
- Semicolons: Optional but be consistent with codebase style

### Type Annotations
- Always type function parameters and return types
- Use explicit types over `any`
- Svelte components have implicit return types
- Type state variables: `let count: number = $state(0)`

### Error Handling
- Use try-catch for async operations
- Log errors to console in development
- Provide user-friendly error messages in UI
- Type error boundaries: `catch (error: unknown) { ... }`

### Component Best Practices
- Keep components small and focused
- Props should be typed explicitly
- Use `export let` for component props
- Reactive updates: Svelte handles this automatically with `$state`
- Store state externally if needed for multiple components (using Svelte stores)

## Project Structure
```
src/
  ├── App.svelte         # Root component
  ├── main.ts            # Entry point
  ├── app.css            # Global styles
  ├── lib/               # Reusable components
  │   └── Counter.svelte
  └── assets/            # Static assets
```

## Important Notes
- Project uses **Svelte 5** with runes (`$state`, `$derived`, etc.)
- TypeScript version: ~5.9.3
- No build configuration beyond Vite defaults
- HMR is enabled for development but state preservation is disabled
- CSS is scoped to components by default
