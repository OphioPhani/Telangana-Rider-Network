import { resolve } from "node:path";

// Frontend-only static build for Vercel. All site assets live in public/ and
// are copied to dist/ verbatim; the three HTML entry pages are processed as
// a multi-page app. No backend, no SSR, no API keys.
export default {
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        trip: resolve(__dirname, "trip.html"),
        bikes: resolve(__dirname, "bikes.html"),
      },
    },
  },
};
