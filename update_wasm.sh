#!/bin/bash

[ ! -d wasm_versions ] && mkdir wasm_versions
cd wasm_versions
fn=${1##*/}
[ ! -f $fn ] && wget $1
mkdir temp
unzip $fn -d temp
cd temp
mv kdflib_bg.wasm ../../public/kdflib_bg.wasm
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|input = new URL('kdflib_bg.wasm', import.meta.url);|input = new URL('kdflib_bg.wasm', process.env.NEXT_PUBLIC_BASE_PATH);|" kdflib.js
else
    sed -i "s|input = new URL('kdflib_bg.wasm', import.meta.url);|input = new URL('kdflib_bg.wasm', process.env.NEXT_PUBLIC_BASE_PATH);|" kdflib.js
fi

mv kdflib.js ../../src/js/kdflib.js
mv kdflib.d.ts ../../src/types/kdflib.d.ts
rm -rf ../../src/js/snippets/
cp -r snippets ../../src/js/
cd ..
rm -rf temp
cd ..
basename=$(basename "$fn" .zip) # Remove .zip from filename
temp=${basename#*_}
version=${temp%-wasm} # Remove everything up to and including the first underscore
echo "NEXT_PUBLIC_KDF_WASM_LIB_VERSION=$version" >.env
echo "NEXT_PUBLIC_BASE_PATH=\"\"" >>.env
