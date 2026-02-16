import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Optional: Add trailingSlash: true if Netlify prefers directories
  // trailingSlash: true, 
  images: {
    unoptimized: true, // Required for static export if using Next/Image
  }
};

export default nextConfig;
