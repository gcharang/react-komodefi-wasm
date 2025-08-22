#!/bin/bash

# Pre-build script to handle WASM compression

# Check if the compressed WASM file exists
if [ ! -f "public/kdflib_bg.wasm.gz" ]; then
    echo "Compressed WASM not found, compressing..."
    if [ -f "public/kdflib_bg.wasm" ]; then
        gzip -9 -f -k public/kdflib_bg.wasm
        echo "WASM compressed successfully"
    else
        echo "Warning: Original WASM file not found"
    fi
fi

# Display file sizes
if [ -f "public/kdflib_bg.wasm" ] && [ -f "public/kdflib_bg.wasm.gz" ]; then
    echo "WASM file sizes:"
    ls -lh public/kdflib_bg.wasm*
fi