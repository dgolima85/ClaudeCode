"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmarPassagemTurno } from "@/app/passagem-turno/actions";

export default function ConfirmarPassagemTurnoButton({ id }: { id: string }) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmar() {
    setErro(null);
    startTransition(async () => {
      const res = await confirmarPassagemTurno(id);
      if (res.error) {
        setErro(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={confirmar}
        className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Confirmar recebimento
      </button>
      {erro && <p className="text-xs text-red-600 dark:text-red-400">{erro}</p>}
    </div>
  );
}
