import { formatarDataHoraBR } from "@/lib/dataHoraBR";

export type LinhaResumoExecutivo = {
  id: string;
  tipo: string;
  titulo: string;
  ticket: string | null;
  parceriaEmpresa: string | null;
  ambiente: string | null;
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
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Ocorrência</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Tipo</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Parceria / Empresa</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Causa</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Solução</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Início</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Fim</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Analista</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Ticket</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Relatório</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {linhas.map((l) => (
            <tr key={l.id}>
              <td className="px-3 py-2">{l.titulo}</td>
              <td className="px-3 py-2 whitespace-nowrap">{l.tipo}</td>
              <td className="px-3 py-2 whitespace-nowrap">{l.parceriaEmpresa ?? "—"}</td>
              <td className="px-3 py-2">{l.causa}</td>
              <td className="px-3 py-2">{l.solucao}</td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600">{formatarDataHoraBR(l.createdAt)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                {l.resolvidoEm ? formatarDataHoraBR(l.resolvidoEm) : "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600">{l.analista}</td>
              <td className="px-3 py-2">{l.ticket ?? "—"}</td>
              <td className="whitespace-nowrap px-3 py-2">
                <a
                  href={`/relatorios/executivo/${l.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Baixar PDF
                </a>
              </td>
            </tr>
          ))}
          {linhas.length === 0 && (
            <tr>
              <td colSpan={10} className="px-3 py-6 text-center text-gray-400">
                Nenhuma ocorrência normalizada encontrada para os filtros selecionados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
