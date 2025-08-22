#!/bin/bash

# Pre-build script to handle WASM compression

# Check if the compressed WASM file exists
if [ ! -f "public/kdflib_bg.wasm.br" ]; then
    echo "Compressed WASM not found, compressing..."
    if [ -f "public/kdflib_bg.wasm" ]; then
        brotli -q 11 -f public/kdflib_bg.wasm -o public/kdflib_bg.wasm.br
        echo "WASM compressed successfully"
    else
        echo "Warning: Original WASM file not found"
    fi
fi

# Display file sizes
if [ -f "public/kdflib_bg.wasm" ] && [ -f "public/kdflib_bg.wasm.br" ]; then
    echo "WASM file sizes:"
    ls -lh public/kdflib_bg.wasm*
fi