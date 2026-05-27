import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker / Cloud Run deployment.
  // Outputs a self-contained bundle in .next/standalone that doesn't need
  // the full node_modules — keeps the Docker image small.
  output: "standalone",

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  // Treat Razorpay checkout.js as external (CDN loaded)
  transpilePackages: [],
};

export default nextConfig;
