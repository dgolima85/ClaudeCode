import { isCampeonatoPermitido } from "./campeonatos";

export type JogoExtraido = {
  sourceId: number;
  mandante: string;
  visitante: string;
  horario: string;
  dataBR: string;
  estadio: string;
  cidade: string;
  campeonato: string;
  canais: string[];
};

export type ResultadoExtracao = { jogos: JogoExtraido[] } | { error: string };

type TimeInfo = { name?: string };

type PartidaBruta = {
  teams?: { home?: number; away?: number };
  championship?: { name?: string; slug?: string };
  hour?: string;
  date?: string;
  stadium?: string;
  location?: { city?: string };
  content?: { broadcast?: { name?: string }[] };
};

type BlocoDados = {
  teams?: Record<string, TimeInfo>;
  order?: { date: string; matches: number[] }[];
  [chave: string]: unknown;
};

// A Central de Jogos do UOL embute os dados direto no HTML renderizado pelo
// servidor, dentro de um <script type="application/json">, em vez de uma
// chamada JS separada — mais estável que depender de replicar os headers de
// uma chamada de API (ver conversa). Em vez de fixar qual <script> é o
// certo (o id/hash pode mudar), procura pelo CONTEÚDO: o bloco que tem
// "teams" + "order" + pelo menos uma chave "football-match-<id>" juntos —
// resistente a uma mudança de hash, só quebra se a UOL mudar a estrutura
// dos dados em si.
function extrairBlocoDados(html: string): BlocoDados | null {
  const regex = /<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(match[1]);
    } catch {
      continue;
    }
    if (
      parsed &&
      typeof parsed === "object" &&
      "teams" in parsed &&
      "order" in parsed &&
      Object.keys(parsed as object).some((chave) => /^football-match-\d+$/.test(chave))
    ) {
      return parsed as BlocoDados;
    }
  }
  return null;
}

// "16h00" -> "16:00". Fica como veio (sem normalizar) se o formato não bater
// — melhor mostrar algo estranho no painel do que descartar o jogo inteiro.
function normalizarHora(hour: string | undefined): string {
  const m = (hour ?? "").match(/^(\d{1,2})h(\d{2})$/);
  if (!m) return hour ?? "";
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

/**
 * Extrai os jogos de hoje (já filtrados pelos campeonatos permitidos) do
 * HTML da Central de Jogos do UOL.
 *
 * `dataBRHoje` é o dia de hoje em Brasília, formato "yyyy-MM-dd" (ver
 * src/lib/dataHoraBR.ts `dataBR()`) — bate com o formato usado na lista
 * "order" da própria fonte.
 *
 * Retorna `{ error }` só quando a estrutura esperada não foi encontrada
 * (layout mudou) — hoje genuinamente não ter jogos nos campeonatos
 * acompanhados é `{ jogos: [] }`, não um erro.
 */
// Diagnóstico temporário pra investigar por que a extração falhou em
// produção, sem precisar devolver o HTML inteiro (pode ser grande e expor
// a página publicamente). Devolve só a forma do que foi encontrado.
export function diagnosticarHtml(html: string) {
  const regex = /<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/g;
  const blocos: { tamanho: number; parseOk: boolean; chaves?: string[]; erro?: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      const chaves = parsed && typeof parsed === "object" ? Object.keys(parsed) : [];
      blocos.push({ tamanho: match[1].length, parseOk: true, chaves: chaves.slice(0, 15) });
    } catch (e) {
      blocos.push({ tamanho: match[1].length, parseOk: false, erro: e instanceof Error ? e.message : String(e) });
    }
  }
  return {
    tamanhoHtml: html.length,
    blocosJsonEncontrados: blocos.length,
    blocos,
    contemFootballMatch: html.includes("football-match-"),
    contemSinaisDeBloqueio: /captcha|access denied|just a moment|attention required/i.test(html),
  };
}

export function extrairJogosDoDia(html: string, dataBRHoje: string): ResultadoExtracao {
  const bloco = extrairBlocoDados(html);
  if (!bloco || !bloco.teams || !bloco.order) {
    return {
      error: "Não foi possível encontrar o bloco de dados dos jogos na página (o layout da fonte pode ter mudado).",
    };
  }

  const times = bloco.teams;
  const diaHoje = bloco.order.find((o) => o.date === dataBRHoje);
  if (!diaHoje) {
    return { jogos: [] };
  }

  const jogos: JogoExtraido[] = [];
  for (const matchId of diaHoje.matches) {
    const partida = bloco[`football-match-${matchId}`] as PartidaBruta | undefined;
    if (!partida) continue;

    const campeonatoNome = partida.championship?.name ?? "";
    const campeonatoSlug = partida.championship?.slug ?? "";
    if (!campeonatoNome || !isCampeonatoPermitido(campeonatoNome, campeonatoSlug)) continue;

    const mandanteId = partida.teams?.home;
    const visitanteId = partida.teams?.away;
    const mandante = (mandanteId !== undefined ? times[String(mandanteId)]?.name : undefined) ?? "—";
    const visitante = (visitanteId !== undefined ? times[String(visitanteId)]?.name : undefined) ?? "—";

    const canais = (partida.content?.broadcast ?? [])
      .map((b) => b.name)
      .filter((nome): nome is string => Boolean(nome));

    jogos.push({
      sourceId: matchId,
      mandante,
      visitante,
      horario: normalizarHora(partida.hour),
      dataBR: partida.date ?? dataBRHoje,
      estadio: partida.stadium ?? "",
      cidade: partida.location?.city ?? "",
      campeonato: campeonatoNome,
      canais,
    });
  }

  jogos.sort((a, b) => a.horario.localeCompare(b.horario));
  return { jogos };
}
