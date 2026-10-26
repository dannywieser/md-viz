/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the note cache service; defaults to `/api` (same origin; the dev server and the web image proxy it). */
  readonly VITE_CACHE_URL?: string
}
