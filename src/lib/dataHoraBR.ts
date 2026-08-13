// O sistema é usado por times NOC/VOC no Brasil e deve sempre exibir/filtrar
// no horário de Brasília, independente do fuso do servidor (Vercel roda em
// UTC) ou do navegador do analista. Desde 2019 o Brasil não tem mais horário
// de verão, então America/Sao_Paulo é um offset fixo (-03:00) o ano todo.

const TIMEZONE_BR = "America/Sao_Paulo";

const formatterDataHoraBR = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIMEZONE_BR,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const formatterDiaBR = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE_BR,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const formatterInputBR = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE_BR,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Formata uma data/hora no padrão dd/MM/yyyy HH:mm, sempre no horário de Brasília. */
export function formatarDataHoraBR(data: Date | string): string {
  const d = typeof data === "string" ? new Date(data) : data;
  return formatterDataHoraBR.format(d).replace(",", "");
}

/** Retorna o dia (yyyy-MM-dd) correspondente a uma data, no horário de Brasília. */
export function dataBR(data: Date = new Date()): string {
  return formatterDiaBR.format(data);
}

/** Instante UTC correspondente ao início (00:00:00.000) de um dia (yyyy-MM-dd) em Brasília. */
export function inicioDoDiaBR(diaBR: string): Date {
  return new Date(`${diaBR}T00:00:00.000-03:00`);
}

/** Instante UTC correspondente ao fim (23:59:59.999) de um dia (yyyy-MM-dd) em Brasília. */
export function fimDoDiaBR(diaBR: string): Date {
  return new Date(`${diaBR}T23:59:59.999-03:00`);
}

/** Formata uma data/hora para o valor de um <input type="datetime-local">, em horário de Brasília. */
export function paraInputDataHoraBR(data: Date | string): string {
  const d = typeof data === "string" ? new Date(data) : data;
  const partes = formatterInputBR.formatToParts(d);
  const parte = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "";
  return `${parte("year")}-${parte("month")}-${parte("day")}T${parte("hour")}:${parte("minute")}`;
}

/** Converte o valor de um <input type="datetime-local"> (yyyy-MM-ddTHH:mm), entendido como horário de Brasília, para o instante UTC correspondente. */
export function deInputDataHoraBR(valor: string): Date {
  return new Date(`${valor}:00-03:00`);
}
