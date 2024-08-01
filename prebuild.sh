#!/bin/bash

source .env
mv ./public/kdflib_bg.wasm ./public/kdf_${NEXT_PUBLIC_WASM_VERSION}_bg.wasm
