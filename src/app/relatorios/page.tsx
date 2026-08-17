import { prisma } from "@/lib/prisma";
import DashboardCharts from "@/components/relatorios/DashboardCharts";
import { STATUS_LABELS, type StatusOcorrencia } from "@/lib/status";
import { dataBR } from "@/lib/dataHoraBR";

export default async function RelatoriosDashboardPage() {
  const ocorrencias = await prisma.ocorrencia.findMany({
    include: { tipo: true, analista: true },
    orderBy: { createdAt: "asc" },
  });

  const porTipo = new Map<string, number>();
  const porStatus = new Map<string, number>();
  const porAnalista = new Map<string, number>();
  const porDia = new Map<string, number>();
  let somaResolucaoMs = 0;
  let countResolvidas = 0;

  for (const o of ocorrencias) {
    porTipo.set(o.tipo.nome, (porTipo.get(o.tipo.nome) ?? 0) + 1);
    porStatus.set(o.status, (porStatus.get(o.status) ?? 0) + 1);
    porAnalista.set(o.analista.nome, (porAnalista.get(o.analista.nome) ?? 0) + 1);

    const dia = dataBR(o.createdAt);
    porDia.set(dia, (porDia.get(dia) ?? 0) + 1);

    if (o.resolvidoEm) {
      somaResolucaoMs += o.resolvidoEm.getTime() - o.createdAt.getTime();
      countResolvidas += 1;
    }
  }

  const tempoMedioResolucaoMinutos =
    countResolvidas > 0 ? Math.round(somaResolucaoMs / countResolvidas / 60000) : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Visão geral das ocorrências registradas.</p>
      </div>

      <DashboardCharts
        porTipo={[...porTipo.entries()].map(([nome, total]) => ({ nome, total }))}
        porStatus={(Object.keys(STATUS_LABELS) as StatusOcorrencia[]).map((status) => ({
          status,
          label: STATUS_LABELS[status],
          total: porStatus.get(status) ?? 0,
        }))}
        porAnalista={[...porAnalista.entries()].map(([nome, total]) => ({ nome, total }))}
        porDia={[...porDia.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([dia, total]) => ({ dia, total }))}
        totalOcorrencias={ocorrencias.length}
        tempoMedioResolucaoMinutos={tempoMedioResolucaoMinutos}
      />
    </div>
  );
}
