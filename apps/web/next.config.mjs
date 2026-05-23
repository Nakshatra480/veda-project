/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@vedaai/shared"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "standalone",
};

export default nextConfig;
