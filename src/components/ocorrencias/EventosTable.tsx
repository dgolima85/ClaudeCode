"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { formatarDataHoraBR } from "@/lib/dataHoraBR";
import { criarEvento } from "@/app/ocorrencias/eventos-actions";
import { anexarEvidencia } from "@/app/ocorrencias/evidencias-actions";
import type { Evidencia } from "./EvidenciasList";

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
  onNovaEvidencia: (evidencia: Evidencia) => void;
};

export default function EventosTable({ ocorrenciaId, eventos, onNovoEvento, onNovaEvidencia }: EventosTableProps) {
  const [comentario, setComentario] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [enviandoEvidencia, startTransitionEvidencia] = useTransition();
  const inputArquivoRef = useRef<HTMLInputElement>(null);

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

  function selecionarEvidencia(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = ""; // permite anexar o mesmo arquivo de novo depois, se precisar
    if (!arquivo) return;
    setErro(null);
    startTransitionEvidencia(async () => {
      const formData = new FormData();
      formData.set("arquivo", arquivo);
      const res = await anexarEvidencia(ocorrenciaId, formData);
      if (res.error) {
        setErro(res.error);
        return;
      }
      if (res.evidencia) onNovaEvidencia(res.evidencia);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
        <textarea
          value={comentario}
          disabled={pending}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Descreva a ação realizada nesta ocorrência..."
          rows={2}
          className="w-full resize-none rounded border border-gray-300 bg-transparent px-2 py-1.5 text-sm dark:border-gray-600 dark:text-gray-100"
        />
        <div className="flex items-center justify-between">
          {erro ? <span className="text-xs text-red-600 dark:text-red-400">{erro}</span> : <span />}
          <div className="flex items-center gap-2">
            <input
              ref={inputArquivoRef}
              type="file"
              accept=".png,.jpg,.jpeg,.txt,image/png,image/jpeg,text/plain"
              className="hidden"
              onChange={selecionarEvidencia}
            />
            <button
              type="button"
              disabled={enviandoEvidencia}
              onClick={() => inputArquivoRef.current?.click()}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {enviandoEvidencia ? "Enviando..." : "Anexar evidência"}
            </button>
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
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Data e Hora</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Analista</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Comentário</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {eventos.map((evento) => (
              <tr key={evento.id}>
                <td className="whitespace-nowrap px-3 py-2 align-top text-gray-600 dark:text-gray-400">
                  {formatarDataHoraBR(evento.createdAt)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 align-top text-gray-600 dark:text-gray-400">
                  {evento.analista.nome}
                </td>
                <td className="px-3 py-2 align-top text-gray-800 dark:text-gray-200">{evento.comentario}</td>
              </tr>
            ))}
            {eventos.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-center text-gray-400 dark:text-gray-500">
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
