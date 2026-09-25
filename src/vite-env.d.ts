/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_GEOCODING_API_URL: string
  readonly VITE_MAPBOX_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** Version de l'application (package.json), injectée au build par vite.config.ts (`define`) */
declare const __APP_VERSION__: string
