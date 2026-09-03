export const CRITICIDADES = ["ALTA", "MEDIA", "BAIXA"] as const;

export type Criticidade = (typeof CRITICIDADES)[number];

export const CRITICIDADE_LABELS: Record<Criticidade, string> = {
  ALTA: "Alta",
  MEDIA: "Média",
  BAIXA: "Baixa",
};

// Usado para ordenar ocorrências pela criticidade (menor peso primeiro),
// ex.: no boletim de passagem de turno.
export const CRITICIDADE_PESO: Record<Criticidade, number> = {
  ALTA: 0,
  MEDIA: 1,
  BAIXA: 2,
};

export const CRITICIDADE_TEXT_COLOR: Record<Criticidade, string> = {
  ALTA: "text-red-600 dark:text-red-400",
  MEDIA: "text-amber-600 dark:text-amber-400",
  BAIXA: "text-gray-400 dark:text-gray-500",
};

// Mesmas cores em hex, para uso fora do Tailwind (ex.: boletim de turno em
// imagem, gerado com next/og — não processa classes CSS, só estilos inline).
export const CRITICIDADE_HEX_COLOR: Record<Criticidade, string> = {
  ALTA: "#dc2626",
  MEDIA: "#d97706",
  BAIXA: "#9ca3af",
};

export function isCriticidade(value: string): value is Criticidade {
  return (CRITICIDADES as readonly string[]).includes(value);
}
