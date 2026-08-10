import { formatarDataHoraBR } from "@/lib/dataHoraBR";
import { STATUS_LABELS, STATUS_DOT_COLOR, type StatusOcorrencia } from "@/lib/status";
import { TURNO_LABELS, type Turno } from "@/lib/turno";

export type LinhaRelatorio = {
  id: string;
  status: StatusOcorrencia;
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
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Tipo</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Status</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Início</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Fim</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Analista</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Turno</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Ocorrência</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Ticket</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {linhas.map((l) => (
            <tr key={l.id}>
              <td className="px-3 py-2">{l.tipo}</td>
              <td className="px-3 py-2">
                <span className="inline-flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT_COLOR[l.status]}`} />
                  {STATUS_LABELS[l.status]}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                {formatarDataHoraBR(l.createdAt)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                {l.resolvidoEm ? formatarDataHoraBR(l.resolvidoEm) : "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600">{l.analista}</td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600">{TURNO_LABELS[l.turno]}</td>
              <td className="px-3 py-2">{l.titulo}</td>
              <td className="px-3 py-2">{l.ticket ?? "—"}</td>
            </tr>
          ))}
          {linhas.length === 0 && (
            <tr>
              <td colSpan={8} className="px-3 py-6 text-center text-gray-400">
                Nenhuma ocorrência encontrada para os filtros selecionados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
