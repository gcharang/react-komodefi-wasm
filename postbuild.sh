#!/bin/bash

source .env
mv ./public/mm2_${process.env.NEXT_PUBLIC_WASM_VERSION}_bg.wasm ./public/mm2_bg.wasm
