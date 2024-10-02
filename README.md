# react-atomicdex-wasm

## Pre-requisites

- NodejsV16 or newer. Recommendation: use `nvm`: https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/

## Build steps

- `yarn` -> the first time
- `yarn dev` -> starts a server at http://localhost:3000/

## Misc notes

To change the kdf bin being used, replace the file: `public/kdflib_bg.wasm` with it

To keep multiple versions of kdf bins in the public folder and test them one by one, make sure all of them have different names, then replace the name `kdflib_bg.wasm` in https://github.com/gcharang/react-komodefi-wasm/blob/master/src/components/Mm2Panel.jsx

Might want to restart the dev server and hard refresh(shift + f5) the browser window when the kdf binary being used is changed in code or replaced with same name in the file system

Best to open/reopen the url: http://localhost:3000/ in a private/incognito window when testing code/kdf changes, to be completely sure that cached kdf bins/other code aren't interfering

To update the API version using a url to a zipfile, use `./update_wasm.sh $zipfile_url`

To update the `coins` file version using a url to a raw github data, use `./update_coins.sh https://raw.githubusercontent.com/KomodoPlatform/coins/master/coins`

### Compiling and Integrating the Wasm Binary into the React Komodefi Project

If you don't have the `kdf` Wasm binary locally, you can compile it from the source code and integrate it into the React project using the following steps.

---

#### **Step 1: Compiling the Wasm Binary from Source**

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

4. **Create a zip archive** of the compiled files:

    ```bash
    zip -r ../target-wasm-release.zip ./*
    ```

---

#### **Step 2: Integrating the Wasm Binary**

Once the `kdf` binary has been compiled into a zip archive, follow these steps to update the React Komodefi project:

1. **Run the `update_wasm_path.sh` script**, passing the zip archive path as the first argument, and the version as the second argument:

    ```bash
    cd ~/RustroverProjects/react-komodefi-wasm
    ./update_wasm_path.sh /Users/username/RustroverProjects/komodo-defi-framework/target/target-wasm-release.zip 1ver
    ```

2. The script will:
    - Extract the Wasm files from the provided zip.
    - Update the relevant files in the `public` and `src/js` directories.
    - Modify the `.env` file to reflect the version you provided.