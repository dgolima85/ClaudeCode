import { prisma } from "@/lib/prisma";
import { dataBR } from "@/lib/dataHoraBR";
import { isCanalDoPortfolio, normalizarNomeCanal } from "./canaisPortfolio";

export type JogoDoDiaLinha = {
  id: string;
  // Id da partida na fonte (UOL) — usado pra atrelar o acompanhamento
  // operacional (ver src/app/jogos-do-dia/actions.ts), que precisa sobreviver
  // à substituição diária desta tabela.
  sourceId: number;
  dataBR: string;
  mandante: string;
  visitante: string;
  horario: string;
  estadio: string;
  cidade: string;
  campeonato: string;
  canais: string[];
};

export type JogosDeHoje = {
  jogos: JogoDoDiaLinha[];
  ultimoSucessoEm: string | null;
  ultimoErro: string | null;
};

/**
 * Lê os jogos de hoje já sincronizados no banco — nunca busca o UOL ao vivo
 * (ver src/lib/jogosDoDia/sync.ts). Os canais de cada jogo são filtrados
 * pros que são do nosso portfólio (ver src/lib/jogosDoDia/canaisPortfolio.ts
 * e Administração > Canais de Transmissão); um jogo sem nenhum canal nosso
 * não é operacionalmente relevante pro time acompanhar, então fica de fora
 * da lista inteira, não só sem a tag de canal.
 */
export async function buscarJogosDeHoje(): Promise<JogosDeHoje> {
  const [jogos, sync, canaisPortfolio] = await Promise.all([
    prisma.jogoDoDia.findMany({
      where: { dataBR: dataBR() },
      orderBy: { horario: "asc" },
    }),
    prisma.jogoDoDiaSync.findUnique({ where: { id: "singleton" } }),
    prisma.canalPortfolio.findMany({ where: { ativo: true }, select: { nome: true } }),
  ]);

  const portfolioNormalizado = new Set(canaisPortfolio.map((c) => normalizarNomeCanal(c.nome)));

  const jogosFiltrados = jogos
    .map((j) => ({
      id: j.id,
      sourceId: j.sourceId,
      dataBR: j.dataBR,
      mandante: j.mandante,
      visitante: j.visitante,
      horario: j.horario,
      estadio: j.estadio,
      cidade: j.cidade,
      campeonato: j.campeonato,
      canais: j.canais.filter((canal) => isCanalDoPortfolio(canal, portfolioNormalizado)),
    }))
    .filter((j) => j.canais.length > 0);

  return {
    jogos: jogosFiltrados,
    ultimoSucessoEm: sync?.ultimoSucessoEm ? sync.ultimoSucessoEm.toISOString() : null,
    ultimoErro: sync?.ultimoErro ?? null,
  };
}
