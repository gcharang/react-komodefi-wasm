# Use Komodo DeFi Framework's wasm module with react/next

A Next.js-based web interface for interacting with the Komodo DeFi Framework (KDF) WebAssembly module.

## Prerequisites

- Node.js v22 or newer (recommended: use [nvm](https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/))
- Yarn v4.9.2 (managed via Corepack)

## Installation

### Enable Corepack and Install Dependencies

```bash
# Enable Corepack
corepack enable

# Install Yarn version specified in package.json
corepack install

# Install project dependencies
yarn install
```

## Development

```bash
# Update coins configuration and seed nodes info
./update_coins.sh

# Start development server
yarn dev
```

The development server will be available at http://localhost:3000/

## Build and Production

```bash
# Build for production
yarn build

# Start production server
yarn start
```

## Misc notes

To change the kdf bin being used, replace the file: `public/kdflib_bg.wasm` with it

To keep multiple versions of kdf bins in the public folder and test them one by one, make sure all of them have different names, then replace the name `kdflib_bg.wasm` in https://github.com/gcharang/react-komodefi-wasm/blob/master/src/components/Mm2Panel.jsx

Might want to restart the dev server and hard refresh(shift + f5) the browser window when the kdf binary being used is changed in code or replaced with same name in the file system

Best to open/reopen the url: http://localhost:3000/ in a private/incognito window when testing code/kdf changes, to be completely sure that cached kdf bins/other code aren't interfering

To update the API version using a url to a zipfile, use `./update_wasm.sh $zipfile_url`

To update the `coins` file version using a url to a raw github data, use `./update_coins_url.sh https://raw.githubusercontent.com/KomodoPlatform/coins/master/coins`
