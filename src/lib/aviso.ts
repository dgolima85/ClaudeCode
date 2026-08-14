export const MODELOS_AVISO = ["INFORMATIVO", "ACOMPANHAMENTO", "ATUACAO"] as const;

export type ModeloAviso = (typeof MODELOS_AVISO)[number];

export const MODELO_AVISO_LABELS: Record<ModeloAviso, string> = {
  INFORMATIVO: "Informativo",
  ACOMPANHAMENTO: "Acompanhamento",
  ATUACAO: "Atuação",
};

export function isModeloAviso(value: string): value is ModeloAviso {
  return (MODELOS_AVISO as readonly string[]).includes(value);
}

/** Um aviso é "Ativo" até o instante em que expiraEm é atingido; a partir daí é "Concluído". */
export function statusAviso(expiraEm: Date | string): "ATIVO" | "CONCLUIDO" {
  const data = typeof expiraEm === "string" ? new Date(expiraEm) : expiraEm;
  return data.getTime() > Date.now() ? "ATIVO" : "CONCLUIDO";
}
