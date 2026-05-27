import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  
  
  output: "standalone",

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  
  transpilePackages: [],
};

export default nextConfig;
