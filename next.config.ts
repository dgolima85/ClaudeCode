import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Padrão do Next.js é 1MB — pequeno demais pra anexar prints de tela
    // como evidência (ver botão "Anexar evidência" nas ocorrências). Um
    // pouco acima do limite de TAMANHO_MAXIMO_EVIDENCIA_BYTES (5MB, em
    // src/lib/evidencias.ts) pra sobrar espaço pro overhead do
    // multipart/form-data (boundaries, headers de cada parte).
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
