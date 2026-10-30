"use client";

import { useState } from "react";
import { formatarDataBR } from "@/lib/dataHoraBR";
import ResetarDesvioModal from "./ResetarDesvioModal";
import HistoricoDesvioModal from "./HistoricoDesvioModal";

type DesvioOperacionalPanelProps = {
  dias: number;
  recorde: number;
  ultimoDesvioEm: string;
};

function plural(n: number): string {
  return n === 1 ? "dia" : "dias";
}

export default function DesvioOperacionalPanel({ dias, recorde, ultimoDesvioEm }: DesvioOperacionalPanelProps) {
  const [resetarAberto, setResetarAberto] = useState(false);
  const [historicoAberto, setHistoricoAberto] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dias}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{plural(dias)} sem Desvio Operacional</span>
      </div>

      <div className="flex flex-col gap-0.5 text-xs text-gray-500 dark:text-gray-400">
        <span>
          Nosso recorde é de {recorde} {plural(recorde)}
        </span>
        <span>Último desvio em {formatarDataBR(ultimoDesvioEm)}</span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setHistoricoAberto(true)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Histórico
        </button>
        <button
          type="button"
          onClick={() => setResetarAberto(true)}
          className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
        >
          Resetar
        </button>
      </div>

      {resetarAberto && <ResetarDesvioModal onClose={() => setResetarAberto(false)} />}
      {historicoAberto && <HistoricoDesvioModal onClose={() => setHistoricoAberto(false)} />}
    </div>
  );
}
