"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { STATUS_OCORRENCIA, STATUS_LABELS, type StatusOcorrencia } from "@/lib/status";

type FiltroStatusProps = {
  statusSelecionados: StatusOcorrencia[];
};

export default function FiltroStatus({ statusSelecionados }: FiltroStatusProps) {
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
      <span className="text-sm font-medium text-gray-600">Filtrar por status:</span>
      {STATUS_OCORRENCIA.map((status) => {
        const ativo = statusSelecionados.includes(status);
        return (
          <button
            key={status}
            type="button"
            onClick={() => alternar(status)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              ativo
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {STATUS_LABELS[status]}
          </button>
        );
      })}
      {statusSelecionados.length > 0 && (
        <button
          type="button"
          onClick={limpar}
          className="text-xs text-gray-400 hover:text-gray-600 hover:underline"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
