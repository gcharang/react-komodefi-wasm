#!/bin/bash

[ ! -d wasm_versions ] && mkdir wasm_versions
cd wasm_versions

# Get the base filename from the provided zip file path
fn=${1##*/}

# Extract file name without .zip and append version provided as second parameter
new_fn="${fn%.zip}_$2.zip"

# Copy the file and rename it with the version appended
cp "$1" "$new_fn"

mkdir temp
unzip "$new_fn" -d temp
cd temp
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