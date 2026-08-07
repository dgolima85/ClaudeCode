"use client";

import { useState, useTransition } from "react";

type Tipo = { id: string; nome: string };

type NovaOcorrenciaRowProps = {
  tipos: Tipo[];
  onCriar: (dados: { tipoId: string; titulo: string; ticket: string }) => Promise<{ error?: string }>;
};

export default function NovaOcorrenciaRow({ tipos, onCriar }: NovaOcorrenciaRowProps) {
  const [tipoId, setTipoId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [ticket, setTicket] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function salvar() {
    setErro(null);
    startTransition(async () => {
      const res = await onCriar({ tipoId, titulo, ticket });
      if (res?.error) {
        setErro(res.error);
        return;
      }
      setTipoId("");
      setTitulo("");
      setTicket("");
    });
  }

  return (
    <tr className="bg-blue-50/60">
      <td className="px-3 py-2">
        <select
          value={tipoId}
          disabled={pending}
          onChange={(e) => setTipoId(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="">Selecione o tipo</option>
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2 text-xs text-gray-400">Em Andamento</td>
      <td className="px-3 py-2 text-xs text-gray-400">agora</td>
      <td className="px-3 py-2 text-xs text-gray-400">você</td>
      <td className="px-3 py-2">
        <input
          value={titulo}
          disabled={pending}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Breve descrição da ocorrência"
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
        />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <input
            value={ticket}
            disabled={pending}
            onChange={(e) => setTicket(e.target.value)}
            placeholder="Ticket (opcional)"
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
          />
          <button
            type="button"
            disabled={pending || !tipoId || !titulo.trim()}
            onClick={salvar}
            className="shrink-0 rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Adicionar
          </button>
        </div>
        {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
      </td>
    </tr>
  );
}
