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

export function isCriticidade(value: string): value is Criticidade {
  return (CRITICIDADES as readonly string[]).includes(value);
}
