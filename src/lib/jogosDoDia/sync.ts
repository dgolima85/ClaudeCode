import { prisma } from "@/lib/prisma";
import { dataBR } from "@/lib/dataHoraBR";
import { buscarHtmlCentralDeJogos } from "./uol";
import { extrairJogosDoDia } from "./parser";

const SYNC_ID = "singleton";

export type ResultadoSync = { ok: boolean; jogos?: number; error?: string };

/**
 * Busca a Central de Jogos do UOL, extrai os jogos de hoje e substitui o
 * conteúdo da tabela `JogoDoDia` por eles. Chamada pela rotina agendada (ver
 * src/app/api/cron/jogos-do-dia/route.ts) — nunca pelo carregamento da
 * página, pra não depender da velocidade/disponibilidade do UOL na hora que
 * um analista abre a Home.
 *
 * Uma falha (UOL fora do ar, HTML mudou de estrutura, etc.) não apaga os
 * jogos já salvos de uma sincronização anterior bem-sucedida — só grava o
 * erro em JogoDoDiaSync, pro painel continuar mostrando os últimos dados
 * válidos em vez de ficar vazio.
 */
export async function sincronizarJogosDoDia(): Promise<ResultadoSync> {
  const agora = new Date();

  try {
    const html = await buscarHtmlCentralDeJogos();
    const resultado = extrairJogosDoDia(html, dataBR(agora));

    if ("error" in resultado) {
      await prisma.jogoDoDiaSync.upsert({
        where: { id: SYNC_ID },
        create: { id: SYNC_ID, ultimaTentativaEm: agora, ultimoErro: resultado.error },
        update: { ultimaTentativaEm: agora, ultimoErro: resultado.error },
      });
      return { ok: false, error: resultado.error };
    }

    await prisma.$transaction([
      prisma.jogoDoDia.deleteMany({}),
      ...(resultado.jogos.length > 0 ? [prisma.jogoDoDia.createMany({ data: resultado.jogos })] : []),
      prisma.jogoDoDiaSync.upsert({
        where: { id: SYNC_ID },
        create: {
          id: SYNC_ID,
          ultimoSucessoEm: agora,
          ultimaTentativaEm: agora,
          ultimoErro: null,
          jogosEncontrados: resultado.jogos.length,
        },
        update: {
          ultimoSucessoEm: agora,
          ultimaTentativaEm: agora,
          ultimoErro: null,
          jogosEncontrados: resultado.jogos.length,
        },
      }),
    ]);

    return { ok: true, jogos: resultado.jogos.length };
  } catch (e) {
    const mensagem = e instanceof Error ? e.message : "Erro desconhecido ao buscar os jogos.";
    await prisma.jogoDoDiaSync.upsert({
      where: { id: SYNC_ID },
      create: { id: SYNC_ID, ultimaTentativaEm: agora, ultimoErro: mensagem },
      update: { ultimaTentativaEm: agora, ultimoErro: mensagem },
    });
    return { ok: false, error: mensagem };
  }
}
