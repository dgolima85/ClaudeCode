import { getAnalistaLogado } from "@/lib/session";
import PassagemTurnoResumo from "@/components/relatorios/PassagemTurnoResumo";
import ExportPdfButton from "@/components/relatorios/ExportPdfButton";
import FiltroOrigemPassagemTurno from "@/components/passagemTurno/FiltroOrigemPassagemTurno";
import { TURNOS, TURNO_LABELS, isTurno, diaInicioTurnoAtual, type Turno } from "@/lib/turno";
import { buscarDadosPassagemTurno } from "@/lib/passagemTurno";
import { isOrigemPassagemTurno, type OrigemPassagemTurno } from "@/lib/origemPassagemTurno";
import type { StatusOcorrencia } from "@/lib/status";
import { isCriticidade } from "@/lib/criticidade";
import type { LinhaRelatorio } from "@/components/relatorios/TabelaOcorrenciasFiltravel";

export default async function PassagemTurnoPage({
  searchParams,
}: {
  searchParams: Promise<{ turno?: string; data?: string; origem?: string }>;
}) {
  const sp = await searchParams;
  const analistaLogado = await getAnalistaLogado();

  const turnoSelecionado: Turno =
    sp.turno && isTurno(sp.turno) ? sp.turno : ((analistaLogado?.turno as Turno) ?? "MANHA");
  const dataSelecionada = sp.data || diaInicioTurnoAtual(turnoSelecionado);
  const origemSelecionada: OrigemPassagemTurno | null =
    sp.origem && isOrigemPassagemTurno(sp.origem) ? sp.origem : null;

  const dados = origemSelecionada
    ? await buscarDadosPassagemTurno(turnoSelecionado, dataSelecionada, origemSelecionada)
    : null;

  function mapLinha(o: NonNullable<typeof dados>["emAberto"][number]): LinhaRelatorio {
    return {
      id: o.id,
      status: o.status as StatusOcorrencia,
      criticidade: o.criticidade && isCriticidade(o.criticidade) ? o.criticidade : null,
      titulo: o.titulo,
      ticket: o.ticket,
      createdAt: o.createdAt.toISOString(),
      resolvidoEm: o.resolvidoEm ? o.resolvidoEm.toISOString() : null,
      tipo: o.tipo.nome,
      analista: o.analista.nome,
      turno: o.analista.turno as Turno,
    };
  }

  const querystring = `turno=${turnoSelecionado}&data=${dataSelecionada}&origem=${origemSelecionada ?? ""}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Passagem de Turno</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Resumo para repasse entre turnos: ocorrências em aberto e atividade do período selecionado.
            Monitoria APP e Demais Origens são boletins separados.
          </p>
        </div>
        <div className="flex gap-2">
          <ExportPdfButton
            href={`/relatorios/passagem-turno/imagem?${querystring}`}
            label="Baixar imagem"
            disabled={!origemSelecionada}
          />
          <ExportPdfButton href={`/relatorios/passagem-turno/pdf?${querystring}`} disabled={!origemSelecionada} />
        </div>
      </div>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
      >
        <input type="hidden" name="origem" value={origemSelecionada ?? ""} />
        <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
          Turno
          <select
            name="turno"
            defaultValue={turnoSelecionado}
            className="rounded border border-gray-300 bg-transparent px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
          >
            {TURNOS.map((t) => (
              <option key={t} value={t}>
                {TURNO_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
          Data
          <input
            type="date"
            name="data"
            defaultValue={dataSelecionada}
            className="rounded border border-gray-300 bg-transparent px-2 py-1 text-sm dark:border-gray-600 dark:text-gray-100"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Atualizar
        </button>
      </form>

      <FiltroOrigemPassagemTurno origemSelecionada={origemSelecionada} />

      {dados ? (
        <PassagemTurnoResumo emAberto={dados.emAberto.map(mapLinha)} atividade={dados.atividade.map(mapLinha)} />
      ) : (
        <p className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          Selecione acima a origem do boletim de passagem de turno para ver o resumo e liberar o download.
        </p>
      )}
    </div>
  );
}
