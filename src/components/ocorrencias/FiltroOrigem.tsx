"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FILTROS_ORIGEM, ORIGEM_FILTRO_LABELS, type FiltroOrigemValor } from "@/lib/origemFiltro";

type FiltroOrigemProps = {
  origemSelecionada: FiltroOrigemValor[];
};

const CLASSE_BOTAO_ATIVO = "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500";
const CLASSE_BOTAO_INATIVO =
  "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800";

function mesmosValores<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((v) => setB.has(v));
}

export default function FiltroOrigem({ origemSelecionada }: FiltroOrigemProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado local otimista: o clique atualiza a UI na hora, sem esperar o
  // round-trip do servidor. Sem isso, dois cliques em sequência rápida (ou
  // com alguma latência de rede) calculavam o próximo estado em cima da
  // prop antiga (a resposta do clique anterior ainda não tinha voltado),
  // gerando resultado errado e sem padrão fixo — exatamente o
  // comportamento relatado.
  const [propAnterior, setPropAnterior] = useState(origemSelecionada);
  const [selecaoLocal, setSelecaoLocal] = useState(origemSelecionada);

  // Sincroniza quando a URL muda por fora (voltar/avançar do navegador,
  // link direto, etc.) — comparado por valor, não por referência, já que
  // o array vem novo a cada render do Server Component.
  if (!mesmosValores(origemSelecionada, propAnterior)) {
    setPropAnterior(origemSelecionada);
    setSelecaoLocal(origemSelecionada);
  }

  // "Todas as Origens" é o estado sem restrição: nada selecionado, ou os
  // dois valores selecionados ao mesmo tempo (o que dá no mesmo resultado).
  const todasAtivo = selecaoLocal.length === 0 || selecaoLocal.length === FILTROS_ORIGEM.length;

  function aplicar(nova: FiltroOrigemValor[]) {
    setSelecaoLocal(nova);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("origem");
    for (const o of nova) params.append("origem", o);
    router.push(`${pathname}?${params.toString()}`);
  }

  function alternar(valor: FiltroOrigemValor) {
    const atuais = new Set(selecaoLocal);
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
        const ativo = !todasAtivo && selecaoLocal.includes(valor);
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
