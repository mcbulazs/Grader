import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Plain static files (out/), served by nginx in the container.
  output: "export",
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
