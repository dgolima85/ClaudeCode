"use client";

import { useTransition } from "react";
import { formatarTamanhoArquivo } from "@/lib/evidencias";
import { excluirEvidencia } from "@/app/ocorrencias/evidencias-actions";

export type Evidencia = {
  id: string;
  nomeArquivo: string;
  tipo: string;
  tamanhoBytes: number;
  url: string;
  createdAt: string;
  analista: { id: string; nome: string };
};

function rotuloTipo(tipo: string): string {
  if (tipo === "image/png") return "PNG";
  if (tipo === "image/jpeg") return "JPG";
  if (tipo === "text/plain") return "TXT";
  return "ARQ";
}

type EvidenciasListProps = {
  evidencias: Evidencia[];
  onExcluir: (id: string) => void;
};

export default function EvidenciasList({ evidencias, onExcluir }: EvidenciasListProps) {
  const [pending, startTransition] = useTransition();

  function excluir(id: string) {
    startTransition(async () => {
      const res = await excluirEvidencia(id);
      if (!res.error) onExcluir(id);
    });
  }

  return (
    <div className="flex h-full flex-col">
      <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
        Evidências {evidencias.length > 0 && `(${evidencias.length})`}
      </span>

      {evidencias.length === 0 ? (
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Nenhuma evidência anexada.</p>
      ) : (
        <ul className="mt-1 flex max-h-32 flex-col gap-1 overflow-y-auto pr-1">
          {evidencias.map((ev) => (
            <li key={ev.id} className="flex items-center gap-2 text-sm">
              <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {rotuloTipo(ev.tipo)}
              </span>
              <a
                href={ev.url}
                target="_blank"
                rel="noopener noreferrer"
                title={ev.nomeArquivo}
                className="min-w-0 flex-1 truncate text-blue-600 hover:underline dark:text-blue-400"
              >
                {ev.nomeArquivo}
              </a>
              <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                {formatarTamanhoArquivo(ev.tamanhoBytes)}
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() => excluir(ev.id)}
                title="Excluir evidência"
                className="shrink-0 text-gray-400 hover:text-red-600 disabled:opacity-50 dark:text-gray-500 dark:hover:text-red-400"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
