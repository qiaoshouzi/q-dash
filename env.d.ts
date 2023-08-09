/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly Q_Assets_HostName: string;
  readonly Q_Old_Assets_HostName: string;

  readonly Q_API_HostName: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
