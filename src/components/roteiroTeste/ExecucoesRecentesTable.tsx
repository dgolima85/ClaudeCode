"use client";

import { formatarDataHoraBR } from "@/lib/dataHoraBR";
import { ROTINA_TESTE_LABELS } from "@/lib/roteiroTeste/rotinas";
import type { ExecucaoRoteiroTesteLinha } from "@/app/roteiro-testes/actions";

type ExecucoesRecentesTableProps = {
  execucoes: ExecucaoRoteiroTesteLinha[];
  onSelecionar: (id: string) => void;
};

export default function ExecucoesRecentesTable({ execucoes, onSelecionar }: ExecucoesRecentesTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Rotina</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Brand</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Versão</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Analista</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Data</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Resultado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {execucoes.map((e) => (
            <tr
              key={e.id}
              onClick={() => onSelecionar(e.id)}
              className="cursor-pointer hover:bg-gray-50/70 dark:hover:bg-gray-800/70"
            >
              <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">
                {ROTINA_TESTE_LABELS[e.rotina]}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600 dark:text-gray-400">{e.brand}</td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600 dark:text-gray-400">{e.versao}</td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600 dark:text-gray-400">{e.analista}</td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-600 dark:text-gray-400">
                {formatarDataHoraBR(e.createdAt)}
              </td>
              <td className="whitespace-nowrap px-3 py-2">
                {e.totalFalhas > 0 ? (
                  <span className="text-red-600 dark:text-red-400">{e.totalFalhas} falha(s)</span>
                ) : e.totalObservacao > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400">{e.totalObservacao} em observação</span>
                ) : (
                  <span className="text-green-600 dark:text-green-400">Tudo validado</span>
                )}
              </td>
            </tr>
          ))}
          {execucoes.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-gray-400 dark:text-gray-500">
                Nenhuma execução registrada ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
