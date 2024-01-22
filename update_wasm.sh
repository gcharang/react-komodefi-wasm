#!/bin/bash

[ ! -d wasm_versions ] && mkdir wasm_versions
cd wasm_versions
fn=${1##*/}
[ ! -f $fn ] && wget $1
mkdir temp
unzip $fn -d temp
cd temp
mv mm2lib_bg.wasm ../../public/mm2lib_bg.wasm
sed -i "s|input = new URL('mm2lib_bg.wasm', import.meta.url);|input = new URL('mm2lib_bg.wasm', process.env.NEXT_PUBLIC_BASE_PATH);|" mm2lib.js

mv mm2lib.js ../../src/js/mm2lib.js
cp -r snippets/* ../../src/js/snippets/
cd ..
rm -rf temp
cd ..
basename=$(basename "$fn" .zip) # Remove .zip from filename
temp=${basename#*_}
version=${temp%-wasm} # Remove everything up to and including the first underscore
echo "NEXT_PUBLIC_WASM_VERSION=$version" > .env
echo "NEXT_PUBLIC_BASE_PATH=\"\"" >> .env
