declare module 'cors-anywhere' {
  interface CorsAnywhereOptions {
    originWhitelist?: string[];
    requireHeader?: string[];
    removeHeaders?: string[];
    redirectSameOrigin?: boolean;
    httpProxyOptions?: {
      xfwd?: boolean;
    };
  }

  export function createServer(options?: CorsAnywhereOptions): any;
} 