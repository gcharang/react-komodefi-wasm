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

To update the KDF version using a url to a zip file from releases, use `./update_wasm.sh $zipfile_url`

To update the `coins` file version using a url to a raw github data, use `./update_coins_url.sh https://raw.githubusercontent.com/KomodoPlatform/coins/master/coins`

Builds: https://sdk.devbuilds.komodo.earth/dev/

## Compiling and Integrating the Wasm Binary from Source

If you don't have the `kdf` Wasm binary locally, you can compile it from the source code and integrate it into the React project using the following steps.

### Step 1: Compiling the Wasm Binary from Source

1. **Set up the development environment** for the [KomodoDeFi Framework](https://github.com/KomodoPlatform/komodo-defi-framework).

2. **Compile the Wasm binary** using `wasm-pack` based on your platform:

   - **For Mac Silicon:**

   ```bash
   cd ~/RustroverProjects/komodo-defi-framework
   CC=/opt/homebrew/opt/llvm/bin/clang AR=/opt/homebrew/opt/llvm/bin/llvm-ar wasm-pack build --release mm2src/mm2_bin_lib --target web --out-dir ../../target/target-wasm-release
   ```

   - **For Linux:**

   ```bash
   cd ~/RustroverProjects/komodo-defi-framework
   wasm-pack build --release mm2src/mm2_bin_lib --target web --out-dir ../../target/target-wasm-release
   ```

3. **Navigate to the output folder** where the Wasm files are compiled:

   ```bash
   cd ~/RustroverProjects/komodo-defi-framework/target/target-wasm-release
   ```

4. You have two options:

   - **Option 1: If you want to use the directory directly** with the integration script, you can skip zipping the folder and proceed to Step 2.

   - **Option 2: If you prefer to create a zip archive** of the compiled files, follow this step:

   ```bash
   zip -r ../target-wasm-release.zip ./*
   ```

### Step 2: Integrating the Wasm Binary

Once the `kdf` binary is compiled (either as a folder or a zip archive), follow these steps to update the React Komodefi project:

1. **Run the `update_wasm_path.sh` script**, which supports multiple input types:

   - **Using a URL** (downloads automatically):

   ```bash
   cd ~/RustroverProjects/react-komodefi-wasm
   ./update_wasm_path.sh https://github.com/KomodoPlatform/komodo-defi-framework/releases/download/v2.0.0-beta/kdf_2.0.0-beta_wasm.zip v2.0.0-beta
   ```

   - **Using a local zip archive**:

   ```bash
   cd ~/RustroverProjects/react-komodefi-wasm
   ./update_wasm_path.sh ~/RustroverProjects/komodo-defi-framework/target/target-wasm-release.zip 1ver
   ```

   - **Using a directory**:

   ```bash
   cd ~/RustroverProjects/react-komodefi-wasm
   ./update_wasm_path.sh ~/RustroverProjects/komodo-defi-framework/target/target-wasm-release 1ver
   ```

   Note: If version is not provided for URLs, the script will attempt to extract it from the filename.

2. The script will:
   - For URLs: Download and extract the WASM files
   - For zip files: Extract the WASM files from the provided zip
   - For directories: Copy the contents directly
   - **Compress the WASM file with gzip** for optimal performance
   - Update the relevant files in the `public` and `src/js` directories
   - Clean up old snippets and install new ones
   - Modify the `.env` file with the version information
   - Display file sizes showing compression savings