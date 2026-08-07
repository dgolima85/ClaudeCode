export const TURNOS = ["MANHA", "INTERMEDIARIO", "NOITE"] as const;

export type Turno = (typeof TURNOS)[number];

export const TURNO_LABELS: Record<Turno, string> = {
  MANHA: "Manhã",
  INTERMEDIARIO: "Intermediário",
  NOITE: "Noite",
};

// Janelas de horário de referência de cada turno. O turno Intermediário
// se sobrepõe aos demais (reforço de cobertura), então não é possível
// inferir um único "turno atual" só pelo relógio — por isso o relatório
// de passagem de turno usa como padrão o turno do próprio analista logado.
export const TURNO_HORARIOS: Record<Turno, { inicio: string; fim: string }> = {
  MANHA: { inicio: "08:00", fim: "20:00" },
  INTERMEDIARIO: { inicio: "07:00", fim: "23:00" },
  NOITE: { inicio: "20:00", fim: "08:00" },
};

export function isTurno(value: string): value is Turno {
  return (TURNOS as readonly string[]).includes(value);
}
