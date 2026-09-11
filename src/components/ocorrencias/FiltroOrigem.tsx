"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { FILTROS_ORIGEM, ORIGEM_FILTRO_LABELS, type FiltroOrigemValor } from "@/lib/origemFiltro";

type FiltroOrigemProps = {
  origemSelecionada: FiltroOrigemValor | null;
};

const CLASSE_BOTAO_ATIVO = "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500";
const CLASSE_BOTAO_INATIVO =
  "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800";

export default function FiltroOrigem({ origemSelecionada }: FiltroOrigemProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function selecionar(valor: FiltroOrigemValor | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) params.set("origem", valor);
    else params.delete("origem");
    // Navegação "dura" (recarrega a página) em vez de client-side router:
    // navegações client-side que só trocam querystring na mesma rota, indo
    // e voltando rápido entre as mesmas 2-3 URLs, faziam o Next.js
    // reaproveitar dados de uma navegação anterior por engano — a tabela
    // ficava com um resultado errado mesmo o servidor sempre respondendo
    // certo (confirmado testando: cada resposta chegava correta, só a
    // aplicação delas na tela é que embaralhava). Recarregar de verdade
    // garante que a tabela nunca fica desatualizada.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- ver comentário acima: é proposital, não um descuido.
    window.location.assign(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filtrar por origem:</span>
      <button
        type="button"
        onClick={() => selecionar(null)}
        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
          origemSelecionada === null ? CLASSE_BOTAO_ATIVO : CLASSE_BOTAO_INATIVO
        }`}
      >
        Todas as Origens
      </button>
      {FILTROS_ORIGEM.map((valor) => (
        <button
          key={valor}
          type="button"
          onClick={() => selecionar(valor)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            origemSelecionada === valor ? CLASSE_BOTAO_ATIVO : CLASSE_BOTAO_INATIVO
          }`}
        >
          {ORIGEM_FILTRO_LABELS[valor]}
        </button>
      ))}
    </div>
  );
}
