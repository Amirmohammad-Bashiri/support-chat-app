import withPWAInit from "@ducanh2912/next-pwa";

import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  dynamicStartUrl: true,
  dynamicStartUrlRedirect: "/login",
  reloadOnOnline: false,
  extendDefaultRuntimeCaching: false, // Disable default caching rules
  workboxOptions: {
    cacheId: "v-1.0.2",
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /.*/,
        handler: "NetworkOnly",
      },
    ],
    exclude: [/\.mp4$/],
  },
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.amestr.ir",
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default withPWA(nextConfig);
