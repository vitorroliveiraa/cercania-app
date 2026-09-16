import type { NextConfig } from "next";

// Headers de seguranca padrao em todas as rotas, exceto /imovel/* -- essa
// e a pagina publica do dossie, feita de proposito pra ser embedada via
// iframe no site da imobiliaria (ver plano-tecnico-mvp.md). X-Frame-Options
// DENY ali quebraria o objetivo central da Fase 3.
const HEADERS_SEGURANCA = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/((?!imovel).*)",
        headers: HEADERS_SEGURANCA,
      },
    ];
  },
};

export default nextConfig;
