import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getAnalistaLogado } from "@/lib/session";
import PassagemTurnoResumo from "@/components/relatorios/PassagemTurnoResumo";
import { TURNOS, TURNO_LABELS, isTurno, type Turno } from "@/lib/turno";
import type { StatusOcorrencia } from "@/lib/status";
import type { LinhaRelatorio } from "@/components/relatorios/TabelaOcorrenciasFiltravel";

export default async function PassagemTurnoPage({
  searchParams,
}: {
  searchParams: Promise<{ turno?: string; data?: string }>;
}) {
  const sp = await searchParams;
  const analistaLogado = await getAnalistaLogado();

  const turnoSelecionado: Turno =
    sp.turno && isTurno(sp.turno) ? sp.turno : ((analistaLogado?.turno as Turno) ?? "MANHA");
  const dataSelecionada = sp.data || format(new Date(), "yyyy-MM-dd");

  const inicio = new Date(`${dataSelecionada}T00:00:00`);
  const fim = new Date(`${dataSelecionada}T23:59:59`);

  const [emAberto, atividade] = await Promise.all([
    prisma.ocorrencia.findMany({
      where: { status: { not: "RESOLVIDO" } },
      include: { tipo: true, analista: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.ocorrencia.findMany({
      where: {
        analista: { turno: turnoSelecionado },
        OR: [
          { createdAt: { gte: inicio, lte: fim } },
          { updatedAt: { gte: inicio, lte: fim } },
          { eventos: { some: { createdAt: { gte: inicio, lte: fim } } } },
        ],
      },
      include: { tipo: true, analista: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  function mapLinha(o: (typeof emAberto)[number]): LinhaRelatorio {
    return {
      id: o.id,
      status: o.status as StatusOcorrencia,
      titulo: o.titulo,
      ticket: o.ticket,
      createdAt: o.createdAt.toISOString(),
      tipo: o.tipo.nome,
      analista: o.analista.nome,
      turno: o.analista.turno as Turno,
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Passagem de Turno</h1>
        <p className="text-sm text-gray-500">
          Resumo para repasse entre turnos: ocorrências em aberto e atividade do período selecionado.
        </p>
      </div>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4"
      >
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          Turno
          <select
            name="turno"
            defaultValue={turnoSelecionado}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            {TURNOS.map((t) => (
              <option key={t} value={t}>
                {TURNO_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          Data
          <input
            type="date"
            name="data"
            defaultValue={dataSelecionada}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Atualizar
        </button>
      </form>

      <PassagemTurnoResumo emAberto={emAberto.map(mapLinha)} atividade={atividade.map(mapLinha)} />
    </div>
  );
}
