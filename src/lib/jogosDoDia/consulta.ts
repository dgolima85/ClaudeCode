import { prisma } from "@/lib/prisma";
import { dataBR } from "@/lib/dataHoraBR";

export type JogoDoDiaLinha = {
  id: string;
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

/** Lê os jogos de hoje já sincronizados no banco — nunca busca o UOL ao vivo (ver src/lib/jogosDoDia/sync.ts). */
export async function buscarJogosDeHoje(): Promise<JogosDeHoje> {
  const [jogos, sync] = await Promise.all([
    prisma.jogoDoDia.findMany({
      where: { dataBR: dataBR() },
      orderBy: { horario: "asc" },
    }),
    prisma.jogoDoDiaSync.findUnique({ where: { id: "singleton" } }),
  ]);

  return {
    jogos: jogos.map((j) => ({
      id: j.id,
      mandante: j.mandante,
      visitante: j.visitante,
      horario: j.horario,
      estadio: j.estadio,
      cidade: j.cidade,
      campeonato: j.campeonato,
      canais: j.canais,
    })),
    ultimoSucessoEm: sync?.ultimoSucessoEm ? sync.ultimoSucessoEm.toISOString() : null,
    ultimoErro: sync?.ultimoErro ?? null,
  };
}
