/// <reference types="vite/client" />

interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_SERVER_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
