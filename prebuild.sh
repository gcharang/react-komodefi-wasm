#!/bin/bash

source .env
mv ./public/mm2lib_bg.wasm ./public/mm2_${NEXT_PUBLIC_WASM_VERSION}_bg.wasm
