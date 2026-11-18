import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pasta de saída. O padrão é .next. A build de conferência roda com NEXT_DIST_DIR=.next/verificacao,
  // para não mexer no .next/dev de um `next dev` ligado ao mesmo tempo (guia "building" do Next:
  // uma build isolada precisa de outro distDir). A Vercel e o `npm run dev` usam o padrão.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  experimental: {
    // Envio de documentos até 10 MB (DF-72): a ação do servidor e o proxy aceitam um pouco mais, a folga do
    // multipart; quem recusa o arquivo acima de 10 MB, com a mensagem da plataforma, é a validação (CA-12.2).
    serverActions: { bodySizeLimit: "11mb" },
    proxyClientMaxBodySize: "11mb",
  },
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
