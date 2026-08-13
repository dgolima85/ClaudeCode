"use client";

import { useState, useTransition } from "react";
import { paraInputDataHoraBR } from "@/lib/dataHoraBR";

type Tipo = { id: string; nome: string };

type NovaOcorrenciaFormProps = {
  tipos: Tipo[];
  onCriar: (dados: {
    tipoId: string;
    titulo: string;
    ticket: string;
    inicio: string;
  }) => Promise<{ error?: string }>;
};

export default function NovaOcorrenciaForm({ tipos, onCriar }: NovaOcorrenciaFormProps) {
  const [tipoId, setTipoId] = useState(() => tipos[0]?.id ?? "");
  const [titulo, setTitulo] = useState("");
  const [ticket, setTicket] = useState("");
  const [inicio, setInicio] = useState(() => paraInputDataHoraBR(new Date()));
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function salvar() {
    setErro(null);
    startTransition(async () => {
      const res = await onCriar({ tipoId, titulo, ticket, inicio });
      if (res?.error) {
        setErro(res.error);
        return;
      }
      setTipoId(tipos[0]?.id ?? "");
      setTitulo("");
      setTicket("");
      setInicio(paraInputDataHoraBR(new Date()));
    });
  }

  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-700">Nova Ocorrência</h2>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[16rem] flex-1 flex-col gap-1 text-xs text-gray-600">
          Título
          <input
            value={titulo}
            disabled={pending}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Breve descrição da ocorrência"
            className="rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </label>

        <label className="flex min-w-[10rem] flex-col gap-1 text-xs text-gray-600">
          Ticket
          <input
            value={ticket}
            disabled={pending}
            onChange={(e) => setTicket(e.target.value)}
            placeholder="Ticket (opcional)"
            className="rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </label>

        <label className="flex min-w-[12rem] flex-col gap-1 text-xs text-gray-600">
          Início
          <input
            type="datetime-local"
            value={inicio}
            disabled={pending}
            onChange={(e) => setInicio(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </label>

        <button
          type="button"
          disabled={pending || !tipoId || tipos.length === 0 || !titulo.trim() || !inicio}
          onClick={salvar}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>
      {erro && <p className="mt-2 text-xs text-red-600">{erro}</p>}
    </div>
  );
}
