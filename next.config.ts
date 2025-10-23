import type { NextConfig } from "next";
import packageJson from "./package.json";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  images: {
    domains: [
      "nxd-storage-test.s3.ap-northeast-2.amazonaws.com",
      "storage.nxd-c.com",
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
