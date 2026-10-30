import { dataBR, horaBR, somarDiasBR, deInputDataHoraBR } from "@/lib/dataHoraBR";

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

// O turno Noite cruza a meia-noite (20:00 de um dia até 08:00 do dia
// seguinte) — "cruza" é detectado comparando os horários, não fixado no
// turno, pra continuar funcionando se as janelas de horário mudarem.
function cruzaMeiaNoite(turno: Turno): boolean {
  const horario = TURNO_HORARIOS[turno];
  return horario.fim <= horario.inicio;
}

/**
 * Janela real (início e fim, como instantes) de um turno que começou no dia
 * informado (yyyy-MM-dd, em Brasília). Para turnos que cruzam a meia-noite,
 * o fim cai no dia seguinte — sem isso, um relatório filtrado só pelo dia
 * corrido (00:00–23:59) fica com a atividade do turno Noite partida em dois
 * dias diferentes.
 */
export function janelaTurno(turno: Turno, diaBR: string): { inicio: Date; fim: Date } {
  const horario = TURNO_HORARIOS[turno];
  const diaFim = cruzaMeiaNoite(turno) ? somarDiasBR(diaBR, 1) : diaBR;
  return {
    inicio: deInputDataHoraBR(`${diaBR}T${horario.inicio}`),
    fim: deInputDataHoraBR(`${diaFim}T${horario.fim}`),
  };
}

/**
 * Dia (yyyy-MM-dd) em que começou o turno "vigente agora" para quem está
 * nesse turno. Necessário porque, pra um turno que cruza a meia-noite, o dia
 * de hoje nem sempre é o dia em que o turno começou: às 07h de um dia
 * ainda estamos dentro do turno Noite que começou ONTEM às 20h.
 */
export function diaInicioTurnoAtual(turno: Turno, agora: Date = new Date()): string {
  const hoje = dataBR(agora);
  if (!cruzaMeiaNoite(turno)) return hoje;
  const horaAtual = horaBR(agora);
  return horaAtual < TURNO_HORARIOS[turno].fim ? somarDiasBR(hoje, -1) : hoje;
}

// Regra de negócio: a passagem de turno só acontece entre turnos que se
// relacionam diretamente. Intermediário só troca passagem com o próprio
// Intermediário (do turno seguinte); Manhã e Noite só trocam entre si.
export const TURNO_DESTINO_PASSAGEM: Record<Turno, Turno> = {
  MANHA: "NOITE",
  NOITE: "MANHA",
  INTERMEDIARIO: "INTERMEDIARIO",
};
