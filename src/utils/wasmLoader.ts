/**
 * Utility to load and decompress gzip-compressed WASM files
 */

/**
 * Fetches and decompresses a gzip-compressed WASM file
 * @param url - URL to the .wasm.gz file
 * @returns Promise resolving to the decompressed WASM ArrayBuffer
 */
export async function loadCompressedWasm(url: string | URL): Promise<ArrayBuffer> {
  try {
    // Fetch the compressed WASM file
    const response = await fetch(url.toString(), {
      method: 'GET',
      cache: 'force-cache', // Use cache if available
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch compressed WASM: ${response.status} ${response.statusText}`
      );
    }

    // Check if browser supports DecompressionStream
    if (!('DecompressionStream' in globalThis)) {
      throw new Error(
        'Browser does not support DecompressionStream API. Please use a modern browser.'
      );
    }

    // Create a decompression stream for gzip
    const decompressionStream = new DecompressionStream('gzip');

    // Pipe the response through the decompression stream
    const decompressedStream = response.body!.pipeThrough(decompressionStream);

    // Read the decompressed stream into an ArrayBuffer
    const reader = decompressedStream.getReader();
    const chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Combine all chunks into a single ArrayBuffer
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    console.log(`WASM decompressed: ${(totalLength / 1024 / 1024).toFixed(2)} MB`);
    
    return result.buffer;
  } catch (error) {
    console.error('Failed to load compressed WASM:', error);
    throw error;
  }
}

/**
 * Checks if the browser supports gzip decompression
 * @returns boolean indicating support
 */
export function supportsGzipDecompression(): boolean {
  return 'DecompressionStream' in globalThis;
}