export const STATUS_OCORRENCIA = [
  "EM_ANDAMENTO",
  "AGUARDANDO_VALIDACAO",
  "RESOLVIDO",
] as const;

export type StatusOcorrencia = (typeof STATUS_OCORRENCIA)[number];

export const STATUS_LABELS: Record<StatusOcorrencia, string> = {
  EM_ANDAMENTO: "Em Andamento",
  AGUARDANDO_VALIDACAO: "Aguardando Validação",
  RESOLVIDO: "Resolvido",
};

// Cores estilo semáforo
export const STATUS_DOT_COLOR: Record<StatusOcorrencia, string> = {
  EM_ANDAMENTO: "bg-red-500",
  AGUARDANDO_VALIDACAO: "bg-yellow-500",
  RESOLVIDO: "bg-green-500",
};

// Mesmas cores em hex, para uso em gráficos (SVG não aceita classes Tailwind)
export const STATUS_HEX_COLOR: Record<StatusOcorrencia, string> = {
  EM_ANDAMENTO: "#ef4444",
  AGUARDANDO_VALIDACAO: "#eab308",
  RESOLVIDO: "#22c55e",
};

export function isStatusOcorrencia(value: string): value is StatusOcorrencia {
  return (STATUS_OCORRENCIA as readonly string[]).includes(value);
}
