#!/bin/bash

source .env
mv ./public/mm2_bg.wasm ./public/mm2_${VITE_WASM_VERSION}_bg.wasm
