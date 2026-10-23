"use client";

import { useTransition } from "react";
import { formatarDataBR } from "@/lib/dataHoraBR";
import { resetarDesvioOperacional } from "@/app/desvio-operacional/actions";

type DesvioOperacionalPanelProps = {
  dias: number;
  recorde: number;
  ultimoDesvioEm: string;
};

function plural(n: number): string {
  return n === 1 ? "dia" : "dias";
}

export default function DesvioOperacionalPanel({ dias, recorde, ultimoDesvioEm }: DesvioOperacionalPanelProps) {
  const [pending, startTransition] = useTransition();

  function resetar() {
    if (!confirm("Deseja realmente resetar o indicador de Desvio Operacional?")) return;
    startTransition(() => {
      resetarDesvioOperacional();
    });
  }

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

      <button
        type="button"
        disabled={pending}
        onClick={resetar}
        className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
      >
        Resetar
      </button>
    </div>
  );
}
