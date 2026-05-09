import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/learning",
        destination: "/focus",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
