#!/bin/bash

source .env
mv ./public/kdf_${NEXT_PUBLIC_WASM_VERSION}_bg.wasm ./public/kdflib_bg.wasm
