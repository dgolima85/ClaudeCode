"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { STATUS_OCORRENCIA, STATUS_LABELS, type StatusOcorrencia } from "@/lib/status";

type FiltroStatusProps = {
  statusSelecionados: StatusOcorrencia[];
  filtroAlteradoPeloUsuario?: boolean;
};

export default function FiltroStatus({
  statusSelecionados,
  filtroAlteradoPeloUsuario = true,
}: FiltroStatusProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function alternar(status: StatusOcorrencia) {
    const atuais = new Set(statusSelecionados);
    if (atuais.has(status)) atuais.delete(status);
    else atuais.add(status);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    for (const s of atuais) params.append("status", s);

    router.push(`${pathname}?${params.toString()}`);
  }

  function limpar() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filtrar por status:</span>
      {STATUS_OCORRENCIA.map((status) => {
        const ativo = statusSelecionados.includes(status);
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
      {filtroAlteradoPeloUsuario && statusSelecionados.length > 0 && (
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
