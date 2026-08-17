import Link from "next/link";
import { formatarDataHoraBR } from "@/lib/dataHoraBR";
import { TURNO_LABELS } from "@/lib/turno";
import {
  STATUS_PASSAGEM_TURNO_LABELS,
  STATUS_PASSAGEM_TURNO_DOT_COLOR,
} from "@/lib/statusPassagemTurno";
import type { PassagemTurnoLinha } from "@/app/passagem-turno/actions";

type TabelaPassagensTurnoProps = {
  linhas: PassagemTurnoLinha[];
};

export default function TabelaPassagensTurno({ linhas }: TabelaPassagensTurnoProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Turno</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Status</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Entregue por</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Recebido por</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Criada em</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Confirmada em</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {linhas.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/70">
              <td className="whitespace-nowrap px-3 py-2">
                <Link href={`/passagem-turno/${p.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                  {TURNO_LABELS[p.turnoOrigem]} → {TURNO_LABELS[p.turnoDestino]}
                </Link>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <span className="inline-flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${STATUS_PASSAGEM_TURNO_DOT_COLOR[p.status]}`} />
                  {STATUS_PASSAGEM_TURNO_LABELS[p.status]}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600 dark:text-gray-400">
                {p.analistaEntrega}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600 dark:text-gray-400">
                {p.analistaRecebe ?? "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600 dark:text-gray-400">
                {formatarDataHoraBR(p.createdAt)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600 dark:text-gray-400">
                {p.confirmadaEm ? formatarDataHoraBR(p.confirmadaEm) : "—"}
              </td>
            </tr>
          ))}
          {linhas.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-gray-400 dark:text-gray-500">
                Nenhuma passagem de turno registrada ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
