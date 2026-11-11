import { formatarDataHoraBR } from "@/lib/dataHoraBR";
import { STATUS_LABELS, STATUS_DOT_COLOR, type StatusOcorrencia } from "@/lib/status";
import { CRITICIDADE_LABELS, CRITICIDADE_TEXT_COLOR, type Criticidade } from "@/lib/criticidade";
import { TURNO_LABELS, type Turno } from "@/lib/turno";
import { IconeCriticidade } from "@/components/ocorrencias/icones";

export type LinhaRelatorio = {
  id: string;
  status: StatusOcorrencia;
  criticidade: Criticidade | null;
  titulo: string;
  ticket: string | null;
  createdAt: string;
  resolvidoEm?: string | null;
  tipo: string;
  analista: string;
  turno: Turno;
};

type TabelaOcorrenciasFiltravelProps = {
  linhas: LinhaRelatorio[];
};

export default function TabelaOcorrenciasFiltravel({ linhas }: TabelaOcorrenciasFiltravelProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Origem</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Criticidade</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Status</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Início</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Fim</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Analista</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Turno</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Título</th>
            <th className="w-40 px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Ticket</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {linhas.map((l) => (
            <tr key={l.id}>
              <td className="px-3 py-2">{l.tipo}</td>
              <td className="px-3 py-2">
                {l.criticidade ? (
                  <span
                    className={`inline-flex items-center gap-1.5 ${CRITICIDADE_TEXT_COLOR[l.criticidade]}`}
                  >
                    <IconeCriticidade className="h-3.5 w-3.5 shrink-0" />
                    {CRITICIDADE_LABELS[l.criticidade]}
                  </span>
                ) : (
                  <span className="text-gray-300 dark:text-gray-600">—</span>
                )}
              </td>
              <td className="px-3 py-2">
                <span className="inline-flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT_COLOR[l.status]}`} />
                  {STATUS_LABELS[l.status]}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600 dark:text-gray-400">
                {formatarDataHoraBR(l.createdAt)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600 dark:text-gray-400">
                {l.resolvidoEm ? formatarDataHoraBR(l.resolvidoEm) : "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600 dark:text-gray-400">{l.analista}</td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600 dark:text-gray-400">{TURNO_LABELS[l.turno]}</td>
              <td className="px-3 py-2">{l.titulo}</td>
              <td className="max-w-40 truncate px-3 py-2" title={l.ticket ?? undefined}>
                {l.ticket ?? "—"}
              </td>
            </tr>
          ))}
          {linhas.length === 0 && (
            <tr>
              <td colSpan={9} className="px-3 py-6 text-center text-gray-400 dark:text-gray-500">
                Nenhuma ocorrência encontrada para os filtros selecionados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
