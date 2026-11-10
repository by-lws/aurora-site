import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The deployed image-optimization endpoint currently rejects local images.
    // Serve the already-small portrait directly from the immutable build output.
    unoptimized: true,
  },
};

export default nextConfig;
