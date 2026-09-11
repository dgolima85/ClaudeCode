"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FILTROS_ORIGEM, ORIGEM_FILTRO_LABELS, type FiltroOrigemValor } from "@/lib/origemFiltro";

type FiltroOrigemProps = {
  origemSelecionada: FiltroOrigemValor[];
};

const CLASSE_BOTAO_ATIVO = "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500";
const CLASSE_BOTAO_INATIVO =
  "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800";

export default function FiltroOrigem({ origemSelecionada }: FiltroOrigemProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // "Todas as Origens" é o estado sem restrição: nada selecionado, ou os
  // dois valores selecionados ao mesmo tempo (o que dá no mesmo resultado).
  const todasAtivo = origemSelecionada.length === 0 || origemSelecionada.length === FILTROS_ORIGEM.length;

  function aplicar(nova: FiltroOrigemValor[]) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("origem");
    for (const o of nova) params.append("origem", o);
    router.push(`${pathname}?${params.toString()}`);
  }

  function alternar(valor: FiltroOrigemValor) {
    const atuais = new Set(origemSelecionada);
    if (atuais.has(valor)) atuais.delete(valor);
    else atuais.add(valor);
    aplicar([...atuais]);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filtrar por origem:</span>
      <button
        type="button"
        onClick={() => aplicar([])}
        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
          todasAtivo ? CLASSE_BOTAO_ATIVO : CLASSE_BOTAO_INATIVO
        }`}
      >
        Todas as Origens
      </button>
      {FILTROS_ORIGEM.map((valor) => {
        const ativo = !todasAtivo && origemSelecionada.includes(valor);
        return (
          <button
            key={valor}
            type="button"
            onClick={() => alternar(valor)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              ativo ? CLASSE_BOTAO_ATIVO : CLASSE_BOTAO_INATIVO
            }`}
          >
            {ORIGEM_FILTRO_LABELS[valor]}
          </button>
        );
      })}
    </div>
  );
}
