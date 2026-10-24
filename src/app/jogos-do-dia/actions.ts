"use server";

import { prisma } from "@/lib/prisma";
import { exigirAnalistaLogado } from "@/lib/session";
import { dataBR } from "@/lib/dataHoraBR";

export type AcompanhamentoCanal = {
  canal: string;
  foraDoPortfolio: boolean;
  testadoValidado: boolean;
  somEImagem: string;
  delayClaro: string;
  relatorioPosJogo: string;
  atualizadoEm: string;
};

/** Acompanhamento já salvo pra um jogo (uma linha por canal de transmissão). */
export async function buscarAcompanhamentoJogo(jogoSourceId: number): Promise<AcompanhamentoCanal[]> {
  await exigirAnalistaLogado();

  const linhas = await prisma.jogoDoDiaAcompanhamento.findMany({
    where: { jogoSourceId },
  });

  return linhas.map((l) => ({
    canal: l.canal,
    foraDoPortfolio: l.foraDoPortfolio,
    testadoValidado: l.testadoValidado,
    somEImagem: l.somEImagem ?? "",
    delayClaro: l.delayClaro ?? "",
    relatorioPosJogo: l.relatorioPosJogo ?? "",
    atualizadoEm: l.atualizadoEm.toISOString(),
  }));
}

type ContextoJogo = {
  dataBR: string;
  mandante: string;
  visitante: string;
  campeonato: string;
};

type PatchAcompanhamento = Partial<{
  foraDoPortfolio: boolean;
  testadoValidado: boolean;
  somEImagem: string;
  delayClaro: string;
  relatorioPosJogo: string;
}>;

/**
 * Salva (cria ou atualiza) o acompanhamento de um canal de um jogo. Chamado
 * a cada campo alterado (checkbox marcado, texto salvo ao sair do campo) —
 * ver src/components/jogosDoDia/JogoDetalheModal.tsx.
 */
export async function salvarAcompanhamentoCanal(
  jogoSourceId: number,
  canal: string,
  contexto: ContextoJogo,
  patch: PatchAcompanhamento,
): Promise<{ error?: string }> {
  const analista = await exigirAnalistaLogado();

  // O painel só lista jogos do dia vigente, mas essa trava evita que uma
  // aba aberta desde antes da virada do dia continue salvando depois que o
  // jogo já não é mais "de hoje".
  if (contexto.dataBR !== dataBR()) {
    return { error: "Esse jogo não é mais do dia vigente — não é possível editar." };
  }

  await prisma.jogoDoDiaAcompanhamento.upsert({
    where: { jogoSourceId_canal: { jogoSourceId, canal } },
    create: {
      jogoSourceId,
      canal,
      dataBR: contexto.dataBR,
      mandante: contexto.mandante,
      visitante: contexto.visitante,
      campeonato: contexto.campeonato,
      foraDoPortfolio: patch.foraDoPortfolio ?? false,
      testadoValidado: patch.testadoValidado ?? false,
      somEImagem: patch.somEImagem ?? null,
      delayClaro: patch.delayClaro ?? null,
      relatorioPosJogo: patch.relatorioPosJogo ?? null,
      atualizadoPorId: analista.id,
    },
    update: {
      ...patch,
      atualizadoPorId: analista.id,
    },
  });

  return {};
}
