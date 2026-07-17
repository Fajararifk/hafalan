import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json in the parent D:\hafalan directory (from an unrelated
  // sibling script) makes Next.js misdetect the workspace root — pin it explicitly.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
