# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. Update this file whenever anything about the project changes significantly.

## Commands

### Development
- `yarn` - Install dependencies
- `yarn dev` - Start Next.js development server at http://localhost:3000
- `yarn build` - Build for production (runs prebuild.sh, Next build, postbuild.sh)
- `yarn start` - Start production server

### Update Scripts
- `./update_coins.sh` - Update coins configuration and seed nodes
- `./update_wasm.sh $zipfile_url` - Update WASM binary from URL
- `./update_coins_url.sh $github_raw_url` - Update coins file from GitHub

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 13.5.4 configured as SPA with static export
- **State Management**: Recoil with modular store pattern
- **Styling**: Tailwind CSS with custom color scheme
- **WASM Integration**: Komodo DeFi Framework (KDF) WebAssembly module

### Project Structure
```
/app/                 # Next.js app router
  layout.jsx         # Root layout
  page.jsx          # Main page with RecoilRoot
/src/
  App.jsx           # Core application component
  /components/      # React components
    Mm2Panel.jsx    # MM2 service management (WASM integration point)
    RpcPanel.jsx    # RPC interface
    RpcResponsePanel.jsx
    Mm2LogsPanel.jsx
  /store/           # Recoil state modules
    atomKeys.js     # Centralized atom keys
    /mm2/, /rpc/, /modals/, etc.
  /shared-functions/  # Utility functions
/coins/             # Cryptocurrency configurations
/methods/           # RPC method definitions (Postman collections)
/public/
  kdflib_bg.wasm    # WASM binary
```

### State Management Pattern
Each store module exports a custom hook (e.g., `useMm2PanelState()`) that provides state and setters. All atom keys are centralized in `atomKeys.js`.

### WASM Integration
The KDF WASM module is loaded in `Mm2Panel.jsx` and provides:
- `mm2_main()` - Start MM2 service
- `mm2_stop()` - Stop MM2 service
- `mm2_main_status()` - Get status
- `mm2_version()` - Get version

### Panel Layout System
The app uses resizable panels with draggable dividers:
- Sidebar (40px default)
- Main area split between MM2 and RPC panels
- Bottom panel for logs/responses (220px default)

### Build Process
1. `prebuild.sh` - Renames WASM with version
2. Next.js build - Creates static export in `/dist/`
3. `postbuild.sh` - Restores WASM filename

### Key Files to Understand
- `src/components/Mm2Panel.jsx` - WASM loading and MM2 service management
- `src/shared-functions/rpcRequest.js` - RPC request handling
- `src/store/atomKeys.js` - All Recoil atom keys
- `next.config.mjs` - Next.js configuration (static export)

