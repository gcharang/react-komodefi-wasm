import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkOnly } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    // Whether outdated caches should be removed.
    cleanupOutdatedCaches: true,
    concurrency: 10,
    ignoreURLParametersMatching: [],
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  // Handle external URLs with NetworkOnly (no caching)
  runtimeCaching: [
    {
      matcher: ({ url }) => {
        // Match any external URL (different origin than the app)
        return url.origin !== self.location.origin;
      },
      handler: new NetworkOnly(),
    },
  ],
});

serwist.addEventListeners();
