import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { unoptimized: true },
  // Este proyecto vive dentro de /pulsfit-web; fija la raíz y evita que
  // Turbopack adopte lockfiles de carpetas superiores (por ejemplo OneDrive).
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
