import { FILTRO_TIPO_MONITORIA_APP, FILTRO_TIPO_DEMAIS_ORIGENS } from "@/lib/monitoriaApp";

// Toda passagem de turno é registrada pra uma origem só — o analista faz
// duas passagens separadas (uma de Monitoria APP, outra de Demais Origens)
// em vez de uma passagem única misturando as duas.
export const ORIGENS_PASSAGEM_TURNO = ["MONITORIA_APP", "DEMAIS_ORIGENS"] as const;

export type OrigemPassagemTurno = (typeof ORIGENS_PASSAGEM_TURNO)[number];

export const ORIGEM_PASSAGEM_TURNO_LABELS: Record<OrigemPassagemTurno, string> = {
  MONITORIA_APP: "Monitoria APP",
  DEMAIS_ORIGENS: "Demais Origens",
};

export function isOrigemPassagemTurno(value: string): value is OrigemPassagemTurno {
  return (ORIGENS_PASSAGEM_TURNO as readonly string[]).includes(value);
}

export function filtroTipoPorOrigemPassagemTurno(origem: OrigemPassagemTurno) {
  return origem === "MONITORIA_APP" ? FILTRO_TIPO_MONITORIA_APP : FILTRO_TIPO_DEMAIS_ORIGENS;
}
