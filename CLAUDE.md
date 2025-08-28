# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important

- Always place types in a appropriate file in src/types
- Use cursor-pointer for all clickable things like buttons
- Always make sure the components being implemented are responsive and will look good in mobile views too
- Prefer lucide icons when available. File list avaialable at https://github.com/lucide-icons/lucide/tree/main/icons

## Commands

### Development

- `yarn` - Install dependencies
- `yarn dev` - Start Next.js development server at http://localhost:3000
- `yarn build` - Build for production (runs prebuild.sh, Next build)
- `yarn start` - Start production server

### Update Scripts

- `./update_coins.sh` - Update coins configuration and seed nodes
- `./update_wasm.sh $zipfile_url` - Update WASM binary from URL
- `./update_coins_url.sh $github_raw_url` - Update coins file from GitHub

### Linting & Type Checking

- `npx tsc --noEmit` - Run TypeScript type checking
- `npx eslint .` - Run ESLint

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 14.2.30 configured as SPA with static export
- **State Management**: Zustand v5 with custom hooks pattern
- **Styling**: Tailwind CSS v4.1+ with custom theme
- **UI Components**: Headless UI v2.2
- **Code Editor**: Monaco Editor (@monaco-editor/react)
- **WASM Integration**: Komodo DeFi Framework (KDF) WebAssembly module
- **TypeScript**: v5.8.3 with strict typing

### Key Directories

```
/app/                    # Next.js app router
  layout.tsx            # Root layout
  page.tsx             # Main page entry
/src/
  App.tsx              # Core application component with responsive layout
  /components/         # React components
    Mm2Panel.tsx       # MM2 service management (WASM integration point)
    RpcPanel.tsx       # RPC interface with method selection
    JsonMonacoEditor.tsx # Monaco editor wrapper
    Toast.tsx          # Toast notification component
    ElectrumCoinsModal.tsx # Coin selection modal
  /store/              # Zustand state management
    useStore.ts        # Central store with all state slices
    modalIds.ts        # Modal identifier constants
  /types/              # TypeScript type definitions
    api.ts            # API-related types
    coins.ts          # Cryptocurrency types
    components.ts     # Component prop types
    store.ts          # Store state types
    wasm.ts           # WASM module types
  /shared-functions/   # Utility functions
    rpcRequest.ts     # RPC request handling
    fetchRpcMethods.ts # RPC method fetching
  /staticData/         # Static configuration data
/coins/                # Cryptocurrency configurations
/methods/              # RPC method definitions (Postman collections)
/public/
  kdflib_bg.wasm      # WASM binary (compressed as .wasm.gz)
```

### State Management Pattern

Zustand store with custom hooks for each state slice:

- `useMm2PanelState()` - MM2 panel state
- `useRpcPanelState()` - RPC panel state
- `useToastState()` - Toast notifications
- `useRpcMethods()` - RPC methods collection
- Each hook returns state and setters

### WASM Integration

The KDF WASM module is loaded in `Mm2Panel.tsx`:

- Loads compressed WASM from `/kdflib_bg.wasm.gz`
- Decompresses using `loadCompressedWasm` utility
- Key functions: `mm2_main()`, `mm2_stop()`, `mm2_main_status()`, `mm2_version()`

### Layout System

Responsive layout with different modes:

- **Desktop (≥768px)**: Resizable panels with draggable dividers
  - Left panel: MM2 config
  - Right panel: RPC interface
  - Bottom panels: Logs and Response (side by side)
- **Mobile (<768px)**: Tab-based navigation
  - Single panel view with tabs: MM2 Config | RPC | Logs | Response
  - Toast notifications with tab-switching capability

### Key Features

- **Monaco Editor Integration**: JSON editing with validation
- **Real-time RPC**: Send/receive RPC commands to KDF
- **Toast Notifications**: Success/error feedback with mobile tab switching
- **Electrum Coin Selection**: Modal for selecting and configuring coins
- **Password Syncing**: Auto-sync RPC passwords between panels
- **Error Indication**: Visual rings around panels with invalid JSON

### Type System

All types centralized in `/src/types/`:

- Component props defined in `components.ts`
- Store interfaces in `store.ts`
- No inline type definitions in components
- Strict TypeScript with comprehensive typing

### Build Configuration

- **Next.js Config**: Static export to `/dist/` directory
- **React Strict Mode**: Disabled for WASM compatibility
- **Service Worker**: Serwist integration for PWA features
- **Base Path**: Configurable via `NEXT_PUBLIC_BASE_PATH` env var

### Development Notes

- Hard refresh (Shift+F5) recommended when changing WASM binary
- Use incognito/private window for testing to avoid caching issues
- WASM binary can be swapped by replacing `public/kdflib_bg.wasm`
- Multiple WASM versions can coexist with different filenames

## Tailwind CSS v4 Conventions

### Critical Rules

- **Never use deprecated utilities** like `bg-opacity-*`, use `/opacity` syntax
- **Always use gap** instead of `space-x-*` or `space-y-*` in flex/grid
- **Use line-height modifiers** like `text-base/7` instead of `leading-*`
- **Prefer Tailwind's scale** over arbitrary values (use `ml-4` not `ml-[16px]`)
- **Use `min-h-dvh`** instead of `min-h-screen` for mobile compatibility

### Responsive Design

- Mobile-first approach with `md:` breakpoint at 768px
- Responsive text sizes: `text-xs md:text-sm`
- Touch-friendly targets: minimum 44x44px on mobile
- Stack layouts vertically on mobile, horizontal on desktop

### Component Patterns

- Extract repeated patterns into React components, not CSS classes
- Keep utility classes in JSX templates
- Use data attributes for complex state-based styling
- Group related utilities for easier maintenance
