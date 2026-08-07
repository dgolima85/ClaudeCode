"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { criarEvento } from "@/app/ocorrencias/eventos-actions";

export type Evento = {
  id: string;
  comentario: string;
  createdAt: string;
  analista: { id: string; nome: string };
};

type EventosTableProps = {
  ocorrenciaId: string;
  eventos: Evento[];
  onNovoEvento: (evento: Evento) => void;
};

export default function EventosTable({ ocorrenciaId, eventos, onNovoEvento }: EventosTableProps) {
  const [comentario, setComentario] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function adicionar() {
    setErro(null);
    startTransition(async () => {
      const res = await criarEvento(ocorrenciaId, comentario);
      if (res.error) {
        setErro(res.error);
        return;
      }
      if (res.evento) {
        onNovoEvento(res.evento);
        setComentario("");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 p-3">
        <textarea
          value={comentario}
          disabled={pending}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Descreva a ação realizada nesta ocorrência..."
          rows={2}
          className="w-full resize-none rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
        <div className="flex items-center justify-between">
          {erro ? <span className="text-xs text-red-600">{erro}</span> : <span />}
          <button
            type="button"
            disabled={pending || !comentario.trim()}
            onClick={adicionar}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Adicionar evento
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Data e Hora</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Analista</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Comentário</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {eventos.map((evento) => (
              <tr key={evento.id}>
                <td className="whitespace-nowrap px-3 py-2 align-top text-gray-600">
                  {format(new Date(evento.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </td>
                <td className="whitespace-nowrap px-3 py-2 align-top text-gray-600">
                  {evento.analista.nome}
                </td>
                <td className="px-3 py-2 align-top text-gray-800">{evento.comentario}</td>
              </tr>
            ))}
            {eventos.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-center text-gray-400">
                  Nenhum evento registrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
