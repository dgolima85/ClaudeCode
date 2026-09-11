"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { STATUS_OCORRENCIA, STATUS_LABELS, type StatusOcorrencia } from "@/lib/status";

type FiltroStatusProps = {
  statusSelecionados: StatusOcorrencia[];
  filtroAlteradoPeloUsuario?: boolean;
};

function mesmosValores<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((v) => setB.has(v));
}

export default function FiltroStatus({
  statusSelecionados,
  filtroAlteradoPeloUsuario = true,
}: FiltroStatusProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado local otimista: o clique atualiza a UI na hora, sem esperar o
  // round-trip do servidor. Sem isso, dois cliques em sequência rápida (ou
  // com alguma latência de rede) calculavam o próximo estado em cima da
  // prop antiga (a resposta do clique anterior ainda não tinha voltado),
  // gerando um resultado errado e sem padrão fixo.
  const [propAnterior, setPropAnterior] = useState(statusSelecionados);
  const [selecaoLocal, setSelecaoLocal] = useState(statusSelecionados);

  // Sincroniza quando a URL muda por fora (voltar/avançar do navegador,
  // link direto, etc.) — comparado por valor, não por referência, já que
  // o array vem novo a cada render do Server Component.
  if (!mesmosValores(statusSelecionados, propAnterior)) {
    setPropAnterior(statusSelecionados);
    setSelecaoLocal(statusSelecionados);
  }

  function alternar(status: StatusOcorrencia) {
    const atuais = new Set(selecaoLocal);
    if (atuais.has(status)) atuais.delete(status);
    else atuais.add(status);
    const nova = [...atuais];
    setSelecaoLocal(nova);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    for (const s of nova) params.append("status", s);

    router.push(`${pathname}?${params.toString()}`);
  }

  function limpar() {
    setSelecaoLocal([]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filtrar por status:</span>
      {STATUS_OCORRENCIA.map((status) => {
        const ativo = selecaoLocal.includes(status);
        return (
          <button
            key={status}
            type="button"
            onClick={() => alternar(status)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              ativo
                ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500"
                : "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            {STATUS_LABELS[status]}
          </button>
        );
      })}
      {filtroAlteradoPeloUsuario && selecaoLocal.length > 0 && (
        <button
          type="button"
          onClick={limpar}
          className="text-xs text-gray-400 hover:text-gray-600 hover:underline dark:text-gray-500 dark:hover:text-gray-300"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
