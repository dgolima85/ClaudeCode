"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TURNOS, TURNO_LABELS, type Turno } from "@/lib/turno";
import { criarPassagemTurno } from "@/app/passagem-turno/actions";

export default function NovaPassagemTurnoForm() {
  const router = useRouter();
  const [turnoDestino, setTurnoDestino] = useState<Turno | "">("");
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function enviar() {
    setErro(null);
    startTransition(async () => {
      const res = await criarPassagemTurno({ turnoDestino, observacoes });
      if (res.error) {
        setErro(res.error);
        return;
      }
      if (res.id) router.push(`/passagem-turno/${res.id}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
          Passando o turno para
          <select
            value={turnoDestino}
            disabled={pending}
            onChange={(e) => setTurnoDestino(e.target.value as Turno)}
            className="rounded border border-gray-300 bg-transparent px-2 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
          >
            <option value="" disabled>
              Selecione o turno
            </option>
            {TURNOS.map((t) => (
              <option key={t} value={t}>
                {TURNO_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
        Observações para quem assume o turno
        <textarea
          value={observacoes}
          disabled={pending}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Destaques, atenção especial, contexto que não está nas ocorrências..."
          rows={4}
          className="rounded border border-gray-300 bg-transparent px-2 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600 dark:text-gray-100"
        />
      </label>

      {erro && <p className="text-xs text-red-600 dark:text-red-400">{erro}</p>}

      <div>
        <button
          type="button"
          disabled={pending || !turnoDestino}
          onClick={enviar}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Registrar passagem de turno
        </button>
      </div>
    </div>
  );
}
