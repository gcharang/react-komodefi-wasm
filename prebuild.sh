#!/bin/bash

source .env
mv ./public/kdflib_bg.wasm ./public/kdf_${NEXT_PUBLIC_KDF_WASM_LIB_VERSION}_bg.wasm
