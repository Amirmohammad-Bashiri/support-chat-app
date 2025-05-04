import withPWAInit from "@ducanh2912/next-pwa";

import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  dynamicStartUrl: true,
  dynamicStartUrlRedirect: "/login",
  reloadOnOnline: true,
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    cacheId: "v-1.0.0",
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: new RegExp(
          `${process.env.NEXT_PUBLIC_HTTP_URL}/v1/users/login`
        ),
        handler: "NetworkOnly",
      },
      {
        urlPattern: new RegExp(
          `${process.env.NEXT_PUBLIC_HTTP_URL}/v1/users/login/verification-login`
        ),
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
