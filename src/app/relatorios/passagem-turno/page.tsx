import { getAnalistaLogado } from "@/lib/session";
import PassagemTurnoResumo from "@/components/relatorios/PassagemTurnoResumo";
import ExportPdfButton from "@/components/relatorios/ExportPdfButton";
import { TURNOS, TURNO_LABELS, isTurno, type Turno } from "@/lib/turno";
import { dataBR } from "@/lib/dataHoraBR";
import { buscarDadosPassagemTurno } from "@/lib/passagemTurno";
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
  const dataSelecionada = sp.data || dataBR();

  const { emAberto, atividade } = await buscarDadosPassagemTurno(turnoSelecionado, dataSelecionada);

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Passagem de Turno</h1>
          <p className="text-sm text-gray-500">
            Resumo para repasse entre turnos: ocorrências em aberto e atividade do período selecionado.
          </p>
        </div>
        <ExportPdfButton
          href={`/relatorios/passagem-turno/pdf?turno=${turnoSelecionado}&data=${dataSelecionada}`}
        />
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
