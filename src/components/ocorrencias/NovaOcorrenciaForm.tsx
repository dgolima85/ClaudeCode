"use client";

import { useState, useTransition } from "react";
import { paraInputDataHoraBR } from "@/lib/dataHoraBR";
import { CRITICIDADES, CRITICIDADE_LABELS, type Criticidade } from "@/lib/criticidade";

type Tipo = { id: string; nome: string };

type NovaOcorrenciaFormProps = {
  tipos: Tipo[];
  onCriar: (dados: {
    tipoId: string;
    criticidade: string;
    titulo: string;
    ticket: string;
    inicio: string;
  }) => Promise<{ error?: string }>;
};

export default function NovaOcorrenciaForm({ tipos, onCriar }: NovaOcorrenciaFormProps) {
  const [tipoId, setTipoId] = useState(() => tipos[0]?.id ?? "");
  const [criticidade, setCriticidade] = useState<Criticidade | "">("");
  const [titulo, setTitulo] = useState("");
  const [ticket, setTicket] = useState("");
  const [inicio, setInicio] = useState(() => paraInputDataHoraBR(new Date()));
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function salvar() {
    setErro(null);
    startTransition(async () => {
      const res = await onCriar({ tipoId, criticidade, titulo, ticket, inicio });
      if (res?.error) {
        setErro(res.error);
        return;
      }
      setTipoId(tipos[0]?.id ?? "");
      setCriticidade("");
      setTitulo("");
      setTicket("");
      setInicio(paraInputDataHoraBR(new Date()));
    });
  }

  return (
    <div className="flex h-[240px] flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h2 className="shrink-0 text-sm font-semibold text-gray-700 dark:text-gray-300">Nova Ocorrência</h2>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
          Título
          <input
            value={titulo}
            disabled={pending}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Breve descrição da ocorrência"
            className="rounded border border-gray-300 bg-transparent px-2 py-1.5 text-sm dark:border-gray-600 dark:text-gray-100"
          />
        </label>

        <div className="grid grid-cols-3 gap-3">
          <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
            Criticidade
            <select
              value={criticidade}
              disabled={pending}
              onChange={(e) => setCriticidade(e.target.value as Criticidade)}
              className="rounded border border-gray-300 bg-transparent px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
            >
              <option value="" disabled>
                Selecione
              </option>
              {CRITICIDADES.map((c) => (
                <option key={c} value={c}>
                  {CRITICIDADE_LABELS[c]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
            Ticket
            <input
              value={ticket}
              disabled={pending}
              onChange={(e) => setTicket(e.target.value)}
              placeholder="Opcional"
              className="rounded border border-gray-300 bg-transparent px-2 py-1.5 text-sm dark:border-gray-600 dark:text-gray-100"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
            Início
            <input
              type="datetime-local"
              value={inicio}
              disabled={pending}
              onChange={(e) => setInicio(e.target.value)}
              className="rounded border border-gray-300 bg-transparent px-2 py-1.5 text-sm dark:border-gray-600 dark:text-gray-100 dark:[color-scheme:dark]"
            />
          </label>
        </div>

        <button
          type="button"
          disabled={pending || !tipoId || tipos.length === 0 || !criticidade || !titulo.trim() || !inicio}
          onClick={salvar}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>
      {erro && <p className="text-xs text-red-600 dark:text-red-400">{erro}</p>}
    </div>
  );
}
