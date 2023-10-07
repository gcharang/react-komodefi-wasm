#!/bin/bash

source .env
mv ./public/mm2_bg.wasm ./public/mm2_${process.env.NEXT_PUBLIC_WASM_VERSION}_bg.wasm
