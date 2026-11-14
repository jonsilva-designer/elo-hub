import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pasta de saída. O padrão é .next. A build de conferência roda com NEXT_DIST_DIR=.next/verificacao,
  // para não mexer no .next/dev de um `next dev` ligado ao mesmo tempo (guia "building" do Next:
  // uma build isolada precisa de outro distDir). A Vercel e o `npm run dev` usam o padrão.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
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
