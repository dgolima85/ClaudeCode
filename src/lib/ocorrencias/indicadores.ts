import { prisma } from "@/lib/prisma";
import { STATUS_OCORRENCIA, isStatusOcorrencia, type StatusOcorrencia } from "@/lib/status";
import type { FILTRO_TIPO_MONITORIA_APP, FILTRO_TIPO_DEMAIS_ORIGENS } from "@/lib/monitoriaApp";
import type { IndicadoresOcorrencias } from "@/components/ocorrencias/IndicadoresOcorrenciasPanel";

// Extraído da home "Ocorrências Ongoing" quando o quadro de indicadores foi
// substituído pelo de "Jogos de Hoje" (ver src/app/page.tsx) — a lógica
// fica guardada aqui, pronta pra ser reaproveitada em outro lugar (ex.: um
// futuro dashboard/relatório), sem precisar recalcular do zero. O
// componente que exibe esse resultado (IndicadoresOcorrenciasPanel)
// continua em uso normalmente na home "Ocorrências Qualidade App".
export async function buscarIndicadoresOcorrencias(
  filtroTipo: typeof FILTRO_TIPO_MONITORIA_APP | typeof FILTRO_TIPO_DEMAIS_ORIGENS,
): Promise<IndicadoresOcorrencias> {
  const [statusCounts, origemCounts, todosOsTipos, ocorrenciasEmAbertoResumo] = await Promise.all([
    prisma.ocorrencia.groupBy({
      by: ["status"],
      where: { tipo: filtroTipo },
      _count: { _all: true },
    }),
    prisma.ocorrencia.groupBy({
      by: ["tipoId"],
      where: { status: { not: "RESOLVIDO" }, tipo: filtroTipo },
      _count: { _all: true },
    }),
    prisma.tipoOcorrencia.findMany({ select: { id: true, nome: true } }),
    prisma.ocorrencia.findMany({
      where: { status: { not: "RESOLVIDO" }, tipo: filtroTipo },
      select: { createdAt: true, ticket: true },
    }),
  ]);

  const porStatus = Object.fromEntries(
    STATUS_OCORRENCIA.map((status) => [status, 0]),
  ) as Record<StatusOcorrencia, number>;
  for (const c of statusCounts) {
    if (isStatusOcorrencia(c.status)) porStatus[c.status] = c._count._all;
  }
  const emAberto = porStatus.EM_ANDAMENTO + porStatus.AGUARDANDO_VALIDACAO + porStatus.PENDENTE_CAUSA;

  const nomeTipoPorId = new Map(todosOsTipos.map((t) => [t.id, t.nome]));
  const porOrigem = origemCounts
    .map((c) => ({ nome: nomeTipoPorId.get(c.tipoId) ?? "—", quantidade: c._count._all }))
    .sort((a, b) => b.quantidade - a.quantidade);

  const agora = new Date().getTime();
  const idade = { ateTresDias: 0, quatroASeteDias: 0, maisDeUmaSemana: 0 };
  let semTicket = 0;
  let maisAntigaDias: number | null = null;
  for (const o of ocorrenciasEmAbertoResumo) {
    const dias = Math.floor((agora - o.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (dias <= 3) idade.ateTresDias += 1;
    else if (dias <= 7) idade.quatroASeteDias += 1;
    else idade.maisDeUmaSemana += 1;
    if (!o.ticket) semTicket += 1;
    if (maisAntigaDias === null || dias > maisAntigaDias) maisAntigaDias = dias;
  }

  return { emAberto, porStatus, porOrigem, idade, semTicket, maisAntigaDias };
}
