#!/bin/bash

# Ensure wasm_versions directory exists
[ ! -d wasm_versions ] && mkdir wasm_versions
cd wasm_versions

# Check if the first argument is a URL, zip file, or folder
if [[ $1 == http* ]] || [[ $1 == https* ]]; then
    # Handle URL download
    echo "Downloading from URL: $1"
    fn=${1##*/}
    [ ! -f "$fn" ] && wget "$1"
    
    # Extract file name without .zip and append version provided as second parameter
    if [ -z "$2" ]; then
        # Try to extract version from filename if not provided
        basename=$(basename "$fn" .zip)
        temp=${basename#*_}
        version=${temp%-wasm}
    else
        version=$2
    fi
    new_fn="${fn%.zip}_${version}.zip"
    
    # Rename the downloaded file with version
    mv "$fn" "$new_fn"
    
    # Extract the zip file to a temp folder
    echo "Extracting WASM files..."
    mkdir temp
    unzip "$new_fn" -d temp
    cd temp
elif [[ -f $1 ]]; then
    # Handle local zip file
    echo "Processing local zip file: $1"
    fn=${1##*/}
    
    # Use provided version or default
    version=${2:-"custom"}
    new_fn="${fn%.zip}_${version}.zip"
    
    # Copy the file and rename it with the version appended
    cp "$1" "$new_fn"
    
    # Extract the zip file to a temp folder
    echo "Extracting WASM files..."
    mkdir temp
    unzip "$new_fn" -d temp
    cd temp
elif [[ -d $1 ]]; then
    # Handle directory
    echo "Processing directory: $1"
    folder_name=$(basename "$1")
    
    # Use provided version or default
    version=${2:-"custom"}
    new_fn="${folder_name}_${version}.zip"
    
    # Create zip from the folder and store it in the current `wasm_versions` folder
    echo "Creating archive from directory..."
    zip -r "$new_fn" "$1"/*
    
    # Copy the content of the folder to a temp directory
    mkdir temp
    cp -r "$1/"* temp/
    cd temp
else
    echo "Error: First argument must be a valid URL, zip file, or directory."
    exit 1
fi

# Move the original WASM file
echo "Moving WASM file to public directory..."
mv kdflib_bg.wasm ../../public/kdflib_bg.wasm

# Compress the WASM file with gzip
echo "Compressing WASM with gzip (maximum compression)..."
gzip -9 -f -k ../../public/kdflib_bg.wasm
echo "WASM compressed successfully!"

# Display file sizes for comparison
echo "WASM file sizes:"
ls -lh ../../public/kdflib_bg.wasm*

# Remove the uncompressed version (keeping only .wasm.gz)
echo "Removing uncompressed WASM file..."
rm ../../public/kdflib_bg.wasm

# Update the kdflib.js file with proper URL handling
echo "Updating kdflib.js..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS sed requires '' for in-place editing
    sed -i '' "s|input = new URL('kdflib_bg.wasm', import.meta.url);|input = new URL('kdflib_bg.wasm', process.env.NEXT_PUBLIC_BASE_PATH);|" kdflib.js
    # Also handle the pattern without 'input ='
    sed -i '' "s|new URL('kdflib_bg.wasm', import.meta.url);|new URL('kdflib_bg.wasm', process.env.NEXT_PUBLIC_BASE_PATH);|" kdflib.js
else
    # Linux sed
    sed -i "s|input = new URL('kdflib_bg.wasm', import.meta.url);|input = new URL('kdflib_bg.wasm', process.env.NEXT_PUBLIC_BASE_PATH);|" kdflib.js
    # Also handle the pattern without 'input ='
    sed -i "s|new URL('kdflib_bg.wasm', import.meta.url);|new URL('kdflib_bg.wasm', process.env.NEXT_PUBLIC_BASE_PATH);|" kdflib.js
fi

# Move JavaScript files
echo "Moving JavaScript files..."
mv kdflib.js ../../src/js/kdflib.js

# Clean up old snippets and copy new ones
echo "Updating snippets..."
rm -rf ../../src/js/snippets/
cp -r snippets ../../src/js/

# Clean up temp directory
cd ..
rm -rf temp
cd ..

# Update .env file with version information
echo "Updating .env file..."
echo "NEXT_PUBLIC_KDF_WASM_LIB_VERSION=${version}" > .env
echo "NEXT_PUBLIC_BASE_PATH=\"\"" >> .env

echo "✅ WASM integration complete!"
echo "   Version: ${version}"
echo "   Compressed WASM file: public/kdflib_bg.wasm.gz"