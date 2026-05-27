import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  experimental: {
    // Opt in to Next.js 16 features
  },
};

export default nextConfig;
