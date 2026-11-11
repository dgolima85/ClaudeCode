import { prisma } from "@/lib/prisma";
import { dataBR, somarDiasBR } from "@/lib/dataHoraBR";
import { buscarHtmlCentralDeJogos } from "./uol";
import { extrairJogosDoDia, type JogoExtraido } from "./parser";

const SYNC_ID = "singleton";

export type ResultadoSync = { ok: boolean; jogos?: number; error?: string };

/**
 * Busca a Central de Jogos do UOL e sincroniza a tabela `JogoDoDia` com os
 * jogos de HOJE e de AMANHÃ (D+1) — não só hoje. Chamada pela rotina
 * agendada (ver src/app/api/cron/jogos-do-dia/route.ts), nunca pelo
 * carregamento da página, pra não depender da velocidade/disponibilidade do
 * UOL na hora que um analista abre a Home.
 *
 * Guardar D+1 com um dia de antecedência é o que faz o quadro "Jogos de
 * Hoje" já nascer alimentado na virada do dia: como a rotina roda só 1x/dia
 * (limite do plano Hobby da Vercel, ver vercel.json), sem isso o painel
 * ficaria vazio desde a meia-noite até o próximo horário agendado.
 *
 * Uma falha (UOL fora do ar, HTML mudou de estrutura, etc.) não apaga os
 * jogos já salvos de uma sincronização anterior bem-sucedida — só grava o
 * erro em JogoDoDiaSync, pro painel continuar mostrando os últimos dados
 * válidos em vez de ficar vazio.
 */
export async function sincronizarJogosDoDia(): Promise<ResultadoSync> {
  const agora = new Date();
  const diaHoje = dataBR(agora);
  const diaAmanha = somarDiasBR(diaHoje, 1);

  try {
    const html = await buscarHtmlCentralDeJogos();

    const resultadoHoje = extrairJogosDoDia(html, diaHoje);
    if ("error" in resultadoHoje) {
      await registrarFalha(agora, resultadoHoje.error);
      return { ok: false, error: resultadoHoje.error };
    }
    const resultadoAmanha = extrairJogosDoDia(html, diaAmanha);
    if ("error" in resultadoAmanha) {
      await registrarFalha(agora, resultadoAmanha.error);
      return { ok: false, error: resultadoAmanha.error };
    }

    const jogos = [...resultadoHoje.jogos, ...resultadoAmanha.jogos];
    await substituirJogosDosDias([diaHoje, diaAmanha], jogos);

    await prisma.jogoDoDiaSync.upsert({
      where: { id: SYNC_ID },
      create: {
        id: SYNC_ID,
        ultimoSucessoEm: agora,
        ultimaTentativaEm: agora,
        ultimoErro: null,
        jogosEncontrados: jogos.length,
      },
      update: {
        ultimoSucessoEm: agora,
        ultimaTentativaEm: agora,
        ultimoErro: null,
        jogosEncontrados: jogos.length,
      },
    });

    return { ok: true, jogos: jogos.length };
  } catch (e) {
    const mensagem = e instanceof Error ? e.message : "Erro desconhecido ao buscar os jogos.";
    await registrarFalha(agora, mensagem);
    return { ok: false, error: mensagem };
  }
}

async function registrarFalha(agora: Date, mensagem: string) {
  await prisma.jogoDoDiaSync.upsert({
    where: { id: SYNC_ID },
    create: { id: SYNC_ID, ultimaTentativaEm: agora, ultimoErro: mensagem },
    update: { ultimaTentativaEm: agora, ultimoErro: mensagem },
  });
}

/**
 * Mantém só o que ainda é relevante (hoje e amanhã) e grava os jogos
 * recém-extraídos desses dois dias — ao contrário da versão antiga (que
 * apagava a tabela inteira a cada sync), isso preserva dias já carregados
 * com antecedência e não derruba o painel por um instante durante a troca.
 */
async function substituirJogosDosDias(diasRelevantes: string[], jogos: JogoExtraido[]) {
  const idsFrescos = jogos.map((j) => j.sourceId);

  await prisma.$transaction([
    // Qualquer coisa de um dia que não é mais hoje nem amanhã (ex.: o jogo
    // de ontem, que a troca do dia tornou irrelevante) sai da tabela.
    prisma.jogoDoDia.deleteMany({ where: { dataBR: { notIn: diasRelevantes } } }),
    // Dentro de hoje/amanhã, remove o que não veio mais na extração atual
    // (jogo adiado/cancelado, por exemplo) — sem isso um upsert sozinho
    // nunca removeria uma partida que deixou de existir na fonte.
    idsFrescos.length > 0
      ? prisma.jogoDoDia.deleteMany({
          where: { dataBR: { in: diasRelevantes }, sourceId: { notIn: idsFrescos } },
        })
      : prisma.jogoDoDia.deleteMany({ where: { dataBR: { in: diasRelevantes } } }),
    ...jogos.map((jogo) =>
      prisma.jogoDoDia.upsert({
        where: { sourceId: jogo.sourceId },
        create: jogo,
        update: jogo,
      }),
    ),
  ]);
}
