"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TURNO_LABELS, type Turno } from "@/lib/turno";
import { criarPassagemTurno } from "@/app/passagem-turno/actions";

type NovaPassagemTurnoFormProps = {
  turnoDestino: Turno;
};

export default function NovaPassagemTurnoForm({ turnoDestino }: NovaPassagemTurnoFormProps) {
  const router = useRouter();
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function enviar() {
    setErro(null);
    startTransition(async () => {
      const res = await criarPassagemTurno({ observacoes });
      if (res.error) {
        setErro(res.error);
        return;
      }
      if (res.id) router.push(`/passagem-turno/${res.id}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div>
        <span className="block text-xs text-gray-600 dark:text-gray-400">Passando o turno para</span>
        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
          {TURNO_LABELS[turnoDestino]}
        </p>
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
          disabled={pending}
          onClick={enviar}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Registrar passagem de turno
        </button>
      </div>
    </div>
  );
}
