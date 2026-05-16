# Agent Guidelines for Blackboard

A collaborative task board app using Svelte 5 + TypeScript + Vite + Firebase.

## Commands

```bash
npm run dev              # Dev server at http://localhost:5173
npm run check           # Type check (svelte-check + tsc)
npm run build           # Production build → dist/
npm run preview         # Preview production build
```

**No unit tests configured.** Use `npm run check` for validation.

## Firebase Setup

**Required:** Copy `.env.example` to `.env.local` and fill in Firebase credentials. The app will not run without valid Firebase config.

```bash
# .env.local must contain:
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

**Firebase Emulator:** Configured in `firebase.json` with Firestore on port 8080. Firestore offline persistence is enabled by default (see `src/lib/firebase.ts`).

**Firestore Rules:** Defined in `firestore.rules`. Boards support owner/collaborator access control. No hard deletes allowed (use `archived` flag).

## Architecture

- **Routing:** Uses `page` library (NOT SvelteKit). Routes defined in `src/lib/router.ts`:
  - `/` → Login (redirects to `/dashboard` if authenticated)
  - `/dashboard` → User's boards list
  - `/board/:id` → Individual task board
  
- **Real-time Sync:** Board state syncs via Firestore subscriptions (`subscribeToBoardUpdates` in `firestoreService.ts`). Subscriptions auto-cleanup on route change.

- **Entry Point:** `src/main.ts` → `App.svelte` (root component with routing logic)

## Svelte 5 Specifics

- **State:** `let count = $state(0)`
- **Computed:** `let doubled = $derived(count * 2)`
- **Effects:** `$effect(() => { ... })`
- **Props:** `let { name, age = 18 } = $props<{ name: string; age?: number }>()`
  - ⚠️ Do NOT use `export let` (Svelte 3/4 pattern)
- **Two-way binding:** `let { value = $bindable() } = $props()`

## Key Dependencies

- `firebase` - Auth + Firestore backend
- `page` - Client-side routing (not SvelteKit)
- `svelte-dnd-action` - Drag-and-drop for task items
- `svelte-modals` - Modal dialogs
- `@fortawesome/fontawesome-free` - Icons

## Type Checking

TypeScript strict mode enabled. All `.ts`, `.js`, and `.svelte` files are type-checked.

Config split:
- `tsconfig.app.json` - App source (`src/**`)
- `tsconfig.node.json` - Vite config
- `tsconfig.json` - Root (references both)

## Conventions

- **Components:** PascalCase files (e.g., `TaskBoard.svelte`)
- **Services:** camelCase files (e.g., `authService.ts`)
- **Indentation:** 2 spaces
- **Imports:** External packages first, then local modules
