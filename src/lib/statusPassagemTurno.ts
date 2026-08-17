export const STATUS_PASSAGEM_TURNO = ["ABERTA", "CONFIRMADA"] as const;

export type StatusPassagemTurno = (typeof STATUS_PASSAGEM_TURNO)[number];

export const STATUS_PASSAGEM_TURNO_LABELS: Record<StatusPassagemTurno, string> = {
  ABERTA: "Aguardando confirmação",
  CONFIRMADA: "Confirmada",
};

export const STATUS_PASSAGEM_TURNO_DOT_COLOR: Record<StatusPassagemTurno, string> = {
  ABERTA: "bg-yellow-500",
  CONFIRMADA: "bg-green-500",
};

export function isStatusPassagemTurno(value: string): value is StatusPassagemTurno {
  return (STATUS_PASSAGEM_TURNO as readonly string[]).includes(value);
}
