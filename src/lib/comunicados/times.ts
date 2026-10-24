// Times usados tanto no campo "Time" (equipe acionada) quanto em "Times
// notificados" (multi-escolha) do comunicado de Acionamento NOC.
export const TIMES_COMUNICADO = [
  "NOC",
  "Infraestrutura",
  "QA",
  "Mobile",
  "Suporte e Performance",
  "TV",
  "Web",
  "Cyber Segurança",
  "Diretoria TI Watch",
] as const;

export type TimeComunicado = (typeof TIMES_COMUNICADO)[number];

/** Junta uma lista de times no padrão "A; B e C" usado no rodapé do comunicado. */
export function formatarListaTimes(times: string[]): string {
  if (times.length === 0) return "";
  if (times.length === 1) return times[0];
  return `${times.slice(0, -1).join("; ")} e ${times[times.length - 1]}`;
}
