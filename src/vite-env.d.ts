/// <reference types="vite/client" />

/**
 * Vite Environment Type Declarations
 *
 * این فایل type definitions برای فایل‌های استاتیک و assets را تعریف می‌کند.
 * Vite به صورت خودکار این فایل را تشخیص می‌دهد.
 */

// CSS Modules support
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Regular CSS imports (side-effect imports)
declare module '*.css' {
  const css: string;
  export default css;
}

// Image assets
declare module '*.svg' {
  import type { FunctionComponent, SVGProps } from 'react';
  const src: string;
  export default src;

  // Also export as React component for SVGR
  export const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

// Font assets
declare module '*.woff' {
  const src: string;
  export default src;
}

declare module '*.woff2' {
  const src: string;
  export default src;
}

declare module '*.ttf' {
  const src: string;
  export default src;
}

// Environment variables
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}