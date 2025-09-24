import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "nxd-storage-test.s3.ap-northeast-2.amazonaws.com",
      "storage.nxd-c.com",
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
