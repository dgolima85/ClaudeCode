import { formatarDataHoraBR } from "@/lib/dataHoraBR";
import { STATUS_LABELS, STATUS_DOT_COLOR, type StatusOcorrencia } from "@/lib/status";

export type LinhaResumoExecutivo = {
  id: string;
  status: StatusOcorrencia;
  tipo: string;
  titulo: string;
  ticket: string | null;
  parceriaEmpresa: string | null;
  servico: string | null;
  analista: string;
  createdAt: string;
  resolvidoEm: string | null;
  causa: string;
  solucao: string;
};

type TabelaResumoExecutivoProps = {
  linhas: LinhaResumoExecutivo[];
};

export default function TabelaResumoExecutivo({ linhas }: TabelaResumoExecutivoProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Título</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Status</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Causa</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Solução</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Início</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Fim</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Analista</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Ticket</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Relatório</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {linhas.map((l) => (
            <tr key={l.id}>
              <td className="px-3 py-2">{l.titulo}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                <span className="inline-flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT_COLOR[l.status]}`} />
                  {STATUS_LABELS[l.status]}
                </span>
              </td>
              <td className="px-3 py-2">{l.causa}</td>
              <td className="px-3 py-2">{l.solucao}</td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600 dark:text-gray-400">{formatarDataHoraBR(l.createdAt)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600 dark:text-gray-400">
                {l.resolvidoEm ? formatarDataHoraBR(l.resolvidoEm) : "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600 dark:text-gray-400">{l.analista}</td>
              <td className="px-3 py-2">{l.ticket ?? "—"}</td>
              <td className="whitespace-nowrap px-3 py-2">
                <a
                  href={`/relatorios/executivo/${l.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Baixar PDF
                </a>
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
