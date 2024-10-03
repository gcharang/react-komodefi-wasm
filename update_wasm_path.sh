#!/bin/bash

[ ! -d wasm_versions ] && mkdir wasm_versions
cd wasm_versions

# Check if the first argument is a zip file or a folder
if [[ -f $1 ]]; then
    # Get the base filename from the provided zip file path
    fn=${1##*/}

    # Extract file name without .zip and append version provided as second parameter
    new_fn="${fn%.zip}_$2.zip"

    # Copy the file and rename it with the version appended
    cp "$1" "$new_fn"

    # Extract the zip file to a temp folder
    mkdir temp
    unzip "$new_fn" -d temp
    cd temp
elif [[ -d $1 ]]; then
    # If it's a folder, zip the folder and save it to wasm_versions with the version appended
    folder_name=$(basename "$1")
    new_fn="${folder_name}_$2.zip"

    # Create zip from the folder and store it in the current `wasm_versions` folder
    zip -r "$new_fn" "$1"/*

    # Copy the content of the folder to a temp directory
    mkdir temp
    cp -r "$1/"* temp/
    cd temp
else
    echo "Error: First argument must be a valid zip file or directory."
    exit 1
fi

mv kdflib_bg.wasm ../../public/kdflib_bg.wasm
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|input = new URL('kdflib_bg.wasm', import.meta.url);|input = new URL('kdflib_bg.wasm', process.env.NEXT_PUBLIC_BASE_PATH);|" kdflib.js
else
    sed -i "s|input = new URL('kdflib_bg.wasm', import.meta.url);|input = new URL('kdflib_bg.wasm', process.env.NEXT_PUBLIC_BASE_PATH);|" kdflib.js
fi

mv kdflib.js ../../src/js/kdflib.js
cp -r snippets/* ../../src/js/snippets/
cd ..
rm -rf temp
cd ..

echo "NEXT_PUBLIC_WASM_VERSION=$2" > .env
echo "NEXT_PUBLIC_BASE_PATH=\"\"" >> .env